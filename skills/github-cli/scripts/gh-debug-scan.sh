#!/usr/bin/env bash
# gh-debug-scan.sh: Multi-source GitHub search for error solutions
# Usage: gh-debug-scan.sh "error message or pattern"
#
# This script searches GitHub community sources for existing solutions:
# - Issues (open and closed)
# - Gists (code snippets and patches)
# - Code (search across repositories)

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check for error pattern argument
if [ -z "$1" ]; then
    echo "Usage: $0 \"error message or pattern\""
    echo ""
    echo "Example:"
    echo "  $0 \"TypeError: Cannot read property\""
    echo "  $0 \"LSP initialization failed\""
    exit 1
fi

ERROR_PATTERN="$1"

echo -e "${GREEN}=== GitHub Community Debug Scan ===${NC}"
echo -e "${YELLOW}Searching for:${NC} $ERROR_PATTERN"
echo ""

# Search issues
echo -e "${GREEN}[1/3] Searching issues...${NC}"
ISSUES=$(gh issue list --search "$ERROR_PATTERN" --state all --limit 10 --json number,title,state,url 2>/dev/null || echo "")
if [ -n "$ISSUES" ]; then
    echo "$ISSUES" | jq -r '"#\(.number): \(.title) [\(.state)]\n  \(.url)"' 2>/dev/null || echo "$ISSUES"
else
    echo "No issues found"
fi
echo ""

# Search gists
echo -e "${GREEN}[2/3] Searching gists...${NC}"
GISTS=$(gh gist list --search "$ERROR_PATTERN" --limit 10 2>/dev/null || echo "")
if [ -n "$GISTS" ]; then
    echo "$GISTS" | head -10
else
    echo "No gists found"
fi
echo ""

# Search code
echo -e "${GREEN}[3/3] Searching code...${NC}"
CODE=$(gh search code "$ERROR_PATTERN" --limit 10 --json path,repository 2>/dev/null || echo "")
if [ -n "$CODE" ]; then
    echo "$CODE" | jq -r '.[] | "\(.path)\n  Repo: \(.repository.nameWithOwner)"' 2>/dev/null || echo "$CODE"
else
    echo "No code found"
fi
echo ""

echo -e "${GREEN}=== Scan Complete ===${NC}"
echo ""
echo "Next steps:"
echo "  - View issue comments for patches: gh issue view NUMBER --json comments"
echo "  - View gist content: gh gist view GIST_ID"
echo "  - Extract patches: $HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL"
