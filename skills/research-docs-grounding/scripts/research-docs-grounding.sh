#!/usr/bin/env bash
set -euo pipefail
CFG="$HOME/.mcporter/config/mcporter.json"

# mcporter --config "$CFG" list
# echo "CWD: $(pwd)"
# echo "mcporter: $(command -v mcporter)"
# mcporter config list --source import || true
# MCPORTER_BIN="/opt/homebrew/bin/mcporter"

# "mcporter" list


if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: research-docs-grounding.sh <libraryName> <topic> [mode] [page]

mode: info|code (default: info)
page: 1..10 (default: 1)

Examples:
  research-docs-grounding.sh playwright environment info 1
  research-docs-grounding.sh playwright retries code 1
EOF
  exit 0
fi




LIB="${1:?Usage: research-docs-grounding.sh <libraryName> <topic> [mode] [page]}"
TOPIC="${2:?Usage: research-docs-grounding.sh <libraryName> <topic> [mode] [page]}"
MODE="${3:-info}"   # default: info (conceptual). Use code for APIs/examples.
PAGE="${4:-1}"

echo "## Context7 Doc Pack"
echo "- libraryName: $LIB"
echo "- topic: $TOPIC"
echo "- mode: $MODE"
echo "- page: $PAGE"
echo

# 1) Resolve library id (must be done first)
RESOLVE_OUT="$(mcporter --config "$CFG" \
  call 'context7.resolve-library-id(query: "'"$TOPIC"'", libraryName: "'"$LIB"'")')"


# echo "### Resolve output"
# echo "$RESOLVE_OUT"

# Extract all candidate IDs from the well-known line format
CANDIDATES="$(printf "%s\n" "$RESOLVE_OUT" \
  | awk -F': ' '/Context7-compatible library ID:|Library ID:/ {print $2}')"


echo "### Candidates"
echo "$CANDIDATES"
echo

# Prefer Node Playwright if present, otherwise take the first candidate
if printf "%s\n" "$CANDIDATES" | grep -qx '/microsoft/playwright'; then
  ID='/microsoft/playwright'
else
  ID="$(printf "%s\n" "$CANDIDATES" | head -n 1)"
fi
echo "### Selected library ID"
echo "$ID"
echo

# 2) Fetch docs
QUERY="topic=$TOPIC; mode=$MODE; page=$PAGE"
mcporter --config "$CFG" \
  call 'context7.query-docs(libraryId: "'"$ID"'", query: "'"$QUERY"'")'

