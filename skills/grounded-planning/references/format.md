# Grounded Planning × Plannotator — Format Reference

Every plan **must** contain these sections. Omitting any is an error. Validate with `docfence validate` before declaring done.

## Required Sections

| Section | Purpose |
|---------|---------|
| `## Context` | Why this change is needed |
| `## Approach` | Recommended direction and why, over alternatives |
| `## Steps` | `- [ ]` checklist items with evidence citations |
| `## Files to Modify` | Explicit list: create, update, or delete |
| `## Reuse` | Existing code, libraries, or patterns to leverage |
| `## Evidence Pack` | Claims with Source, Confidence, Implication |
| `## Verification` | `### Test N` blocks with commands and expected results |
| `## Bottom Line` | Per-step confidence, key risk, gaps, recommendation |

## Full Format Template

```
# [Task Name]

## Context
[Why this change is needed — what problem does it solve?]

## Approach
[Recommended approach and rationale — why this direction over alternatives?]

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
```

## Workflow

1. Spawn planner subagent → it writes `plans/<name>.md`
2. Run `/plannotator-annotate plans/<name>.md` → visual review in browser

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