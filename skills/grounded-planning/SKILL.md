---
name: grounded-planning
description: |
  Researches evidence from documentation, repos, and web sources, then produces a grounded action plan where every step cites its sources. Use when the user asks to plan, architect, design, or decide between approaches — and also when facing any multi-step coding task, unfamiliar library, configuration question, or uncertainty where guessing would be risky. Use when subagents report errors, confusion, or inconsistent results. Use when you notice patterns like "I'm not sure", "maybe", "probably", "Error", "not found", "inconsistent", or "weird". NOT for single-step lookups where the answer is already known. Always use grounded-planning instead of guessing — even for simple tasks, a quick sanity check costs seconds and prevents hours of debugging.
---

# Grounded Planning

Research first, then plan — never guess when evidence is available.

**Announce at start:** "I'm using grounded-planning to research evidence before planning."

## Scope

Research → Plan → Validate. Do not edit code/config/docs during the research phase. The plan phase produces an actionable document; execution is separate. Validate the final plan against the required output format before declaring done.

## Quick Reference

```
1. Announce: "Using grounded-planning"
2. Classify uncertainty (low/medium/high)
3. Define the unknown in 1 sentence
4. Break into keywords; build queries
5. Check sources in priority order; stop when sufficient
6. Write Evidence Pack (≤8 claims for low/medium; ≤12 for high)
7. Write the plan with all required sections (see Step 5 table)
8. Write Bottom Line summary
9. State gaps explicitly — never hide missing evidence
10. Validate: every required section present, steps use `- [ ]` format
```

## Source Priority Order

Always check sources in this order. Stop when evidence is sufficient — do not query all sources by default.

```
Local ($LLMSTXT_HOME) → Context7 → DeepWiki → GitHub MCP → Web Search → Web Fetch
     (fastest)                                                       (slowest)
```

| Source | Tool | Use When | Fallback |
|--------|------|----------|----------|
| Local docs | `Read`, `Grep`, `Glob` in `$LLMSTXT_HOME` | The library/tool has cached local docs | Check `tree -L 1 $LLMSTXT_HOME` first |
| Context7 | `mcporter call 'context7.resolve-library-id(...)'` then `mcporter call 'context7.query-docs(...)'` | Need official library docs, API refs, code examples | See references/source-priority.md for pagination |
| DeepWiki | `deepwiki_ask_question` → `deepwiki_read_wiki_structure` → `deepwiki_read_wiki_contents` | Need repo architecture, design decisions, how components fit together | If ask_question fails: verify index → read contents → fallback to `gh api` |
| GitHub MCP | `github_search_code`, `github_get_file_contents`, `github_search_issues` | Need source code, issue context, PR discussions, CHANGELOG | Use `gh api repos/owner/repo/contents` for raw file access |
| Web Search | `web_search` | Need version compatibility, latest updates, community answers | Use `freshness` filter for recent info |
| Web Fetch | `web_fetch` | Need content from a specific URL found during earlier searches | Verify URL came from a prior source |

**Key rule**: Every claim in the plan must trace back to at least one source. Start local and specific. Only escalate to broader sources when local/specific sources lack the answer.

### DeepWiki Fallback Workflow

If `deepwiki_ask_question` fails:
1. Verify the repo is indexed via `deepwiki_read_wiki_structure`
2. Use `deepwiki_read_wiki_contents` for documentation pages
3. Fallback to `gh api` (`gh repo view`, `gh api repos/owner/repo/contents`) for unindexed repos

## Workflow

### Step 1: Classify Uncertainty

Before researching, assess how deep the evidence needs to be:

| Uncertainty Level | Signs | Action |
|-------------------|-------|--------|
| **Low** | Well-known pattern, official docs available, routine task | Quick sanity check: 1–2 sources, 1 Context7 query |
| **Medium** | Unfamiliar API, version question, integration concern | Standard research: 2–3 sources, up to 3 queries |
| **High** | New framework, conflicting info, architecture decision | Deep research: all relevant sources, up to 5 queries across multiple sources |

**Announce the level**: "Uncertainty: [low/medium/high] — plan: [brief research scope]"

### Step 2: Define the Unknown

State in one sentence what must be true to proceed. Break it into search keywords.

```
Unknown: "FastAPI middleware ordering rules for auth + CORS"
Keywords: fastapi middleware order, fastapi cors auth sequence
```

If there are multiple unknowns, list them all before researching. Tackle the most blocking one first.

### Step 3: Run Evidence Collection

Follow the source priority order. For each source:

1. **Local** — Check `$LLMSTXT_HOME` for relevant docs
2. **Context7** — Resolve library, query docs (start page=1, mode=info unless code examples needed)
3. **DeepWiki** — Ask question about repo; if it fails, follow the fallback workflow above
4. **GitHub** — Search code, issues, PRs for the specific question
5. **Web Search** — General queries, version compatibility, latest updates
6. **Web Fetch** — Only for URLs found in earlier results

**Stay tight:**
- Start with page=1 for Context7
- Max 3 Evidence Pack queries per question at low/medium uncertainty
- Max 5 at high uncertainty
- Prefer short quotes/claims — never paste long docs verbatim
- Clearly state when evidence is insufficient or gaps exist

### Step 4: Write the Evidence Pack

Use this exact format for each claim:

```
## Evidence Pack

- **Claim**: [what we learned, stated precisely]
  **Source**: [local path, Context7 section/title, DeepWiki topic, GitHub URL/issue, web URL]
  **Confidence**: [0.0–1.0]
  **Implication**: [what this means for the plan]

- **Claim**: [next piece of evidence]
  **Source**: [...]
  **Confidence**: [...]
  **Implication**: [...]

### Gaps
- [What we couldn't verify and why]
- [What would require running code or checking logs]

### Sources Used
- [List all sources actually consulted]
```

### Step 5: Write the Grounded Plan

The final plan **must** contain all 8 sections and use `- [ ]` checklists for steps, not bold headers. Minimal structure:

```
# [Task Name]
## Context — why this change is needed
## Approach — recommended direction and why
## Steps — phased `- [ ]` checklists with evidence citations
## Files to Modify — explicit list (CREATED/UPDATED/DELETED)
## Reuse — existing code or patterns to leverage
## Evidence Pack — claims with Source, Confidence, Implication
## Verification — `### Test N` blocks with commands + expected results
## Bottom Line — confidence, key risk, gaps, recommendation
```

See `references/format.md` for the full template with examples and directory layout.

### Step 6: Write the Bottom Line

Every plan ends with a Bottom Line. See `references/format.md` for the format.

## Hard Requirements

These are non-negotiable. Violating any of these makes the output unreliable.

- **Do not claim you read a URL** unless it came from a source output
- **Do not infer runtime results** without a log/trace/config snippet
- **Do not propose code diffs** in the Evidence Pack — that's for the Plan phase
- **Do not paste entire documentation pages** — extract only the relevant claim
- **Do not skip Phase 1** (evidence) and jump to Phase 2 (planning)
- **Do not produce plan steps without evidence citations**
- **Do not use `**Step N**:` bold headers** — use `- [ ]` checklist items under `## Steps`
- **Do not omit required sections** — Context, Approach, Steps, Files to Modify, Reuse, Evidence Pack, Verification, Bottom Line must all appear
- **Do not query all sources by default** — start local and escalate only as needed
- **If evidence is insufficient**: ask the user for the exact missing observation (command output, log, file snippet, clarification). Do NOT fabricate claims
- **If sources conflict**: record both claims, propose a discriminating check, and ask the user to verify
- **If the user says "just go ahead"**: switch to low uncertainty mode, clearly note what was not verified

## Stop Conditions

- **Evidence sufficient**: Proceed to planning with cited confidence
- **Evidence insufficient**: Ask for the exact missing observation — don't guess
- **Sources conflict**: Record both claims and propose a discriminating check
- **User overrides**: Switch to low uncertainty, note unverified items

## When to Escalate Uncertainty

Reclassify from low → medium if:
- Local docs don't cover the specific version or feature
- Context7 returns no results for the library

Reclassify from medium → high if:
- Multiple sources give conflicting information
- The feature/API was recently changed
- No documentation exists for the specific integration point