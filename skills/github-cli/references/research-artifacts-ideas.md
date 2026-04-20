Ideas for Saving GitHub CLI Skill Artifacts

Idea 1: Session-Based Research Artifacts

Directory Structure:
/Users/maksim/.config/claude/github-cli-skill/
└── sessions/
└── 2026-01-01_LSP_Debugging_134522/
├── search-results.json # Raw GitHub API responses
├── issues-found.md # Formatted list of relevant issues
├── patches-extracted/ # Extracted patch files
│ ├── gist-f7ca58ce.patch
│ └── issue-15168-comment.patch
├── session-summary.md # What was found + confidence
└── next-steps.md # Actionable recommendations

Use Cases:

- Reproducibility: Re-run searches later with same parameters
- Audit trail: Know what was searched and when
- Patch management: Save patches for potential application
- Handoff: Share findings with team or future sessions

Implementation:

# In gh-debug-scan.sh, add:

SESSION*DIR="/Users/maksim/.config/claude/github-cli-skill/sessions/$(date +%Y%m%d*%H%M%S)\_$QUERY_SLUG"
  mkdir -p "$SESSION_DIR/patches-extracted"

# Save raw search results

echo "$ISSUES" > "$SESSION_DIR/search-results.json"

# Save formatted summary

generate_summary > "$SESSION_DIR/session-summary.md"

---

Idea 2: Solution Cache with Deduplication

Directory Structure:
/Users/maksim/.config/claude/github-cli-skill/
└── cache/
├── by-error-signature/
│ ├── TypeError_Cannot_read_property/
│ │ ├── solutions.json # What worked
│ │ ├── confidence.json # Success rate
│ │ ├── sources.json # GitHub URLs, issue numbers
│ │ └── applied-at.json # When this was last used successfully
│ └── LSP_0_servers_loaded/
│ └── [same structure]
└── by-repo/
└── anthropics/claude-code/
└── LSP_issues/
└── [links to error-signature solutions]

Use Cases:

- Speed: Skip re-searching known problems
- Confidence boosting: "This solved it 80% of the time last month"
- Pattern recognition: Discover recurring issues across projects
- Learning: What solutions work for which error patterns

Implementation:

# Check cache before searching

ERROR_SIG="LSP_0_servers"
CACHE_DIR="/Users/maksim/.config/claude/github-cli-skill/cache/by-error-signature/$ERROR_SIG"

if [ -d "$CACHE_DIR" ]; then
echo "Found cached solutions for this error pattern:"
cat "$CACHE_DIR/solutions.json"
cat "Last used: $(cat $CACHE_DIR/applied-at.json)"
exit 0
fi

# After successful solution

echo "Confidence: 95%" > "$CACHE_DIR/confidence.json"
  echo "Sources: gist:f7ca58ce, issues:#15168,#15202" > "$CACHE_DIR/sources.json"
date +%Y%m%d > "$CACHE_DIR/applied-at.json"

---

Idea 3: Collaboration & Knowledge Sharing Artifacts

Directory Structure:
/Users/maksim/.config/claude/github-cli-skill/
└── shared/
├── discovered-workarounds/
│ ├── 2026-01-01_cli.js-LSP-patch.md
│ └── 2025-12-15_plugin-loading-fix.md
├── issue-summaries/
│ └── anthropic-claude-code-15168.md
└── team-sync/
└── latest-solutions.json # For sharing with team

Use Cases:

- Team knowledge base: Share discoveries with colleagues
- Documentation: Auto-generate troubleshooting guides
- Onboarding: New team members see past solutions
- Integration with remembering-conversations: Link conversation IDs to solutions

Implementation:

# After finding successful solution

WORKAROUND_DIR="/Users/maksim/.config/claude/github-cli-skill/shared/discovered-workarounds"

cat > "$WORKAROUND_DIR/2026-01-01_cli.js-LSP-patch.md" << 'EOF'

# Claude Code v2.0.76 LSP Fix

## Problem

LSP not working for TypeScript in Claude Code v2.0.76

## Solution

Patch from gist: https://gist.github.com/Zamua/f7ca58ce5dd9ba61279ea195a01b190c

## Application

```bash
curl -O https://gist.githubusercontent.com/Zamua/.../apply-claude-code-2.0.76-lsp-fix.sh
chmod +x apply-claude-code-2.0.76-lsp-fix.sh
./apply-claude-code-2.0.76-lsp-fix.sh

Confidence

95% - Worked for 5/5 users in thread

Related Issues

#13952, #15168, #15202, #15531, #15914

Session

2026-01-01_LSP_Debugging_134522
EOF

---

## Recommendation

**Start with Idea 1 (Session-Based Artifacts)** - It's the most practical for immediate use:

| Aspect | Idea 1 | Idea 2 | Idea 3 |
|--------|--------|--------|--------|
| **Complexity** | Low | Medium | Medium |
| **Immediate Value** | High | Medium | Medium |
| **Setup Effort** | Minimal | Moderate | Moderate |
| **Scalability** | Good | Excellent | Good |

**Implementation approach:** Add session directory creation to `gh-debug-scan.sh` and save search artifacts automatically.

