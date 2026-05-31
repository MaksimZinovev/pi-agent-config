# AGENTS_TOOLING.md

Additional tool-specific details. Only read when you need deeper guidance on `cx`/`ck`/`ast_grep` behavior. See `AGENTS.md` for the baseline rules.


## cx internals

- `cx` is auto-warmed at session start via the `cx-cache-warm` extension. `--root` is auto-injected — no need to pass it manually.
- Token budget per operation (approximate):
  - `cx overview <dir>` — ~20 tokens (lightweight directory scan)
  - `cx overview <file>` — ~200 tokens (file structure summary)
  - `cx definition --name <name>` — ~500 tokens (full symbol body)




## cx references

- `cx references --name <name>` — every usage, with enclosing function and context
- `cx references --name <name> --unique` — one row per caller (use before refactoring to check blast radius)

## ck patterns

- `ck "pattern" PATH` — semantic grep (replaces `grep`/`find`; prefer over raw text search)
- `ck --sem "concept" PATH` — semantic search by concept
- `ck --lex "phrase" PATH` — BM25 full-text search
- `ck --hybrid "pattern" PATH` — regex + semantic combined

## ast_grep_search

- `ast_grep_search` does structural AST-based matching — no indexing needed, works on raw source
- Use when you need precise code structure matching (e.g. matching function calls, import statements) rather than text patterns

## Pre-flight gate (cx-ck-preflight)

- At session start, `grep`/`find` are **hard-blocked** until the agent runs both `cx overview .` and `ck --index .` itself.
- The extension does **not** run the commands on the agent's behalf — the agent must run them, building the habit.
- If either command fails, the agent must STOP and tell the user — no falling back to universal tools.
- Once both commands are detected, `grep`/`find` are unblocked (the `cx-first-reminder` still nudges ongoing usage).

## .ckignore — controlling what ck indexes

- `ck` auto-generates a `.ckignore` file on first `ck --index .` with sensible defaults (images, binaries, archives, etc.).
- Syntax is identical to `.gitignore` (glob patterns, `!` for negation).
- **Add project-specific exclusions** to `.ckignore` to keep the semantic index lean:

  ```gitignore
  # Exclude generated code
  src/generated/
  *.pb.ts

  # Exclude vendored dependencies
  vendor/
  node_modules/

  # Exclude large data files
  *.csv
  *.ndjson

  # Negation: re-include something that was previously excluded
  !src/generated/important-api.ts
  ```

- **View defaults**: `ck --print-default-ckignore` shows the built-in ignore patterns.
- **Force re-index** after editing: `ck --index .` picks up `.ckignore` changes automatically.
- **Disable temporarily**: `ck --no-ckignore "pattern" .` bypasses `.ckignore` for a single query.

## After context compression

- If context becomes saturated and you need to re-orient: use `cx overview .` to regain bearings, then `cx definition` for specific symbols
- Don't re-read full files from scratch — use targeted `cx` commands first
