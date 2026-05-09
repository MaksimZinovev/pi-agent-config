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
#   bash validate-logbook.sh patterns site-specifics

set -euo pipefail

MAX_LINES=40
ERRORS=0
WARNINGS=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGBOOK_DIR="$(dirname "$SCRIPT_DIR")"
REFS_DIR="$LOGBOOK_DIR/references"

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
            echo "❌ Unknown file: ${name}.md — valid: ${VALID_NAMES[*]}"
            ERRORS=$((ERRORS + 1))
            continue
        fi
        FILES_TO_CHECK+=("$REFS_DIR/${name}.md")
    done
fi

# Extract entries using awk with RS/FS paragraph mode
# Each entry = text between ## headings (not ###)
# Uses ASCII unit separator (\036) as record delimiter
extract_entries() {
    local file="$1"
    awk '
    /^## [^#]/ {
        if (block != "") print block
        block = $0
        next
    }
    /^# / { next }   # skip file-level headings
    { block = block "\n" $0 }
    END { if (block != "") print block }
    ' "$file"
}

# Check 1: Entry length
check_length() {
    local file="$1"
    local basename
    basename="$(basename "$file")"

    # Use temp file for entries to avoid IFS issues
    local tmp
    tmp="$(mktemp)"
    extract_entries "$file" > "$tmp"

    local entry_num=0
    local in_entry=false
    local entry_lines=0
    local entry_title=""

    while IFS= read -r line; do
        if [[ "$line" =~ ^##[[:space:]][^#] ]]; then
            # Save previous entry if exists
            if $in_entry && [[ $entry_lines -gt 0 ]]; then
                if [[ $entry_lines -gt $MAX_LINES ]]; then
                    echo "❌ LENGTH: ${basename} — \"${entry_title}\" is ${entry_lines} lines (max ${MAX_LINES})"
                    ERRORS=$((ERRORS + 1))
                fi
            fi
            # Start new entry
            entry_num=$((entry_num + 1))
            entry_title="$(echo "$line" | sed 's/^## //')"
            entry_lines=1
            in_entry=true
        elif $in_entry; then
            entry_lines=$((entry_lines + 1))
        fi
    done < "$tmp"

    # Check last entry
    if $in_entry && [[ $entry_lines -gt $MAX_LINES ]]; then
        echo "❌ LENGTH: ${basename} — \"${entry_title}\" is ${entry_lines} lines (max ${MAX_LINES})"
        ERRORS=$((ERRORS + 1))
    fi

    rm -f "$tmp"
}

# Check 2: Required structure
check_structure() {
    local file="$1"
    local basename
    basename="$(basename "$file")"

    local tmp
    tmp="$(mktemp)"
    extract_entries "$file" > "$tmp"

    local entry_num=0
    local current_entry=""
    local entry_title=""

    while IFS= read -r line; do
        if [[ "$line" =~ ^##[[:space:]][^#] ]]; then
            # Process previous entry
            if [[ -n "$current_entry" ]] && [[ $entry_num -gt 0 ]]; then
                _check_entry_fields "$basename" "$entry_title" "$current_entry"
            fi
            # Start new entry
            entry_num=$((entry_num + 1))
            entry_title="$(echo "$line" | sed 's/^## //')"
            current_entry="$line"
        else
            current_entry="${current_entry}
${line}"
        fi
    done < "$tmp"

    # Process last entry
    if [[ -n "$current_entry" ]] && [[ $entry_num -gt 0 ]]; then
        _check_entry_fields "$basename" "$entry_title" "$current_entry"
    fi

    rm -f "$tmp"
}

_check_entry_fields() {
    local basename="$1"
    local title="$2"
    local entry="$3"

    if [[ "$basename" == "site-specifics.md" ]]; then
        if ! echo "$entry" | grep -qi "TL;DR\|Quirk"; then
            echo "❌ STRUCTURE: ${basename} — \"${title}\" missing TL;DR or Quirk"
            ERRORS=$((ERRORS + 1))
        fi
        if ! echo "$entry" | grep -qi "Discovered"; then
            echo "⚠️  WARN: ${basename} — \"${title}\" missing Discovered date"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
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
}

# Check 3: Bash code blocks
check_bash_blocks() {
    local file="$1"
    local basename
    basename="$(basename "$file")"

    local tmp
    tmp="$(mktemp)"
    extract_entries "$file" > "$tmp"

    local entry_num=0
    local current_entry=""
    local entry_title=""

    while IFS= read -r line; do
        if [[ "$line" =~ ^##[[:space:]][^#] ]]; then
            # Process previous entry
            if [[ -n "$current_entry" ]] && [[ $entry_num -gt 0 ]]; then
                local bash_count
                bash_count="$(echo "$current_entry" | grep -c '```bash' || true)"
                if [[ "$bash_count" -eq 0 ]]; then
                    echo "❌ NO-BASH: ${basename} — \"${entry_title}\" has no \`\`\`bash code block"
                    ERRORS=$((ERRORS + 1))
                fi
            fi
            entry_num=$((entry_num + 1))
            entry_title="$(echo "$line" | sed 's/^## //')"
            current_entry="$line"
        else
            current_entry="${current_entry}
${line}"
        fi
    done < "$tmp"

    # Process last entry
    if [[ -n "$current_entry" ]] && [[ $entry_num -gt 0 ]]; then
        local bash_count
        bash_count="$(echo "$current_entry" | grep -c '```bash' || true)"
        if [[ "$bash_count" -eq 0 ]]; then
            echo "❌ NO-BASH: ${basename} — \"${entry_title}\" has no \`\`\`bash code block"
            ERRORS=$((ERRORS + 1))
        fi
    fi

    rm -f "$tmp"
}

# Check 4: Duplicate titles
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

# Main
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