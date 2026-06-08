# Features & Configuration

## Result Filtering

```bash
ck --sem "bug fix" --topk 10 src/       # top 10 results
ck --sem "api" --threshold 0.8 src/      # high-confidence only
ck --sem "cache" --scores src/          # show scores in output
```

Threshold guidelines:
- `0.8+` — high precision, exact concept matches
- `0.6–0.8` — balanced (semantic default)
- `0.4–0.6` — high recall, broader matches
- `0.02–0.05` — hybrid search RRF scores

## Full Section Extraction

`--full-section` returns complete functions/classes using tree-sitter boundaries (not just matching lines). Supported: Python, JavaScript, TypeScript, Haskell, Rust, Ruby.

## Reranking

```bash
ck --sem "authentication" --rerank src/              # enable cross-encoder reranking
ck --sem "login" --rerank-model bge src/             # specify reranking model
```

## MCP Server Mode

```bash
ck --serve    # start MCP server for Claude Code / Cursor integration
```

Provides tools: `semantic_search`, `regex_search`, `hybrid_search`, `index_status`, `reindex`, `health_check`.

## Index Management

```bash
ck --status .              # check index status
ck --index .               # pre-build index for faster searches
ck --clean-orphans .       # clean up orphaned files
ck --switch-model nomic-v1.5   # switch embedding model
```

Models: `bge-small` (default, fast, 512 context), `nomic-v1.5` (higher quality, 8k context), `jina-code` (code-specialized).