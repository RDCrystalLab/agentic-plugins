#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "rich>=13.7.0",
# ]
# ///

"""
Download all images from a GitHub issue (supports private repos).

Fetches rendered HTML via `gh api` to obtain signed CDN URLs for private repo
image assets, then downloads them locally.

Usage:
    uv run download-issue-images.py <owner/repo> <issue_number> <output_dir> [--prefix PREFIX]
    uv run download-issue-images.py gorilla-ai/poc-crypto-analysis 11 ./assets
    uv run download-issue-images.py gorilla-ai/poc-crypto-analysis 11 ./assets --prefix issue11

Output format (per image):
    asset_uuid | local_filename | file_size_bytes
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

from rich.console import Console
from rich.table import Table

console = Console()

# Patterns for extracting image URLs from GitHub rendered HTML
PRIVATE_IMAGE_RE = re.compile(
    r"https://private-user-images\.githubusercontent\.com/[^\"\\\s]+"
)
PUBLIC_IMAGE_RE = re.compile(
    r"https://user-images\.githubusercontent\.com/[^\"\\\s]+"
)
ASSET_UUID_RE = re.compile(
    r"[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"
)
EXTENSION_MAP = {".jpg": "jpg", ".jpeg": "jpeg", ".gif": "gif", ".webp": "webp", ".svg": "svg"}


def gh_api_html(endpoint: str) -> str:
    """Fetch GitHub API endpoint as rendered HTML."""
    try:
        result = subprocess.run(
            ["gh", "api", endpoint, "-H", "Accept: application/vnd.github.html+json"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.stdout if result.returncode == 0 else ""
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return ""


def extract_image_urls(html: str) -> list[str]:
    """Extract signed image URLs from GitHub rendered HTML."""
    urls = list(set(PRIVATE_IMAGE_RE.findall(html)))
    if not urls:
        urls = list(set(PUBLIC_IMAGE_RE.findall(html)))
    return sorted(urls)


def detect_extension(url: str) -> str:
    """Detect image file extension from URL."""
    url_lower = url.lower()
    for pattern, ext in EXTENSION_MAP.items():
        if pattern in url_lower:
            return ext
    return "png"


def download_image(url: str, filepath: Path) -> int:
    """Download image via curl. Returns file size or 0 on failure."""
    try:
        subprocess.run(
            ["curl", "-sL", url, "-o", str(filepath)],
            timeout=30,
            check=True,
        )
        size = filepath.stat().st_size
        if size <= 100:
            filepath.unlink(missing_ok=True)
            return 0
        return size
    except (subprocess.SubprocessError, OSError):
        filepath.unlink(missing_ok=True)
        return 0


def download_from_endpoint(
    endpoint: str,
    source_label: str,
    output_dir: Path,
    prefix: str,
) -> list[dict]:
    """Download all images from a GitHub API endpoint."""
    html = gh_api_html(endpoint)
    if not html:
        return []

    urls = extract_image_urls(html)
    if not urls:
        return []

    results = []
    for i, url in enumerate(urls, 1):
        # Extract asset UUID
        uuid_match = ASSET_UUID_RE.search(url)
        asset_id = uuid_match.group(0) if uuid_match else f"img-{i}"

        ext = detect_extension(url)
        filename = f"{prefix}-{source_label}-{i}.{ext}"
        filepath = output_dir / filename

        size = download_image(url, filepath)
        results.append({
            "asset_id": asset_id,
            "filename": filename if size > 0 else "FAILED",
            "size": size,
            "source": source_label,
        })

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Download images from a GitHub issue (supports private repos)"
    )
    parser.add_argument("repo", help="Repository in owner/repo format")
    parser.add_argument("issue", type=int, help="Issue number")
    parser.add_argument("output_dir", help="Directory to save images")
    parser.add_argument("--prefix", default=None, help="Filename prefix (default: issue<N>)")
    args = parser.parse_args()

    prefix = args.prefix or f"issue{args.issue}"
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    console.print(f"\n[bold]Downloading images from {args.repo}#{args.issue}[/bold]\n")

    # Download from issue body
    results = download_from_endpoint(
        f"repos/{args.repo}/issues/{args.issue}",
        "body",
        output_dir,
        prefix,
    )

    # Download from issue comments
    results.extend(
        download_from_endpoint(
            f"repos/{args.repo}/issues/{args.issue}/comments",
            "comment",
            output_dir,
            prefix,
        )
    )

    if not results:
        console.print("[yellow]No images found.[/yellow]")
        return

    # Display results
    table = Table(title=f"Images from {args.repo}#{args.issue}")
    table.add_column("Asset ID", style="dim", max_width=36)
    table.add_column("Filename")
    table.add_column("Size", justify="right")
    table.add_column("Status")

    success = 0
    failed = 0
    for r in results:
        if r["size"] > 0:
            size_str = f"{r['size']:,} B"
            status = "[green]OK[/green]"
            success += 1
        else:
            size_str = "-"
            status = "[red]FAILED[/red]"
            failed += 1

        table.add_row(r["asset_id"][:8] + "...", r["filename"], size_str, status)

    console.print(table)
    console.print(f"\n[bold]Summary:[/bold] {success} downloaded, {failed} failed")
    console.print(f"[bold]Output:[/bold] {output_dir.resolve()}\n")

    # Print machine-readable output for piping
    for r in results:
        print(f"{r['asset_id']}|{r['filename']}|{r['size']}", file=sys.stderr if r["size"] == 0 else sys.stdout)


if __name__ == "__main__":
    main()
