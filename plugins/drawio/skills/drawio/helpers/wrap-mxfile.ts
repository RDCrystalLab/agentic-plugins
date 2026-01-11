/**
 * Wrap mxCell elements with full mxfile structure for draw.io
 *
 * Based on https://github.com/DayuanJiang/next-ai-draw-io
 */

/**
 * Wrap XML content with the full mxfile structure required by draw.io.
 * Always adds root cells (id="0" and id="1") automatically.
 * If input already contains root cells, they are removed to avoid duplication.
 * LLM should only generate mxCell elements starting from id="2".
 *
 * @param xml - The XML string (bare mxCells, or full structure)
 * @returns Full mxfile-wrapped XML string with root cells included
 */
export function wrapWithMxFile(xml: string): string {
  const ROOT_CELLS = '<mxCell id="0"/><mxCell id="1" parent="0"/>';

  if (!xml || !xml.trim()) {
    return `<mxfile host="app.diagrams.net" agent="Claude" version="21.0.0">
  <diagram name="Page-1" id="page-1">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0" defaultFontFamily="Helvetica">
      <root>
        ${ROOT_CELLS}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }

  // Already has full structure
  if (xml.includes("<mxfile")) {
    return xml;
  }

  // Has mxGraphModel but not mxfile
  if (xml.includes("<mxGraphModel")) {
    return `<mxfile host="app.diagrams.net" agent="Claude" version="21.0.0">
  <diagram name="Page-1" id="page-1">
    ${xml}
  </diagram>
</mxfile>`;
  }

  // Has <root> wrapper - extract inner content
  let content = xml;
  if (xml.includes("<root>")) {
    content = xml.replace(/<\/?root>/g, "").trim();
  }

  // Strip trailing LLM wrapper tags (from any provider: Anthropic, DeepSeek, etc.)
  // Find the last valid mxCell ending and remove everything after it
  const lastSelfClose = content.lastIndexOf("/>");
  const lastMxCellClose = content.lastIndexOf("</mxCell>");
  const lastValidEnd = Math.max(lastSelfClose, lastMxCellClose);
  if (lastValidEnd !== -1) {
    const endOffset = lastMxCellClose > lastSelfClose ? 9 : 2;
    const suffix = content.slice(lastValidEnd + endOffset);
    // If suffix is only closing tags (wrapper tags) or whitespace, strip it
    if (/^(\s*<\/[^>]+>)*\s*$/.test(suffix)) {
      content = content.slice(0, lastValidEnd + endOffset);
    }
  }

  // Remove any existing root cells from content (LLM shouldn't include them, but handle it gracefully)
  // Use flexible patterns that match both self-closing (/>) and non-self-closing (></mxCell>) formats
  content = content
    .replace(/<mxCell[^>]*\bid=["']0["'][^>]*(?:\/>|><\/mxCell>)/g, "")
    .replace(/<mxCell[^>]*\bid=["']1["'][^>]*(?:\/>|><\/mxCell>)/g, "")
    .trim();

  return `<mxfile host="app.diagrams.net" agent="Claude" version="21.0.0">
  <diagram name="Page-1" id="page-1">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0" defaultFontFamily="Helvetica">
      <root>
        ${ROOT_CELLS}
        ${content}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

/**
 * Check if mxCell XML output is complete (not truncated).
 * Uses a robust approach that handles any LLM provider's wrapper tags.
 *
 * @param xml - The XML string to check
 * @returns true if XML appears complete, false if truncated or empty
 */
export function isMxCellXmlComplete(xml: string | undefined | null): boolean {
  const trimmed = xml?.trim() || "";
  if (!trimmed) return false;

  // Find position of last complete mxCell ending (either /> or </mxCell>)
  const lastSelfClose = trimmed.lastIndexOf("/>");
  const lastMxCellClose = trimmed.lastIndexOf("</mxCell>");

  const lastValidEnd = Math.max(lastSelfClose, lastMxCellClose);

  // No valid ending found at all
  if (lastValidEnd === -1) return false;

  // Check what comes after the last valid ending
  const endOffset = lastMxCellClose > lastSelfClose ? 9 : 2;
  const suffix = trimmed.slice(lastValidEnd + endOffset);

  // If suffix is empty or only contains closing tags or whitespace, it's complete
  return /^(\s*<\/[^>]+>)*\s*$/.test(suffix);
}

/**
 * Extract only complete mxCell elements from partial/streaming XML.
 * This allows progressive rendering during streaming.
 *
 * @param xml - The partial XML string
 * @returns XML string containing only complete mxCell elements
 */
export function extractCompleteMxCells(xml: string | undefined | null): string {
  if (!xml) return "";

  const completeCells: Array<{ index: number; text: string }> = [];

  // Match self-closing mxCell tags: <mxCell ... />
  const selfClosingPattern = /<mxCell\s+[^>]*\/>/g;
  // Match mxCell with nested mxGeometry: <mxCell ...>...</mxCell>
  const nestedPattern = /<mxCell\s+[^>]*>[\s\S]*?<\/mxCell>/g;

  let match: RegExpExecArray | null;
  while ((match = selfClosingPattern.exec(xml)) !== null) {
    completeCells.push({ index: match.index, text: match[0] });
  }

  while ((match = nestedPattern.exec(xml)) !== null) {
    completeCells.push({ index: match.index, text: match[0] });
  }

  // Sort by position to maintain order
  completeCells.sort((a, b) => a.index - b.index);

  // Remove duplicates
  const seen = new Set<number>();
  const uniqueCells = completeCells.filter((cell) => {
    if (seen.has(cell.index)) return false;
    seen.add(cell.index);
    return true;
  });

  return uniqueCells.map((c) => c.text).join("\n");
}

// CLI usage
if (typeof process !== "undefined" && process.argv[1]?.includes("wrap-mxfile")) {
  const fs = await import("fs");
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!inputFile) {
    console.error("Usage: bun wrap-mxfile.ts <input.xml> [output.drawio]");
    process.exit(1);
  }

  const input = fs.readFileSync(inputFile, "utf-8");
  const output = wrapWithMxFile(input);

  if (outputFile) {
    fs.writeFileSync(outputFile, output);
    console.log(`Written to ${outputFile}`);
  } else {
    console.log(output);
  }
}
