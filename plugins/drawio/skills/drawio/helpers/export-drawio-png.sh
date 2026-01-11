#!/bin/bash
# Export .drawio file to .drawio.png with embedded diagram data
# Usage: export-drawio-png.sh input.drawio [output.drawio.png]
#
# Requires Docker with rlespinasse/drawio-export image

set -e

INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 input.drawio [output.drawio.png]"
    echo ""
    echo "Exports a .drawio file to .drawio.png with embedded diagram data."
    echo "The output file can be opened and edited in draw.io or VS Code."
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File not found: $INPUT_FILE"
    exit 1
fi

# Get absolute paths
INPUT_DIR=$(cd "$(dirname "$INPUT_FILE")" && pwd)
INPUT_NAME=$(basename "$INPUT_FILE")
BASE_NAME="${INPUT_NAME%.drawio}"

# Determine output file
if [ -z "$OUTPUT_FILE" ]; then
    OUTPUT_FILE="${INPUT_DIR}/${BASE_NAME}.drawio.png"
fi

OUTPUT_DIR=$(cd "$(dirname "$OUTPUT_FILE")" 2>/dev/null && pwd || echo "$(dirname "$OUTPUT_FILE")")
OUTPUT_NAME=$(basename "$OUTPUT_FILE")

echo "Exporting: $INPUT_FILE -> $OUTPUT_FILE"

# Create temp directory for export
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy input file to temp directory
cp "$INPUT_FILE" "$TEMP_DIR/"

# Run Docker export with embedded diagram
docker run --rm \
    -v "$TEMP_DIR:/data" \
    rlespinasse/drawio-export \
    -f png \
    -e \
    --remove-page-suffix \
    -o /data \
    "/data/$INPUT_NAME"

# Find the generated PNG (may have page suffix)
GENERATED=$(find "$TEMP_DIR" -name "*.png" -type f | head -1)

if [ -z "$GENERATED" ]; then
    echo "Error: No PNG file generated"
    exit 1
fi

# Move to final destination
mv "$GENERATED" "$OUTPUT_FILE"

echo "Success: $OUTPUT_FILE"
echo ""
echo "This file can be:"
echo "  - Viewed as a regular PNG image"
echo "  - Opened and edited in draw.io or VS Code (with Draw.io Integration extension)"
