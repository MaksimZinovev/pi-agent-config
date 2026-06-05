# Grounded Planning × Plannotator — Format Reference

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