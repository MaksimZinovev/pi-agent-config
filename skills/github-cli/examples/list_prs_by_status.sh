#!/usr/bin/env bash
# List GitHub pull requests with filtering
# Usage: ./list_prs_by_status.sh [state] [repo]
# Examples:
#   ./list_prs_by_status.sh open
#   ./list_prs_by_status.sh closed owner/repo
#   ./list_prs_by_status.sh merged

set -e

STATE="${1:-open}"
REPO="${2:-}"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI is not installed. Install from https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub. Run 'gh auth login' first."
    exit 1
fi

# Build query
QUERY="state:$STATE"
if [ -n "$REPO" ]; then
    QUERY="$QUERY repo:$REPO"
fi

echo "Searching for PRs with query: $QUERY"
echo "---"

# List PRs
if [ -n "$REPO" ]; then
    gh pr list --search "$QUERY" --limit 20
else
    gh pr list --state "$STATE" --limit 20
fi

echo ""
echo "✅ Found $(gh pr list --search "$QUERY" --json id --jq '. | length') PR(s)"
