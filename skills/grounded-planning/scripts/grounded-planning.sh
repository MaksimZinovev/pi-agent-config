#!/usr/bin/env bash
set -euo pipefail
CFG="$HOME/.mcporter/config/mcporter.json"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: grounded-planning.sh <libraryName> <topic> [mode] [page]

Context7 Doc Pack helper for the grounded-planning skill.

mode: info|code (default: info)
page: 1..10 (default: 1)

Examples:
  grounded-planning.sh playwright environment info 1
  grounded-planning.sh fastapi middleware code 1
EOF
  exit 0
fi

LIB="${1:?Usage: grounded-planning.sh <libraryName> <topic> [mode] [page]}"
TOPIC="${2:?Usage: grounded-planning.sh <libraryName> <topic> [mode] [page]}"
MODE="${3:-info}"
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

# Extract all candidate IDs
CANDIDATES="$(printf "%s\n" "$RESOLVE_OUT" \
  | awk -F': ' '/Context7-compatible library ID:|Library ID:/ {print $2}')"

echo "### Candidates"
echo "$CANDIDATES"
echo

# Take the first candidate (most relevant match)
ID="$(printf "%s\n" "$CANDIDATES" | head -n 1)"
echo "### Selected library ID"
echo "$ID"
echo

# 2) Fetch docs
QUERY="topic=$TOPIC; mode=$MODE; page=$PAGE"
mcporter --config "$CFG" \
  call 'context7.query-docs(libraryId: "'"$ID"'", query: "'"$QUERY"'")'