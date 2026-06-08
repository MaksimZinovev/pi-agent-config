# Grounded Planning × Plannotator — Format Reference

Every plan must contain these sections. Omitting any is an error. Scaffold with `docfence new plan` first, then fill in. Validate with `docfence validate` before declaring done.

## Required Sections

| Section | Purpose |
|---------|---------|
| `## Context` | Why this change is needed |
| `## Tools & Skills` | Relevant tools/skills marked Yes (must use) / No (not needed, why) / Possibly (might use) |
| `## Approach` | Recommended direction and why, over alternatives |
| `## Out of Scope` | Bullet list of excluded items with one-line justification each |
| `## Steps` | `- [ ]` checklist items with evidence citations |
| `## Files to Modify` | Explicit list: create, update, or delete |
| `## Reuse` | Existing code, libraries, or patterns to leverage. Include partial reusable extraction suggestions |
| `## Evidence Pack` | Claims with Source, Confidence, Implication |
| `## Verification` | Bash code blocks with `# Test N:` labels and `# Expected:` results. Include end-user testing |
| `## Bottom Line` | Per-step confidence, key risk, gaps, recommendation |

## Full Format Template

````markdown
---
id: PLAN-001
type: plan
status: draft
owner: human
depends_on: []
last_validated: ~
---

# [Task Name]

```spec
scope: document
type: plan
required_sections: [Context, Tools & Skills, Approach, Out of Scope, Steps, Files to Modify, Reuse, Evidence Pack, Verification, Bottom Line]
max_chars: 20000
banned_words: [TODO, TBD, placeholder]
match:
  has_checklist: '^- \[( |x)\]'
  has_source: 'Source:'
  has_file_marker: "(CREATED|UPDATED|DELETED)"
  has_test: '# Test \d'
  has_out_of_scope: "^## Out of Scope"
  has_tools_and_skills: "^## Tools & Skills"
  has_ynp_format: '^- .+: (Yes|No|Possibly)\b'
```

## Context
[What problem does this solve? State the issue concisely — no narrative backstory. Must name the problem (bug, issue, fail, break, etc.). No hedging (might be, could be, seems like, I think).]

## Tools & Skills
- tool_name: Yes / No (why not needed) / Possibly (when you'd use it)
(Minimum 3 entries. No N/A. No file references — files go in Files to Modify. No dismissive No — justify by task scope.)

### How to enumerate valid entries

Before writing Tools & Skills, run these three commands to discover available capabilities:
- **Skills**: `ls -1 ~/.pi/agent/skills/ .pi/skills/ 2>/dev/null`
- **MCP**: `mcporter list`
- **CLI**: `~/.pi/agent/skills/cli-tool-discovery/tool/ai-tooling`

Every entry must have a category label in parentheses: Skills, MCP, or CLI.

Valid entries (three categories — Skills, MCP, CLI):
- cx (Skills): Yes — needed to trace call graph across codebase
- docfence (Skills): Possibly — may want to scaffold a feature spec later
- github (MCP): Yes — will create PRs as part of execution
- jq (CLI): Yes — needed to parse JSON config files
- grep (CLI): No — task requires semantic search, not text matching

Invalid entries:
- validator.py: No — file reference, not a tool → belongs in Files to Modify
- grep: No — codebase is small, grep sufficient → dismissive; must justify by task scope
- N/A — banned; every plan should audit relevant tools

## Approach
[Recommended direction and rationale — why this over alternatives? Max ~10 lines. Must mention an alternative. No Q1:/Q2: format.]
```spec
type: plan
max_chars: 800
banned_words: [Q1:, Q2:, Q3:, Q, Question:]
match:
  has_alternative: '(alternative|instead of|rather than|compared to|over:|vs[.])'
```

## Out of Scope
- item: reason for exclusion. Minimum 2 items. No None./N/A.
```spec
type: plan
banned_words: [Nothing., None., N/A, n/a, Not applicable]
match:
  has_justification: '^- .+:'
  min_2_exclusions: '^- .+:'
```

## Steps

- [ ] [Action] (Source: file.ts:42 or Evidence Pack Claim 2 or "known pattern")
  - Confidence: [0.0–1.0]
  - Details: [specific enough to execute immediately]
- [ ] [Action] (Source: ...)
  - Confidence: [...]
  - Details: [...]
- [ ] [Action] (Source: ...)
  - Confidence: [...]
  - Details: [...]

## Files to Modify
- `path/to/file.ts` — CREATED: what this file contains and why it's new
- `path/to/config.ts` — UPDATED: what changes and why
(Must use `path — CREATED/UPDATED/DELETED` format. No prose.)

## Reuse
- existing_pattern: how it's reused (no None./N/A cop-outs — always identify something)
- library_name: what it provides

## Evidence Pack

- Claim: [what we learned]
  Source: [path, URL, or Context7 section]
  Confidence: [0.0–1.0]
  Implication: [what this means for the plan]

- Claim: [next piece of evidence]
  Source: [...]
  Confidence: [...]
  Implication: [...]

### Gaps
- [What we couldn't verify and why]
- [What would require running code or checking logs]

## Verification

```bash
command --to-run  # Test 1: [description]
# Expected: [what success looks like]

pnpm test  # Test 2: [description]
# Expected: [what success looks like]
```

## Bottom Line
- Per-step confidence: [list each step's confidence, then average; note outliers]
- Key risk: [biggest risk and mitigation]
- Gaps: [1–2 things we couldn't verify]
- Recommendation: [proceed / proceed with caution / need more info]
````

## Validation

Every plan is validated against the `plan` docfence doctype (`.docfence/types/plan.toml`). This enforces:
- All 10 required sections present
- No banned words (TODO, TBD, placeholder)
- No unfilled `[REPLACE]` or `df-todo` placeholders

The document-level spec block also enforces structural `match` rules:
- `has_checklist` — at least one `- [ ]` or `- [x]` step exists
- `has_source` — at least one `Source` evidence citation exists
- `has_file_marker` — at least one CREATED/UPDATED/DELETED marker in Files to Modify
- `has_test` — at least one `# Test N:` label in Verification
- `has_out_of_scope` — `## Out of Scope` section exists
- `has_tools_and_skills` — `## Tools & Skills` section exists
- `has_ynp_format` — at least one Y/N/P audit entry (`- name: Yes/No/Possibly`)

Run `docfence validate plans/<name>.md` after writing. Fix errors until clean. Do not declare the plan done until validation passes.

### Section-level rules

Each section also has its own validation rules that catch common planner failures:

| Section | Rules | What it catches |
|---------|-------|-----------------|
| Context | `banned_words`: hedging phrases (might be, could be, seems like, I think, possibly, perhaps); `match`: must name the problem (problem/issue/bug/break/fail/cannot) | Verbose narrative instead of concise problem statement; "I think maybe we should..." hedging |
| Tools & Skills | `banned_words`: N/A, n/a, dismissive phrases; `match`: ≥3 Y/N/P entries required | Lazy cop-outs like "N/A"; skipping tool consideration; dismissive "No" |
| Approach | `banned_words`: Q1:/Q2:/**Q/Question: formats; `max_chars`: 800; `match`: must mention alternatives (alternative/instead of/rather than/compared to) | Q&A decision format; 40-line design docs; no comparison with alternatives |
| Out of Scope | `banned_words`: None./N/A/Not applicable cop-outs; `match`: must have ≥2 item justifications | Lazy "None." dismissal; no genuine scope boundaries |
| Steps | `banned_words`: Step/Task/Phase bold headers; `match`: evidence citations per step `(Source: file:line or Claim N)`, ≥3 checklist items | Prose paragraphs; bold headers; 1-step "plans"; no evidence trail |
| Files to Modify | `match`: must have `\`path\`: CREATED/UPDATED/DELETED` entries | Files mentioned in prose instead of explicit list |
| Reuse | `banned_words`: None./N/A cop-outs; `match`: must have labeled reuse items | "Nothing to reuse" laziness when patterns/libraries exist |
| Evidence Pack | `banned_words`: Source:/Source: formats; `match`: must have `Claim:` entries and `Confidence:` scores | Bold-formatted Source that bypasses match rule; claims without confidence |
| Verification | `match`: must have `` ```bash `` blocks, `# Expected:` results, ≥2 `# Test N:` labels | Prose "run the tests" instead of actual commands; single-test "verification" |
| Bottom Line | `match`: must have `Recommendation:` label | Vague "should work" without explicit proceed/hold/redirect decision |

## Workflow

1. Scaffold: `docfence new plan --output plans/<name>.md --id <ID> --title "<title>" --owner <owner>`
2. Fill scaffolded sections with researched content → replace all `[REPLACE]` and `df-todo` blocks
3. Run `docfence validate plans/<name>.md` → fix errors until clean
4. Run `/plannotator-annotate plans/<name>.md` → visual review in browser

## Combined format (Plannotator structure + grounded evidence)

| Section | Source | What it adds |
|---------|--------|-------------|
| Context, Approach, Files to Modify, Reuse | Plannotator | Structure & actionability |
| Steps (`- [ ]` checklists) | Plannotator | Progress tracking during execution |
| Evidence Pack, Uncertainty, Decision Points, Bottom Line | Grounded-planning | Source traceability & rigor |
| Verification (commands + expected results) | Both | Testability |

## Directory layout

```
plans/<name>.md          ← GIT-TRACKED. Actionable plans, Plannotator-reviewed
docs/specs/              ← GIT-TRACKED. Design specs, mockups, interaction patterns
docs/decisions/          ← GIT-TRACKED. Gap analyses, decision context, ADRs
.local/<ISSUE-KEY>/      ← GIT-IGNORED. Research, evidence, screenshots, scratch
.plannotator/            ← AUTO-MANAGED. Archived plan versions
```

Key rule: Future-you needs it to understand *why* → `docs/` (tracked). Served its purpose → `.local/` (ignored).
Linking: Plans reference deeper research via `(Sources: .local/<key>/evidence-pack.md)`.

## Document map (append to every plan)

```text
plans/auth-redesign.md       # CREATED — main plan
docs/specs/auth-flow.md      # CREATED — design spec
docs/decisions/auth-lib.md   # CREATED — why Passport over custom
.local/ISSUE-24/evidence.md  # CREATED — research evidence
```
Markers: `CREATED`, `UPDATED`, `REFERENCED`, `DELETED`