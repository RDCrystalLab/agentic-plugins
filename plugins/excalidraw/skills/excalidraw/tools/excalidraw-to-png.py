#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "playwright>=1.40.0",
# ]
# ///
"""
Convert .excalidraw files to .excalidraw.png with native hand-drawn rendering.

Uses Playwright + Excalidraw's exportToSvg() for pixel-perfect rendering,
then embeds the Excalidraw JSON into PNG metadata (tEXt chunk) so the output
is editable in VS Code's Excalidraw extension.

First-time setup:
    uv run playwright install chromium

Usage:
    uv run excalidraw-to-png.py diagram.excalidraw
    uv run excalidraw-to-png.py diagram.excalidraw -o output.excalidraw.png
    uv run excalidraw-to-png.py diagram.excalidraw --scale 3
"""

import argparse
import json
import struct
import sys
import tempfile
import zlib
from pathlib import Path

# HTML template that loads Excalidraw from CDN via ?bundle (includes React)
# and exposes a renderDiagram() function called from Python via page.evaluate().
# Based on coleam00/excalidraw-diagram-skill render_template.html.
RENDER_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #ffffff; overflow: hidden; }
    #root { display: inline-block; }
    #root svg { display: block; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { exportToSvg } from "https://esm.sh/@excalidraw/excalidraw?bundle";

    window.renderDiagram = async function(jsonData) {
      try {
        const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
        const elements = data.elements || [];
        const appState = data.appState || {};
        const files = data.files || {};

        appState.viewBackgroundColor = appState.viewBackgroundColor || "#ffffff";
        appState.exportWithDarkMode = false;

        const svg = await exportToSvg({
          elements: elements,
          appState: { ...appState, exportBackground: true },
          files: files,
        });

        const root = document.getElementById("root");
        root.innerHTML = "";
        root.appendChild(svg);

        window.__renderComplete = true;
        window.__renderError = null;
        return { success: true, width: svg.getAttribute("width"), height: svg.getAttribute("height") };
      } catch (err) {
        window.__renderComplete = true;
        window.__renderError = err.message;
        return { success: false, error: err.message };
      }
    };

    window.__moduleReady = true;
  </script>
</body>
</html>"""


def validate_excalidraw(data: dict) -> list[str]:
    """Validate Excalidraw JSON structure. Returns list of errors (empty = valid)."""
    errors: list[str] = []
    if data.get("type") != "excalidraw":
        errors.append(f"Expected type 'excalidraw', got '{data.get('type')}'")
    if "elements" not in data:
        errors.append("Missing 'elements' array")
    elif not isinstance(data["elements"], list):
        errors.append("'elements' must be an array")
    elif len(data["elements"]) == 0:
        errors.append("'elements' array is empty — nothing to render")
    return errors


def compute_bounding_box(
    elements: list,
) -> tuple[float, float, float, float]:
    """Compute bounding box (min_x, min_y, max_x, max_y) of visible elements."""
    min_x = min_y = float("inf")
    max_x = max_y = float("-inf")

    for elem in elements:
        if elem.get("isDeleted"):
            continue
        etype = elem.get("type", "")
        if etype == "cameraUpdate":
            continue

        x = elem.get("x", 0)
        y = elem.get("y", 0)
        w = elem.get("width", 0)
        h = elem.get("height", 0)

        if etype in ("arrow", "line") and "points" in elem:
            for px, py in elem["points"]:
                min_x = min(min_x, x + px)
                min_y = min(min_y, y + py)
                max_x = max(max_x, x + px)
                max_y = max(max_y, y + py)
        else:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x + abs(w))
            max_y = max(max_y, y + abs(h))

    if min_x == float("inf"):
        return 0, 0, 800, 600

    return min_x, min_y, max_x, max_y


def create_png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    """Create a PNG chunk with proper CRC."""
    length = struct.pack(">I", len(data))
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    crc_bytes = struct.pack(">I", crc)
    return length + chunk_type + data + crc_bytes


def embed_metadata(png_bytes: bytes, excalidraw_data: dict) -> bytes:
    """Embed Excalidraw JSON into PNG as a tEXt metadata chunk.

    Uses the same bstring encoding as Excalidraw/VS Code so the resulting
    .excalidraw.png is editable in the Excalidraw VS Code extension.
    """
    json_str = json.dumps(excalidraw_data, separators=(",", ":"))
    compressed = zlib.compress(json_str.encode("utf-8"))

    # Escape compressed bytes for bstring encoding
    escaped_parts = []
    for byte in compressed:
        if byte == ord("\\"):
            escaped_parts.append(b"\\\\")
        elif byte == ord('"'):
            escaped_parts.append(b'\\"')
        elif byte < 0x20:
            escaped_parts.append(f"\\u{byte:04x}".encode("ascii"))
        else:
            escaped_parts.append(bytes([byte]))
    escaped_compressed = b"".join(escaped_parts)

    metadata_payload = (
        b'{"version":"1","encoding":"bstring","compressed":true,"encoded":"'
        + escaped_compressed
        + b'"}'
    )

    keyword = b"application/vnd.excalidraw+json"
    text_data = keyword + b"\x00" + metadata_payload
    text_chunk = create_png_chunk(b"tEXt", text_data)

    # Insert tEXt chunk before IEND
    png_signature = png_bytes[:8]
    chunks_data = png_bytes[8:]
    output_parts = [png_signature]

    pos = 0
    while pos < len(chunks_data):
        length = struct.unpack(">I", chunks_data[pos : pos + 4])[0]
        chunk_type = chunks_data[pos + 4 : pos + 8]
        chunk_end = pos + 12 + length

        if chunk_type == b"IEND":
            output_parts.append(text_chunk)

        output_parts.append(chunks_data[pos:chunk_end])
        pos = chunk_end

    return b"".join(output_parts)


def render_with_playwright(
    excalidraw_data: dict,
    scale: int = 2,
    width: int | None = None,
) -> bytes:
    """Render Excalidraw data to PNG bytes using Playwright + Excalidraw CDN.

    Uses the renderDiagram() pattern from coleam00/excalidraw-diagram-skill:
    1. Load HTML template (Excalidraw module loads via esm.sh ?bundle)
    2. Wait for module ready signal
    3. Inject diagram data via page.evaluate()
    4. Screenshot the rendered SVG element
    """
    from playwright.sync_api import sync_playwright

    # Compute viewport from element bounding box
    elements = excalidraw_data.get("elements", [])
    min_x, min_y, max_x, max_y = compute_bounding_box(elements)
    padding = 80
    diagram_w = max_x - min_x + padding * 2
    diagram_h = max_y - min_y + padding * 2
    vw = width or min(max(int(diagram_w), 800), 1920)
    vh = max(int(diagram_h), 600)

    with tempfile.NamedTemporaryFile(
        suffix=".html", mode="w", encoding="utf-8", delete=False
    ) as f:
        f.write(RENDER_TEMPLATE)
        html_path = Path(f.name)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                viewport={"width": vw, "height": vh},
                device_scale_factor=scale,
            )

            page.goto(html_path.as_uri())

            # Wait for the ES module to load (imports from esm.sh)
            page.wait_for_function(
                "window.__moduleReady === true", timeout=30_000
            )

            # Inject diagram data and render via the exposed function
            json_str = json.dumps(excalidraw_data)
            result = page.evaluate(f"window.renderDiagram({json_str})")

            if not result or not result.get("success"):
                error_msg = (
                    result.get("error", "Unknown render error")
                    if result
                    else "renderDiagram returned null"
                )
                raise RuntimeError(f"Excalidraw render error: {error_msg}")

            # Wait for render completion
            page.wait_for_function(
                "window.__renderComplete === true", timeout=15_000
            )

            # Screenshot the rendered SVG element
            svg_el = page.query_selector("#root svg")
            if svg_el is None:
                raise RuntimeError("No SVG element found after render")

            png_bytes = svg_el.screenshot(type="png")
            browser.close()
    finally:
        html_path.unlink(missing_ok=True)

    return png_bytes


def excalidraw_to_png(
    input_path: Path,
    output_path: Path | None = None,
    scale: int = 2,
    width: int | None = None,
) -> None:
    """Convert an .excalidraw file to .excalidraw.png."""
    if not input_path.exists():
        print(f"Error: File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_path}: {e}", file=sys.stderr)
        sys.exit(1)

    errors = validate_excalidraw(data)
    if errors:
        print("Error: Invalid Excalidraw file:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        sys.exit(1)

    if output_path is None:
        output_path = input_path.with_suffix(".excalidraw.png")

    elements = [e for e in data.get("elements", []) if not e.get("isDeleted")]
    print(f"Rendering {input_path.name} ({len(elements)} elements)...")

    try:
        png_bytes = render_with_playwright(data, scale=scale, width=width)
    except Exception as exc:
        msg = str(exc)
        if "Executable doesn't exist" in msg or "browserType.launch" in msg:
            print(
                "Error: Chromium not installed. Run this first:\n"
                "  uv run playwright install chromium",
                file=sys.stderr,
            )
            sys.exit(1)
        raise

    final_bytes = embed_metadata(png_bytes, data)
    output_path.write_bytes(final_bytes)

    print(f"Created: {output_path}")
    print(f"  Elements: {len(elements)}")
    print(f"  Scale: {scale}x")
    print(f"  Size: {len(final_bytes):,} bytes")


def main():
    parser = argparse.ArgumentParser(
        description="Convert .excalidraw to .excalidraw.png with native rendering",
    )
    parser.add_argument("input", type=Path, help="Input .excalidraw file")
    parser.add_argument(
        "--output", "-o", type=Path, help="Output path (default: <input>.excalidraw.png)"
    )
    parser.add_argument(
        "--scale", "-s", type=int, default=2, help="Device scale factor (default: 2)"
    )
    parser.add_argument(
        "--width", "-w", type=int, help="Override viewport width in CSS pixels"
    )

    args = parser.parse_args()
    excalidraw_to_png(args.input, args.output, args.scale, args.width)


if __name__ == "__main__":
    main()
