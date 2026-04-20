#!/usr/bin/env bash
# gh-gist-finder.sh: Search gists for code snippets by language/pattern
# Usage: gh-gist-finder.sh "pattern" [language]
#
# This script searches GitHub gists for code snippets and patches.
# Gists often contain community solutions not found in official docs.

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

# Check for pattern argument
if [ -z "$1" ]; then
    echo "Usage: $0 \"pattern\" [language]"
    echo ""
    echo "Examples:"
    echo "  $0 \"LSP server config\""
    echo "  $0 \"error handler\" python"
    echo "  $0 \"authentication\" typescript"
    exit 1
fi

PATTERN="$1"
LANGUAGE="${2:-}"

echo -e "${GREEN}=== GitHub Gist Finder ===${NC}"
echo -e "${YELLOW}Pattern:${NC} $PATTERN"
if [ -n "$LANGUAGE" ]; then
    echo -e "${YELLOW}Language:${NC} $LANGUAGE"
fi
echo ""

# Build search query
SEARCH_QUERY="$PATTERN"
if [ -n "$LANGUAGE" ]; then
    SEARCH_QUERY="language:$LANGUAGE $PATTERN"
fi

# Search gists
echo -e "${GREEN}Searching gists...${NC}"
GISTS=$(gh gist list --search "$SEARCH_QUERY" --limit 20 2>/dev/null || echo "")

if [ -z "$GISTS" ]; then
    echo -e "${RED}No gists found${NC}"
    echo ""
    echo "Try:"
    echo "  - Broader pattern"
    echo "  - Different language"
    echo "  - Removing language filter"
    exit 0
fi

# Parse and display gist results
echo -e "${GREEN}Found gists:${NC}"
echo ""
echo "$GISTS" | while read -r line; do
    if [ -n "$line" ]; then
        # Extract gist ID from line (format: "ID Name Time")
        GIST_ID=$(echo "$line" | awk '{print $1}')
        GIST_NAME=$(echo "$line" | awk '{for(i=2;i<=NF;i++) printf $i" "; print ""}')
        echo -e "${BLUE}Gist:${NC} $GIST_NAME"
        echo -e "${BLUE}ID:${NC}   $GIST_ID"

        # Show gist files
        FILES=$(gh gist view "$GIST_ID" --json files --jq '.files[].name' 2>/dev/null || echo "")
        if [ -n "$FILES" ]; then
            echo -e "${BLUE}Files:${NC}"
            echo "$FILES" | while read -r file; do
                echo "  - $file"
            done
        fi

        # Show preview (first few lines)
        PREVIEW=$(gh gist view "$GIST_ID" --raw 2>/dev/null | head -5 || echo "")
        if [ -n "$PREVIEW" ]; then
            echo -e "${BLUE}Preview:${NC}"
            echo "$PREVIEW" | sed 's/^/  /'
        fi

        echo ""
    fi
done

echo -e "${GREEN}=== Actions ===${NC}"
echo ""
echo "View gist:"
echo "  gh gist view GIST_ID"
echo ""
echo "Get raw content:"
echo "  gh gist view GIST_ID --raw > snippet.ext"
echo ""
echo "Clone gist:"
echo "  gh gist clone GIST_ID"
