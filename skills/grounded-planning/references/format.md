# Grounded Planning × Plannotator — Format Reference

Every plan **must** contain these sections. Omitting any is an error. Scaffold with `docfence new plan` first, then fill in. Validate with `docfence validate` before declaring done.

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
| `## Verification` | `### Test N` blocks with commands and expected results |
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
  has_test: "^### Test"
  has_out_of_scope: "^## Out of Scope"
  has_tools_and_skills: "^## Tools & Skills"
  has_ynp_format: '^- \*\*[^*]+\*\*: (Yes|No|Possibly)\b'
```

## Context
[Why this change is needed — what problem does it solve?]

## Tools & Skills
- **tool_name**: Yes / No (why not needed) / Possibly (when you'd use it)

## Approach
[Recommended approach and rationale — why this direction over alternatives?]

## Out of Scope
- **[Item]**: [one-line justification for exclusion]

## Steps

### Phase 1: [Phase Name]
- [ ] **Step 1**: [Action]
  - Evidence: [cite claim from Evidence Pack, or "known pattern"]
  - Confidence: [0.0–1.0]
  - Details: [specific enough to execute immediately]
- [ ] **Step 2**: [Action]
  - Evidence: [...]
  - Confidence: [...]
  - Details: [...]

### Phase 2: [Phase Name]
- [ ] **Step 3**: [Action]
  ...

## Files to Modify
- `path/to/file.ts` — CREATED
- `path/to/config.ts` — UPDATED

## Reuse
- [Existing code, libraries, or patterns to leverage]

## Evidence Pack

- **Claim**: [what we learned]
  **Source**: [path, URL, or Context7 section]
  **Confidence**: [0.0–1.0]
  **Implication**: [what this means for the plan]

### Gaps
- [What we couldn't verify]

## Verification

### Test 1: [description]
```bash
command --to-run
```
Expected: [what success looks like]

## Bottom Line
- **Per-step confidence**: [average confidence]
- **Key risk**: [biggest risk and mitigation]
- **Gaps**: [1–2 things we couldn't verify]
- **Recommendation**: [proceed / proceed with caution / need more info]
````

## Validation

Every plan is validated against the `plan` docfence doctype (`.docfence/types/plan.toml`). This enforces:
- All 10 required sections present
- No banned words (TODO, TBD, placeholder)
- No unfilled `[REPLACE]` or `df-todo` placeholders

The document-level spec block also enforces structural `match` rules:
- `has_checklist` — at least one `- [ ]` or `- [x]` step exists
- `has_source` — at least one `**Source**` evidence citation exists
- `has_file_marker` — at least one CREATED/UPDATED/DELETED marker in Files to Modify
- `has_test` — at least one `### Test` block in Verification
- `has_out_of_scope` — `## Out of Scope` section exists
- `has_tools_and_skills` — `## Tools & Skills` section exists
- `has_ynp_format` — at least one Y/N/P audit entry (`- **name**: Yes/No/Possibly`)

Run `docfence validate plans/<name>.md` after writing. Fix errors until clean. Do not declare the plan done until validation passes.

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

**Key rule**: Future-you needs it to understand *why* → `docs/` (tracked). Served its purpose → `.local/` (ignored).
**Linking**: Plans reference deeper research via `(Sources: .local/<key>/evidence-pack.md)`.

## Document map (append to every plan)

```text
plans/auth-redesign.md       # CREATED — main plan
docs/specs/auth-flow.md      # CREATED — design spec
docs/decisions/auth-lib.md   # CREATED — why Passport over custom
.local/ISSUE-24/evidence.md  # CREATED — research evidence
```
Markers: `CREATED`, `UPDATED`, `REFERENCED`, `DELETED`