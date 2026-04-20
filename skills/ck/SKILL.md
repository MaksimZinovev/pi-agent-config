---
name: ck
description: Semantic and grep-style code search with AI-optimized output. Use when searching codebases by concept, intent, or pattern. Ideal for finding conceptually similar code without exact keywords like error handling finding try/catch blocks, test discovery and coverage analysis, debugging by finding related code patterns, AI agent workflows requiring structured JSONL output, and exploring unfamiliar codebases by intent. Optimized for LLM agents with decision tree guidance for choosing between semantic, lexical, hybrid, and regex search modes.
---

# ck (seek)

ck is a drop-in replacement for grep with semantic search capabilities. Use it to find code by meaning, not just text.

## Quick Start

```bash
# Semantic search - finds conceptually similar code
ck --sem "error handling" src/

# Lexical search - full-text search with ranking
ck --lex "user authentication"

# Hybrid search - combines regex + semantic
ck --hybrid "async function"

# AI-optimized output for agent workflows
ck --jsonl --no-snippet "database" src/
```

## Search Mode Decision Tree

Choose the right mode based on your search intent:

```
┌─────────────────────────────────────────────────────────────────┐
│ What are you trying to find?                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    Exact keyword     Concept/Intent     Unsure or
    or pattern?       or meaning?      want both?
            │               │               │
            ▼               ▼               ▼
       --regex          --sem          --hybrid
       or --lex       (best first      (try both)
    (traditional)     choice for       fallback
                       concepts)       when unsure

┌─────────────────────────────────────────────────────────────────┐
│ Special Cases:                                                  │
├─────────────────────────────────────────────────────────────────┤
│ • AI/agent workflows → Add --jsonl --no-snippet                 │
│ • Complete code blocks → Add --full-section                    │
│ • Known function names → Use --lex or --regex                  │
│ • Understanding patterns → Use --sem with --full-section       │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use Each Mode

| Mode | Best For | Example |
|------|----------|---------|
| `--sem` | **Concept-based search** | "error handling" finds try/catch, throws, error returns |
| `--lex` | **Exact terms with ranking** | "authenticateUser" finds that function, ranked by relevance |
| `--hybrid` | **Precision + recall** | "auth" finds both "authenticate" and semantic matches |
| `--regex` | **Traditional grep patterns** | "const.*=.*require\(" for exact pattern matching |

## AI/Agent Optimization

For LLM workflows, always use structured output:

```bash
# Recommended: JSONL streaming with full context
ck --jsonl --full-section "database connection" src/

# For large result sets, limit and filter
ck --jsonl --topk 5 --threshold 0.7 "retry logic" src/

# Exclude snippets to reduce token usage
ck --jsonl --no-snippet --sem "test setup" tests/
```

**Why JSONL?**
- Streaming format - process results incrementally
- Error-resilient - one bad result doesn't break parsing
- Standard in AI pipelines - LLM-friendly structure
- Memory-efficient - doesn't load full output into context

## Common Patterns

### Debugging: Find Error Handling

```bash
# Semantic search finds all error patterns
ck --sem "error handling" --full-section src/
```

**Result:** Finds try/catch blocks, error returns, exception handling - even without exact keywords.

### Test Discovery: Find Related Tests

```bash
# Find tests by intent, not filename patterns
ck --jsonl --sem "authentication test" tests/
```

**Result:** Finds login tests, auth middleware tests, signup validation - even if named differently.

### Concept Search: Understand Implementation

```bash
# Find database code without knowing function names
ck --hybrid --full-section "database connection" src/
```

**Result:** Shows complete connection setup code, config loading, and error handling.

### MCP Server Mode

For Claude Code or Cursor integration:

```bash
# Start MCP server for AI agent access
ck --serve
```

Provides tools: `semantic_search`, `regex_search`, `hybrid_search`, `index_status`, `reindex`, `health_check`.

## Result Filtering

Control output quality with thresholds:

```bash
# Top 10 results (default for semantic)
ck --sem "bug fix" --topk 10 src/

# High-confidence results only
ck --sem "api" --threshold 0.8 src/

# Show scores in output
ck --sem "cache" --scores src/
```

**Threshold Guidelines:**
- `0.8+` : High precision, exact concept matches
- `0.6-0.8` : Balanced (semantic search default)
- `0.4-0.6` : High recall, broader matches
- `0.02-0.05` : Hybrid search RRF scores

## Index Management

```bash
# Check index status before semantic search
ck --status .

# Pre-build index for faster searches
ck --index .

# Clean up orphaned files
ck --clean-orphans .

# Start fresh with different model
ck --switch-model nomic-v1.5
```

**Models:**
- `bge-small` : Default, fast (512 context)
- `nomic-v1.5` : Higher quality, 8k context
- `jina-code` : Code-specialized

## Advanced Features

### Full Section Extraction

```bash
# Returns complete functions/classes, not just lines
ck --sem "validation" --full-section src/
```

Uses tree-sitter to identify semantic boundaries. Supported: Python, JavaScript, TypeScript, Haskell, Rust, Ruby.

### Reranking for Better Relevance

```bash
# Enable cross-encoder reranking
ck --sem "authentication" --rerank src/

# Use specific reranking model
ck --sem "login" --rerank-model bge src/
```

## When to Escalate to References

- **Detailed mode comparison:** See [references/comparison.md](comparison.md) for benchmarks
- **JSONL parsing patterns:** See [references/ai-integration.md](ai-integration.md)
- **Complex workflows:** See [references/patterns.md](patterns.md) for multi-step examples
