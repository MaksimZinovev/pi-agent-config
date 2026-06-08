---
id: P2
type: plan
status: done
owner: human
---

# P2: Skill Missing Format Reference and Validation Loop

```spec
scope: document
type: plan
```

## Tools & Skills
- docfence CLI: Yes — validate and scaffold plan documents
- cx/ck: No — not needed for this config task
- DeepWiki: No — no repo architecture research needed
- Context7: No — no external library docs needed
- hex_edit: Possibly — used in prior session for edits

## Context
The grounded-planning skill produces plans but never instructs the planner to reference `references/format.md` or validate output against it — plans are produced without checking format compliance. Docfence already supports typed validation via `.docfence/types/`, so we can create a doctype that codifies the grounded-plan format and enforce it automatically.

## Approach
Two changes, both minimally scoped:

1. Create a `plan` doctype in docfence — maps the 8 required sections from `format.md` into a `.toml` type definition with required sections, frontmatter fields, banned words, 150-line limit, and placeholder templates.
2. Add explicit workflow steps to SKILL.md — "read references/format.md before writing" and "run `docfence validate` on the plan, fix errors" as numbered steps in the Quick Reference and Workflow sections.

This beats alternatives because the doctype makes format compliance machine-checkable (not just a suggestion in prose), and the SKILL.md changes make the agent actually follow through.

## Out of Scope
- Structure rule: strict heading-level enforcement — deferred to future `heading_level` rule
- CI integration: automated validation on commit — separate P6 plan
- Other doc types: only `plan` doctype is in scope; exploration/feature types unchanged

## Steps

### Phase 1: Create `plan` doctype in docfence
- [ ] Step 1: Create `.docfence/types/plan.toml` in the docfence repo
  - Evidence: existing types (feature.toml, exploration.toml) define the schema
  - Confidence: 0.95
  - Details: define name, statuses, required_fields, required_sections matching format.md, banned words, template_vars for each section with `[REPLACE]` fill text
- [ ] Step 2: Add the `plan` doctype to the pi-agent-config repo (`.docfence/types/`) so plans written there can be validated
  - Evidence: docfence looks for `.docfence/types/` relative to target path
  - Confidence: 0.9
  - Details: copy the same toml file to both repos so local validation works without docfence dev install

### Phase 2: Add format reference + validation steps to SKILL.md
- [ ] Step 3: Add "Read references/format.md" as an explicit step between current Step 6 (Write Evidence Pack) and Step 7 (Write the Grounded Plan) in the Quick Reference and Workflow
  - Evidence: the plan says "Add 'read references/format.md before writing' to SKILL.md workflow"
  - Confidence: 1.0
  - Details: insert as new numbered item in the Quick Reference code block and as a sub-step in Step 5 of the Workflow section
- [ ] Step 4: Add "Run docfence validate and fix errors" as the final step (after Validate current Step 10) in the Quick Reference and after Step 6 (Write the Bottom Line) in the Workflow
  - Evidence: the plan says "run docfence validate and fix errors"
  - Confidence: 1.0
  - Details: command should be `docfence validate plans/<name>.md`; if errors, fix and re-run until clean
- [ ] Step 5: Update the Hard Requirements section to add "Do not skip format validation" rule
  - Evidence: current Hard Requirements don't mention format validation at all
  - Confidence: 0.9
  - Details: add bullet: "Do not skip `docfence validate` — every plan must pass validation before delivery"

## Files to Modify
- `docfence/.docfence/types/plan.toml` — CREATED (new doctype)
- `pi-agent-config/.docfence/types/plan.toml` — CREATED (copy for pi-agent-config repo)
- `pi-agent-config/skills/grounded-planning/SKILL.md` — UPDATED (workflow steps + hard requirements)
- `pi-agent-config/skills/grounded-planning/references/format.md` — UPDATED (add note about docfence doctype)

## Reuse
- Existing `feature.toml` and `exploration.toml` as templates for the new doctype
- Existing `references/format.md` Required Sections table as the source of truth for required_sections

## Evidence Pack

- Claim: Docfence validates markdown docs against type definitions in `.docfence/types/`
  Source: docfence README — Quick Start, Types sections
  Confidence: 1.0
  Implication: We can create a `plan` type that enforces the 8 required sections

- Claim: Type definitions support required_sections, required_fields, banned_words, template_vars with fill placeholders
  Source: `.docfence/types/exploration.toml` and `feature.toml`
  Confidence: 1.0
  Implication: All the validation rules we need (sections, frontmatter, banned words) are already supported by the type system

- Claim: Docfence looks for `.docfence/types/` relative to the target path
  Source: README note "docfence looks for .docfence/types/ relative to the target path"
  Confidence: 1.0
  Implication: Both repos need the doctype definition in their own `.docfence/types/` directory

- Claim: The 8 required sections in format.md are: Context, Approach, Steps, Files to Modify, Reuse, Evidence Pack, Verification, Bottom Line
  Source: `skills/grounded-planning/references/format.md` Required Sections table
  Confidence: 1.0
  Implication: These map directly to `required_sections` in the toml

### Gaps
- Need to confirm: what frontmatter fields are required for a plan? (✓ resolved: standard fields — id, status, owner)
- Need to confirm: what statuses make sense? (✓ resolved: standard existing — draft → active → frozen → done)
- Need to confirm: what max_chars limit for a plan? (✓ resolved: 150 lines max, can exceed with justification)

## Verification

### Test 1: Docfence recognizes the new type
```bash
cd /Users/maksim/repos/docfence && docfence types
```
Expected: `plan` appears in the list

### Test 2: Validate a plan with missing sections fails
```bash
cd /Users/maksim/repos/docfence && docfence validate sample-docs/bad-grounded-plan.md
```
Expected: errors for each missing required section

### Test 3: Validate a well-formed plan passes
```bash
cd /Users/maksim/repos/pi-agent-config && docfence validate plans/some-plan.md
```
Expected: clean validation, no errors
## Bottom Line
- Per-step confidence: 0.96
- Key risk: Doctype definition might not cover all edge cases in plan format (e.g., sub-sections under Evidence Pack) — mitigate by starting with exact required sections from format.md and iterating
- Gaps: Statuses for the new doctype need final confirmation (likely standard `draft → active → frozen → done`)
- Recommendation: Proceed — the changes are small and well-scoped

---

## Decisions

1. Doctype name: `plan` — short and generic, matches the output artifact
2. Frontmatter required fields: Standard fields (`id`, `status`, `owner`) — consistent with feature/exploration types
3. Status lifecycle: Standard existing (`draft → active → frozen → done`) — no custom statuses needed
4. Size limit: 150 lines max. Can exceed with justification included in the plan itself. Simpler changes should aim for shorter plans.
5. Toml location: Both repos — docfence repo (canonical) + pi-agent-config repo (local validation works without docfence dev install)