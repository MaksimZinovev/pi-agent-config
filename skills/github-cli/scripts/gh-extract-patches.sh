#!/usr/bin/env bash
# gh-extract-patches.sh: Extract code patches from GitHub issue comments
# Usage: gh-extract-patches.sh ISSUE_URL
#
# This script extracts code patches (diff/patch blocks) from issue comments.
# Useful for finding community-provided fixes and workarounds.

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validate gh installation
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: gh CLI not found${NC}"
    echo "Install via: brew install gh"
    exit 1
fi

# Validate authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated${NC}"
    echo "Run: gh auth login --scopes repo,workflow"
    exit 1
fi

# Check for issue URL or number argument
if [ -z "$1" ]; then
    echo "Usage: $0 ISSUE_URL or ISSUE_NUMBER"
    echo ""
    echo "Example:"
    echo "  $0 https://github.com/owner/repo/issues/123"
    echo "  $0 123"
    exit 1
fi

ISSUE_ARG="$1"

# Extract issue number if URL provided
if [[ "$ISSUE_ARG" =~ github\.com/.*issues/([0-9]+) ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
else
    ISSUE_NUMBER="$ISSUE_ARG"
fi

echo -e "${GREEN}=== Extracting Patches from Issue #$ISSUE_NUMBER ===${NC}"
echo ""

# Get all comments
echo -e "${YELLOW}Fetching issue comments...${NC}"
COMMENTS=$(gh issue view "$ISSUE_NUMBER" --json comments --jq '.comments[].body' 2>/dev/null || echo "")

if [ -z "$COMMENTS" ]; then
    echo -e "${RED}No comments found or issue not accessible${NC}"
    exit 1
fi

# Create temp file for output
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Extract diff/patch blocks
echo "$COMMENTS" | awk '
/```diff/,/```/ {
    if (!/```/) print
    if (/```/) print "---"
}
/```patch/,/```/ {
    if (!/```/) print
    if (/```/) print "---"
}
' > "$TEMP_FILE"

# Check if any patches were found
if [ ! -s "$TEMP_FILE" ] || [ $(wc -l < "$TEMP_FILE") -lt 2 ]; then
    echo -e "${RED}No code patches found in comments${NC}"
    echo ""
    echo "Searching for solution keywords..."
    echo "$COMMENTS" | grep -i -A 3 "solution\|fix\|patch" | head -20 || echo "No keyword matches found"
    exit 0
fi

# Display patches
echo -e "${GREEN}Found code patches:${NC}"
echo ""
echo -e "${BLUE}----------------------------------------${NC}"
cat "$TEMP_FILE"
echo -e "${BLUE}----------------------------------------${NC}"
echo ""

# Save to file if patches found
OUTPUT_FILE="patch-${ISSUE_NUMBER}.diff"
echo "$COMMENTS" | awk '
/```diff/,/```/ {
    if (!/```/) print
}
/```patch/,/```/ {
    if (!/```/) print
}
' > "$OUTPUT_FILE"

echo -e "${GREEN}Patch saved to:${NC} $OUTPUT_FILE"
echo ""
echo "Apply patch:"
echo "  git apply $OUTPUT_FILE"
echo "  # or"
echo "  patch -p1 < $OUTPUT_FILE"
