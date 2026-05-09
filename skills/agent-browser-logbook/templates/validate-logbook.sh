#!/usr/bin/env bash
# validate-logbook.sh — Enforce entry quality rules for agent-browser-logbook
#
# Checks:
#   1. Entry length — no entry exceeds 40 lines
#   2. Required structure — each entry has TL;DR, Context/Quirk, Applies to/Discovered
#   3. Bash code blocks — each entry has ≥1 ```bash block
#   4. Duplicate titles — no duplicate ## headings within a file
#
# Usage:
#   bash validate-logbook.sh              # check all files
#   bash validate-logbook.sh pitfalls     # check only pitfalls.md
#   bash validate-logbook.sh patterns site-specifics  # specific files

set -euo pipefail

MAX_LINES=40
ERRORS=0
WARNINGS=0

# Resolve logbook directory (works via symlink or direct)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGBOOK_DIR="$(dirname "$SCRIPT_DIR")"
REFS_DIR="$LOGBOOK_DIR/references"

# Determine which files to check
VALID_NAMES=("pitfalls" "patterns" "site-specifics")
FILES_TO_CHECK=()

if [[ $# -eq 0 ]]; then
    for name in "${VALID_NAMES[@]}"; do
        FILES_TO_CHECK+=("$REFS_DIR/${name}.md")
    done
else
    for arg in "$@"; do
        name="${arg%.md}"
        if [[ " ${VALID_NAMES[*]} " != *" $name "* ]]; then
            echo "❌ Unknown file: ${name}.md — valid names: ${VALID_NAMES[*]}"
            ERRORS=$((ERRORS + 1))
            continue
        fi
        FILES_TO_CHECK+=("$REFS_DIR/${name}.md")
    done
fi

# --- Extract entries: split file on ## lines (entry headings) ---
# Lines starting with ### are subheadings WITHIN an entry, not delimiters.
# The content before the first ## is the file preamble (skip it).
extract_entries() {
    local file="$1"
    # awk: accumulate lines into entry blocks, split on ^## 
    # (but not ### which are subheadings inside entries)
    awk '
    /^## [^#]/ {
        if (block != "") print block
        block = $0
        next
    }
    {
        if (block != "") block = block "\n" $0
    }
    END {
        if (block != "") print block
    }
    ' "$file"
}

# --- Check 1: Entry length ---
check_length() {
    local file="$1"
    local basename
    basename="$(basename "$file")"
    
    while IFS= read -r entry; do
        [[ -z "$entry" ]] && continue
        
        local title
        title="$(echo "$entry" | head -1 | sed 's/^## //')"
        local lines
        lines="$(echo "$entry" | wc -l | tr -d ' ')"
        
        if [[ "$lines" -gt "$MAX_LINES" ]]; then
            echo "❌ LENGTH: ${basename} — \"${title}\" is ${lines} lines (max ${MAX_LINES})"
            ERRORS=$((ERRORS + 1))
        fi
    done < <(extract_entries "$file")
}

# --- Check 2: Required structure ---
check_structure() {
    local file="$1"
    local basename
    basename="$(basename "$file")"
    
    while IFS= read -r entry; do
        [[ -z "$entry" ]] && continue
        
        local title
        title="$(echo "$entry" | head -1 | sed 's/^## //')"
        
        if [[ "$basename" == "site-specifics.md" ]]; then
            # Site entries need: TL;DR (or Quirk), Discovered
            if ! echo "$entry" | grep -qi "TL;DR\|Quirk"; then
                echo "❌ STRUCTURE: ${basename} — \"${title}\" missing TL;DR or Quirk line"
                ERRORS=$((ERRORS + 1))
            fi
            if ! echo "$entry" | grep -qi "Discovered"; then
                echo "⚠️  WARN: ${basename} — \"${title}\" missing Discovered date"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            # Pitfalls and patterns need: TL;DR, Context, Applies to
            if ! echo "$entry" | grep -q "TL;DR"; then
                echo "❌ STRUCTURE: ${basename} — \"${title}\" missing **TL;DR:**"
                ERRORS=$((ERRORS + 1))
            fi
            if ! echo "$entry" | grep -qi "Context"; then
                echo "❌ STRUCTURE: ${basename} — \"${title}\" missing **Context:**"
                ERRORS=$((ERRORS + 1))
            fi
            if ! echo "$entry" | grep -qi "Applies to"; then
                echo "❌ STRUCTURE: ${basename} — \"${title}\" missing **Applies to:**"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    done < <(extract_entries "$file")
}

# --- Check 3: Bash code blocks ---
check_bash_blocks() {
    local file="$1"
    local basename
    basename="$(basename "$file")"
    
    while IFS= read -r entry; do
        [[ -z "$entry" ]] && continue
        
        local title
        title="$(echo "$entry" | head -1 | sed 's/^## //')"
        local bash_count
        bash_count="$(echo "$entry" | grep -c '```bash' || true)"
        
        if [[ "$bash_count" -eq 0 ]]; then
            echo "❌ NO-BASH: ${basename} — \"${title}\" has no \`\`\`bash code block"
            ERRORS=$((ERRORS + 1))
        fi
    done < <(extract_entries "$file")
}

# --- Check 4: Duplicate titles ---
check_duplicates() {
    local file="$1"
    local basename
    basename="$(basename "$file")"
    
    local headings
    headings="$(grep '^## [^#]' "$file" | sed 's/^## //' | sort)"
    
    local dupes
    dupes="$(echo "$headings" | uniq -d)"
    
    if [[ -n "$dupes" ]]; then
        while IFS= read -r dupe; do
            echo "❌ DUPLICATE: ${basename} — duplicate entry \"${dupe}\""
            ERRORS=$((ERRORS + 1))
        done <<< "$dupes"
    fi
}

# --- Main ---
echo "🔍 Validating agent-browser-logbook..."
echo "   Max entry length: ${MAX_LINES} lines"
echo ""

for file in "${FILES_TO_CHECK[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "⚠️  SKIP: $file not found"
        continue
    fi
    
    local_basename="$(basename "$file")"
    echo "📋 Checking ${local_basename}..."
    
    check_length "$file"
    check_structure "$file"
    check_bash_blocks "$file"
    check_duplicates "$file"
    echo ""
done

if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
    echo "✅ All logbook entries pass validation."
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    echo "✅ All checks passed (with ${WARNINGS} warning(s))."
    exit 0
else
    echo "❌ Validation failed: ${ERRORS} error(s), ${WARNINGS} warning(s)."
    echo "   Fix entries in references/ to meet quality rules."
    exit 1
fi