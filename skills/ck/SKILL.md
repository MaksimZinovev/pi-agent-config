---
name: ck
description: Semantic and grep-style code search with AI-optimized output. Use when searching codebases by concept, intent, or pattern. Ideal for finding conceptually similar code without exact keywords like error handling finding try/catch blocks, test discovery and coverage analysis, debugging by finding related code patterns, AI agent workflows requiring structured JSONL output, and exploring unfamiliar codebases by intent. Optimized for LLM agents with decision tree guidance for choosing between semantic, lexical, hybrid, and regex search modes.
---

# ck — Semantic Code Search

Drop-in replacement for grep with semantic search. Find code by meaning, not just text.
Always assume ck is installed. If issues → stop, inform user, wait for feedback.

## Search hierarchy (indexed dir)

`cx` → **`ck`** → `ast_grep` → `read`. Never `grep`/`find` first when cx/ck are available.
Non-indexed dir: **`ck`** → `ast_grep` → `read`.

## Choose a mode

| Intent | Mode | Example |
|---|---|---|
| Known keyword/pattern | `--regex` or `--lex` | `ck --lex "authenticateUser"` |
| Concept/meaning | `--sem` | `ck --sem "error handling"` |
| Unsure / want both | `--hybrid` | `ck --hybrid "async function"` |

## Commands

```bash
ck --sem "error handling" src/                          # semantic search
ck --lex "user authentication"                         # lexical search
ck --regex "const.*=.*require\(" src/                  # traditional grep
ck --hybrid "async function" src/                       # combined
ck --jsonl --no-snippet "database" src/                 # AI-optimized output
ck --sem "validation" --full-section src/               # complete code blocks
ck --sem "api" --threshold 0.8 --topk 5 src/           # filter results
```

## References

- **Mode comparison & benchmarks** → [references/comparison.md](references/comparison.md)
- **Filtering, index mgmt, MCP server** → [references/features.md](references/features.md)
- **AI/agent integration (JSONL, MCP tools)** → [references/ai-integration.md](references/ai-integration.md)
- **Multi-step workflow patterns** → [references/patterns.md](references/patterns.md)