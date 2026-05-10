---
name: inspect
description: Entity-level code review for Git. Triage PRs by structural risk (classification, blast radius, dependency depth), not line count. Scores changes from 0.0-1.0 and groups by logical dependency. CLI + MCP server. Use when reviewing PRs, triaging changes, or finding high-risk entities before LLM review. Triggers: "review PR", "check changes risk", "find critical changes", "inspect diff".
---

# inspect — Entity-Level Code Review

Entity-level code review for Git. Scores changes by risk and groups them by logical dependency.

## Quick Start

```bash
# Basic diff (human-readable)
inspect diff HEAD

# Markdown output (for agents)
inspect diff HEAD --format markdown

# Filter by minimum risk
inspect diff HEAD --min-risk high  # only high/critical

# JSON output (programmatic)
inspect diff HEAD --format json

# Review GitHub PR
inspect pr 42

# LLM-assisted review (requires API key)
export ANTHROPIC_API_KEY=sk-ant-...
inspect review HEAD

# Review uncommitted changes
inspect file src/main.rs
```

## Output Explained

```
inspect 12 entities changed
  1 critical, 4 high, 6 medium, 1 low

groups 3 logical groups:
  [0] src/merge/ (5 entities)
  [1] src/driver/ (4 entities)
  [2] validate (3 entities)

entities (by risk):

  ~ CRITICAL function merge_entities (src/merge/core.rs)
    classification: functional  score: 0.82  blast: 171  deps: 3/12
    public API
    >>> 12 dependents may be affected
```

- **Risk level**: critical (≥0.75) > high (≥0.5) > medium (≥0.25) > low
- **Classification**: text-only (comments/whitespace), syntax (signature/type), functional (logic), or combo
- **Blast radius**: how many entities transitively affected if this breaks
- **Deps**: callers/callees ratio (in/out of changed entities)

## Risk Scoring Formula

Score = f(classification, blast_radius, dependent_count, public_api_exposure, change_type)

- Cosmetic-only (text only, no structural change): 70% discount
- Public API changes: +0.1 to score
- High blast radius (>100): scales score toward critical

## When to Use

**Before LLM review**: `inspect diff` → send top 10 risky entities to LLM = 92% token reduction vs reviewing all
**CI integration**: `inspect diff main..HEAD --format json | jq '.entities[] | select(.risk >= 0.75)'`
**PR review**: `inspect pr 42` auto-comments on highest-risk entities

## MCP Tools

`inspect_triage` — Get top N risky entities
`inspect_entity` — Get details on specific entity
`inspect_group` — Get grouped entities by dependency
`inspect_file` — Get all entities in a file
`inspect_stats` — Get aggregate risk statistics
`inspect_risk_map` — Get full risk heatmap

## Architecture

- `inspect-core` — analysis engine, LLM integration, risk scoring
- `inspect-cli` — CLI commands
- `inspect-mcp` — MCP server (6 tools)
- `inspect-api` — REST API (Axum, deployed via Docker)

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...       # LLM review
OPENAI_API_KEY=sk-...             # LLM review
OLLAMA_BASE_URL=http://localhost:11434  # Local models
INSPECT_TOKEN=...                 # Hosted API auth
GITHUB_TOKEN=ghp_...              # PR access (falls back to gh CLI)
```
