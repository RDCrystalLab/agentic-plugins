/**
 * XML Validation and Auto-Fix for draw.io diagrams
 *
 * Based on https://github.com/DayuanJiang/next-ai-draw-io
 * Ported from packages/mcp-server/src/xml-validation.ts
 */

// ============================================================================
// Constants
// ============================================================================

/** Maximum XML size to process (1MB) */
const MAX_XML_SIZE = 1_000_000;

/** Maximum iterations for aggressive cell dropping */
const MAX_DROP_ITERATIONS = 10;

/** Structural attributes that should not be duplicated */
const STRUCTURAL_ATTRS = [
  "edge",
  "parent",
  "source",
  "target",
  "vertex",
  "connectable",
];

/** Valid XML entity names */
const VALID_ENTITIES = new Set(["lt", "gt", "amp", "quot", "apos"]);

// ============================================================================
// XML Parsing Helpers
// ============================================================================

interface ParsedTag {
  tag: string;
  tagName: string;
  isClosing: boolean;
  isSelfClosing: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse XML tags while properly handling quoted strings
 */
function parseXmlTags(xml: string): ParsedTag[] {
  const tags: ParsedTag[] = [];
  let i = 0;

  while (i < xml.length) {
    const tagStart = xml.indexOf("<", i);
    if (tagStart === -1) break;

    let tagEnd = tagStart + 1;
    let inQuote = false;
    let quoteChar = "";

    while (tagEnd < xml.length) {
      const c = xml[tagEnd];
      if (inQuote) {
        if (c === quoteChar) inQuote = false;
      } else {
        if (c === '"' || c === "'") {
          inQuote = true;
          quoteChar = c;
        } else if (c === ">") {
          break;
        }
      }
      tagEnd++;
    }

    if (tagEnd >= xml.length) break;

    const tag = xml.substring(tagStart, tagEnd + 1);
    i = tagEnd + 1;

    const tagMatch = /^<(\/?)([a-zA-Z][a-zA-Z0-9:_-]*)/.exec(tag);
    if (!tagMatch) continue;

    tags.push({
      tag,
      tagName: tagMatch[2],
      isClosing: tagMatch[1] === "/",
      isSelfClosing: tag.endsWith("/>"),
      startIndex: tagStart,
      endIndex: tagEnd,
    });
  }

  return tags;
}

// ============================================================================
// Validation Helper Functions
// ============================================================================

function checkDuplicateAttributes(xml: string): string | null {
  const structuralSet = new Set(STRUCTURAL_ATTRS);
  const tagPattern = /<[^>]+>/g;
  let tagMatch;
  while ((tagMatch = tagPattern.exec(xml)) !== null) {
    const tag = tagMatch[0];
    const attrPattern = /\s([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=/g;
    const attributes = new Map<string, number>();
    let attrMatch;
    while ((attrMatch = attrPattern.exec(tag)) !== null) {
      const attrName = attrMatch[1];
      attributes.set(attrName, (attributes.get(attrName) || 0) + 1);
    }
    const duplicates = Array.from(attributes.entries())
      .filter(([name, count]) => count > 1 && structuralSet.has(name))
      .map(([name]) => name);
    if (duplicates.length > 0) {
      return `Invalid XML: Duplicate structural attribute(s): ${duplicates.join(", ")}`;
    }
  }
  return null;
}

function checkDuplicateIds(xml: string): string | null {
  const idPattern = /\bid\s*=\s*["']([^"']+)["']/gi;
  const ids = new Map<string, number>();
  let idMatch;
  while ((idMatch = idPattern.exec(xml)) !== null) {
    const id = idMatch[1];
    ids.set(id, (ids.get(id) || 0) + 1);
  }
  const duplicateIds = Array.from(ids.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `'${id}' (${count}x)`);
  if (duplicateIds.length > 0) {
    return `Invalid XML: Found duplicate ID(s): ${duplicateIds.slice(0, 3).join(", ")}`;
  }
  return null;
}

function checkTagMismatches(xml: string): string | null {
  const xmlWithoutComments = xml.replace(/<!--[\s\S]*?-->/g, "");
  const tags = parseXmlTags(xmlWithoutComments);
  const tagStack: string[] = [];

  for (const { tagName, isClosing, isSelfClosing } of tags) {
    if (isClosing) {
      if (tagStack.length === 0) {
        return `Invalid XML: Closing tag </${tagName}> without matching opening tag`;
      }
      const expected = tagStack.pop();
      if (expected?.toLowerCase() !== tagName.toLowerCase()) {
        return `Invalid XML: Expected closing tag </${expected}> but found </${tagName}>`;
      }
    } else if (!isSelfClosing) {
      tagStack.push(tagName);
    }
  }
  if (tagStack.length > 0) {
    return `Invalid XML: Document has ${tagStack.length} unclosed tag(s): ${tagStack.join(", ")}`;
  }
  return null;
}

function checkCharacterReferences(xml: string): string | null {
  const charRefPattern = /&#x?[^;]+;?/g;
  let charMatch;
  while ((charMatch = charRefPattern.exec(xml)) !== null) {
    const ref = charMatch[0];
    if (ref.startsWith("&#x")) {
      if (!ref.endsWith(";")) {
        return `Invalid XML: Missing semicolon after hex reference: ${ref}`;
      }
      const hexDigits = ref.substring(3, ref.length - 1);
      if (hexDigits.length === 0 || !/^[0-9a-fA-F]+$/.test(hexDigits)) {
        return `Invalid XML: Invalid hex character reference: ${ref}`;
      }
    } else if (ref.startsWith("&#")) {
      if (!ref.endsWith(";")) {
        return `Invalid XML: Missing semicolon after decimal reference: ${ref}`;
      }
      const decDigits = ref.substring(2, ref.length - 1);
      if (decDigits.length === 0 || !/^[0-9]+$/.test(decDigits)) {
        return `Invalid XML: Invalid decimal character reference: ${ref}`;
      }
    }
  }
  return null;
}

function checkEntityReferences(xml: string): string | null {
  const xmlWithoutComments = xml.replace(/<!--[\s\S]*?-->/g, "");
  const bareAmpPattern = /&(?!(?:lt|gt|amp|quot|apos|#))/g;
  if (bareAmpPattern.test(xmlWithoutComments)) {
    return "Invalid XML: Found unescaped & character(s). Replace & with &amp;";
  }
  const invalidEntityPattern = /&([a-zA-Z][a-zA-Z0-9]*);/g;
  let entityMatch;
  while ((entityMatch = invalidEntityPattern.exec(xmlWithoutComments)) !== null) {
    if (!VALID_ENTITIES.has(entityMatch[1])) {
      return `Invalid XML: Invalid entity reference: &${entityMatch[1]};`;
    }
  }
  return null;
}

function checkNestedMxCells(xml: string): string | null {
  const cellTagPattern = /<\/?mxCell[^>]*>/g;
  const cellStack: number[] = [];
  let cellMatch;
  while ((cellMatch = cellTagPattern.exec(xml)) !== null) {
    const tag = cellMatch[0];
    if (tag.startsWith("</mxCell>")) {
      if (cellStack.length > 0) cellStack.pop();
    } else if (!tag.endsWith("/>")) {
      const isLabelOrGeometry =
        /\sas\s*=\s*["'](valueLabel|geometry)["']/.test(tag);
      if (!isLabelOrGeometry) {
        cellStack.push(cellMatch.index);
        if (cellStack.length > 1) {
          return "Invalid XML: Found nested mxCell tags. Cells should be siblings.";
        }
      }
    }
  }
  return null;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates draw.io XML structure for common issues
 *
 * @param xml - The XML string to validate
 * @returns null if valid, error message string if invalid
 */
export function validateMxCellStructure(xml: string): string | null {
  if (xml.length > MAX_XML_SIZE) {
    console.warn(
      `[validateMxCellStructure] XML size (${xml.length}) exceeds ${MAX_XML_SIZE} bytes`
    );
  }

  // 1. Check for CDATA wrapper
  if (/^\s*<!\[CDATA\[/.test(xml)) {
    return "Invalid XML: XML is wrapped in CDATA section";
  }

  // 2. Check for duplicate structural attributes
  const dupAttrError = checkDuplicateAttributes(xml);
  if (dupAttrError) return dupAttrError;

  // 3. Check for unescaped < in attribute values
  const attrValuePattern = /=\s*"([^"]*)"/g;
  let attrValMatch;
  while ((attrValMatch = attrValuePattern.exec(xml)) !== null) {
    const value = attrValMatch[1];
    if (/</.test(value) && !/&lt;/.test(value)) {
      return "Invalid XML: Unescaped < character in attribute values";
    }
  }

  // 4. Check for duplicate IDs
  const dupIdError = checkDuplicateIds(xml);
  if (dupIdError) return dupIdError;

  // 5. Check for tag mismatches
  const tagMismatchError = checkTagMismatches(xml);
  if (tagMismatchError) return tagMismatchError;

  // 6. Check invalid character references
  const charRefError = checkCharacterReferences(xml);
  if (charRefError) return charRefError;

  // 7. Check for invalid comment syntax
  const commentPattern = /<!--([\s\S]*?)-->/g;
  let commentMatch;
  while ((commentMatch = commentPattern.exec(xml)) !== null) {
    if (/--/.test(commentMatch[1])) {
      return "Invalid XML: Comment contains -- (double hyphen)";
    }
  }

  // 8. Check for unescaped entity references
  const entityError = checkEntityReferences(xml);
  if (entityError) return entityError;

  // 9. Check for empty id attributes on mxCell
  if (/<mxCell[^>]*\sid\s*=\s*["']\s*["'][^>]*>/g.test(xml)) {
    return "Invalid XML: Found mxCell element(s) with empty id attribute";
  }

  // 10. Check for nested mxCell tags
  const nestedCellError = checkNestedMxCells(xml);
  if (nestedCellError) return nestedCellError;

  return null;
}

// ============================================================================
// Auto-Fix Function
// ============================================================================

/**
 * Attempts to auto-fix common XML issues in draw.io diagrams
 *
 * @param xml - The XML string to fix
 * @returns Object with fixed XML and list of fixes applied
 */
export function autoFixXml(xml: string): { fixed: string; fixes: string[] } {
  let fixed = xml;
  const fixes: string[] = [];

  // 1. Fix JSON-escaped XML
  if (/=\\"/.test(fixed)) {
    fixed = fixed.replace(/\\"/g, '"');
    fixed = fixed.replace(/\\n/g, "\n");
    fixes.push("Fixed JSON-escaped XML");
  }

  // 2. Remove CDATA wrapper
  if (/^\s*<!\[CDATA\[/.test(fixed)) {
    fixed = fixed.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "");
    fixes.push("Removed CDATA wrapper");
  }

  // 3. Strip trailing LLM wrapper tags
  const lastSelfClose = fixed.lastIndexOf("/>");
  const lastMxCellClose = fixed.lastIndexOf("</mxCell>");
  const lastValidEnd = Math.max(lastSelfClose, lastMxCellClose);
  if (lastValidEnd !== -1) {
    const endOffset = lastMxCellClose > lastSelfClose ? 9 : 2;
    const suffix = fixed.slice(lastValidEnd + endOffset);
    if (/^(\s*<\/[^>]+>)+\s*$/.test(suffix)) {
      fixed = fixed.slice(0, lastValidEnd + endOffset);
      fixes.push("Stripped trailing LLM wrapper tags");
    }
  }

  // 4. Remove text before XML root
  const xmlStart = fixed.search(/<(\?xml|mxGraphModel|mxfile)/i);
  if (xmlStart > 0 && !/^<[a-zA-Z]/.test(fixed.trim())) {
    fixed = fixed.substring(xmlStart);
    fixes.push("Removed text before XML root");
  }

  // 5. Fix duplicate attributes
  let dupAttrFixed = false;
  fixed = fixed.replace(/<[^>]+>/g, (tag) => {
    let newTag = tag;
    for (const attr of STRUCTURAL_ATTRS) {
      const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, "gi");
      const matches = tag.match(attrRegex);
      if (matches && matches.length > 1) {
        let firstKept = false;
        newTag = newTag.replace(attrRegex, (m) => {
          if (!firstKept) {
            firstKept = true;
            return m;
          }
          dupAttrFixed = true;
          return "";
        });
      }
    }
    return newTag;
  });
  if (dupAttrFixed) {
    fixes.push("Removed duplicate structural attributes");
  }

  // 6. Fix unescaped & characters
  const ampersandPattern =
    /&(?!(?:lt|gt|amp|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/g;
  if (ampersandPattern.test(fixed)) {
    fixed = fixed.replace(
      /&(?!(?:lt|gt|amp|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/g,
      "&amp;"
    );
    fixes.push("Escaped unescaped & characters");
  }

  // 7. Fix double-escaped entities
  const invalidEntities = [
    { pattern: /&ampquot;/g, replacement: "&quot;" },
    { pattern: /&amplt;/g, replacement: "&lt;" },
    { pattern: /&ampgt;/g, replacement: "&gt;" },
    { pattern: /&ampapos;/g, replacement: "&apos;" },
    { pattern: /&ampamp;/g, replacement: "&amp;" },
  ];
  for (const { pattern, replacement } of invalidEntities) {
    if (pattern.test(fixed)) {
      fixed = fixed.replace(pattern, replacement);
      fixes.push(`Fixed double-escaped entity`);
    }
  }

  // 8. Fix malformed attribute quotes
  const malformedQuotePattern = /(\s[a-zA-Z][a-zA-Z0-9_:-]*)=&quot;/;
  if (malformedQuotePattern.test(fixed)) {
    fixed = fixed.replace(
      /(\s[a-zA-Z][a-zA-Z0-9_:-]*)=&quot;([^&]*?)&quot;/g,
      '$1="$2"'
    );
    fixes.push("Fixed malformed attribute quotes");
  }

  // 9. Fix missing space between attributes
  const missingSpacePattern = /("[^"]*")([a-zA-Z][a-zA-Z0-9_:-]*=)/g;
  if (missingSpacePattern.test(fixed)) {
    fixed = fixed.replace(/("[^"]*")([a-zA-Z][a-zA-Z0-9_:-]*=)/g, "$1 $2");
    fixes.push("Added missing space between attributes");
  }

  // 10. Fix unescaped < and > in attribute values
  const attrPattern = /(=\s*")([^"]*?)(<)([^"]*?)(")/g;
  let attrMatch;
  let hasUnescapedLt = false;
  while ((attrMatch = attrPattern.exec(fixed)) !== null) {
    if (!attrMatch[3].startsWith("&lt;")) {
      hasUnescapedLt = true;
      break;
    }
  }
  if (hasUnescapedLt) {
    fixed = fixed.replace(/=\s*"([^"]*)"/g, (_match, value) => {
      const escaped = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `="${escaped}"`;
    });
    fixes.push("Escaped <> characters in attribute values");
  }

  // 11. Fix <Cell> tags to <mxCell>
  const hasCellTags = /<\/?Cell[\s>]/i.test(fixed);
  if (hasCellTags) {
    fixed = fixed.replace(/<Cell(\s)/gi, "<mxCell$1");
    fixed = fixed.replace(/<Cell>/gi, "<mxCell>");
    fixed = fixed.replace(/<\/Cell>/gi, "</mxCell>");
    fixes.push("Fixed <Cell> tags to <mxCell>");
  }

  // 12. Fix common closing tag typos
  const tagTypos = [
    { wrong: /<\/mxElement>/gi, right: "</mxCell>" },
    { wrong: /<\/mxcell>/g, right: "</mxCell>" },
    { wrong: /<\/mxgeometry>/g, right: "</mxGeometry>" },
    { wrong: /<\/mxpoint>/g, right: "</mxPoint>" },
    { wrong: /<\/mxgraphmodel>/gi, right: "</mxGraphModel>" },
  ];
  for (const { wrong, right } of tagTypos) {
    const before = fixed;
    fixed = fixed.replace(wrong, right);
    if (fixed !== before) {
      fixes.push(`Fixed closing tag typo to ${right}`);
    }
  }

  // 13. Fix nested mxCell by flattening (duplicate IDs)
  const lines = fixed.split("\n");
  let newLines: string[] = [];
  let nestedFixed = 0;
  let extraClosingToRemove = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    if (
      nextLine &&
      /<mxCell\s/.test(line) &&
      /<mxCell\s/.test(nextLine) &&
      !line.includes("/>") &&
      !nextLine.includes("/>")
    ) {
      const id1 = line.match(/\bid\s*=\s*["']([^"']+)["']/)?.[1];
      const id2 = nextLine.match(/\bid\s*=\s*["']([^"']+)["']/)?.[1];

      if (id1 && id1 === id2) {
        nestedFixed++;
        extraClosingToRemove++;
        continue;
      }
    }

    if (extraClosingToRemove > 0 && /^\s*<\/mxCell>\s*$/.test(line)) {
      extraClosingToRemove--;
      continue;
    }

    newLines.push(line);
  }

  if (nestedFixed > 0) {
    fixed = newLines.join("\n");
    fixes.push(`Flattened ${nestedFixed} duplicate-ID nested mxCell(s)`);
  }

  // 14. Fix true nested mxCell (different IDs)
  const lines2 = fixed.split("\n");
  newLines = [];
  let trueNestedFixed = 0;
  let cellDepth = 0;
  let pendingCloseRemoval = 0;

  for (let i = 0; i < lines2.length; i++) {
    const line = lines2[i];
    const trimmed = line.trim();

    const isOpenCell = /<mxCell\s/.test(trimmed) && !trimmed.endsWith("/>");
    const isCloseCell = trimmed === "</mxCell>";

    if (isOpenCell) {
      if (cellDepth > 0) {
        const indent = line.match(/^(\s*)/)?.[1] || "";
        newLines.push(indent + "</mxCell>");
        trueNestedFixed++;
        pendingCloseRemoval++;
      }
      cellDepth = 1;
      newLines.push(line);
    } else if (isCloseCell) {
      if (pendingCloseRemoval > 0) {
        pendingCloseRemoval--;
      } else {
        cellDepth = Math.max(0, cellDepth - 1);
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  if (trueNestedFixed > 0) {
    fixed = newLines.join("\n");
    fixes.push(`Fixed ${trueNestedFixed} true nested mxCell(s)`);
  }

  // 15. Fix duplicate IDs by appending suffix
  const seenIds = new Map<string, number>();
  const duplicateIds: string[] = [];

  const idPattern = /\bid\s*=\s*["']([^"']+)["']/gi;
  let idMatch;
  while ((idMatch = idPattern.exec(fixed)) !== null) {
    const id = idMatch[1];
    seenIds.set(id, (seenIds.get(id) || 0) + 1);
  }

  for (const [id, count] of seenIds) {
    if (count > 1) duplicateIds.push(id);
  }

  if (duplicateIds.length > 0) {
    const idCounters = new Map<string, number>();
    fixed = fixed.replace(/\bid\s*=\s*["']([^"']+)["']/gi, (match, id) => {
      if (!duplicateIds.includes(id)) return match;

      const count = idCounters.get(id) || 0;
      idCounters.set(id, count + 1);

      if (count === 0) return match;

      const newId = `${id}_dup${count}`;
      return match.replace(id, newId);
    });
    fixes.push(`Renamed ${duplicateIds.length} duplicate ID(s)`);
  }

  // 16. Fix empty id attributes
  let emptyIdCount = 0;
  fixed = fixed.replace(
    /<mxCell([^>]*)\sid\s*=\s*["']\s*["']([^>]*)>/g,
    (_match, before, after) => {
      emptyIdCount++;
      const newId = `cell_${Date.now()}_${emptyIdCount}`;
      return `<mxCell${before} id="${newId}"${after}>`;
    }
  );
  if (emptyIdCount > 0) {
    fixes.push(`Generated ${emptyIdCount} missing ID(s)`);
  }

  return { fixed, fixes };
}

// ============================================================================
// Combined Validation and Fix
// ============================================================================

/**
 * Validates XML and attempts to fix if invalid
 *
 * @param xml - The XML string to validate and potentially fix
 * @returns Object with validation result, fixed XML if applicable, and fixes applied
 */
export function validateAndFixXml(xml: string): {
  valid: boolean;
  error: string | null;
  fixed: string | null;
  fixes: string[];
} {
  // First validation attempt
  let error = validateMxCellStructure(xml);

  if (!error) {
    return { valid: true, error: null, fixed: null, fixes: [] };
  }

  // Try to fix
  const { fixed, fixes } = autoFixXml(xml);

  // Validate the fixed version
  error = validateMxCellStructure(fixed);

  if (!error) {
    return { valid: true, error: null, fixed, fixes };
  }

  // Still invalid after fixes
  return {
    valid: false,
    error,
    fixed: fixes.length > 0 ? fixed : null,
    fixes,
  };
}

// CLI usage
if (typeof process !== "undefined" && process.argv[1]?.includes("validate-xml")) {
  const fs = await import("fs");
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error("Usage: bun validate-xml.ts <input.drawio>");
    process.exit(1);
  }

  const input = fs.readFileSync(inputFile, "utf-8");
  const result = validateAndFixXml(input);

  console.log("Validation Result:");
  console.log(`  Valid: ${result.valid}`);
  if (result.error) {
    console.log(`  Error: ${result.error}`);
  }
  if (result.fixes.length > 0) {
    console.log(`  Fixes Applied:`);
    result.fixes.forEach((fix) => console.log(`    - ${fix}`));
  }
  if (result.fixed) {
    const outputFile = inputFile.replace(/\.drawio$/, ".fixed.drawio");
    fs.writeFileSync(outputFile, result.fixed);
    console.log(`  Fixed file written to: ${outputFile}`);
  }
}
