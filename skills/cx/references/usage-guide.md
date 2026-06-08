# cx Usage Guide

## When to use cx instead of Read

- Exploring a new codebase — start with `cx overview .` to see top-level structure, then drill into subdirectories. Cheaper than `ls` + reading files.
- Before reading a file — run `cx overview` first. You often don't need the full file.
- Before editing a function — `cx definition --name X` gives you the exact text for Edit tool's `old_string` without reading the whole file.
- Before refactoring — `cx references --name X --unique` shows which functions depend on X (one row per caller). Use without `--unique` to see every usage with context lines.
- Understanding how a symbol is used — `cx references --name X` shows each usage site with the enclosing function and the source line, so you can see if it's called, used as a type, imported, etc.
- Exploring a codebase — use `cx symbols` to find what you need across files, then `cx definition` to read specific symbols. Avoid reading file after file.
- After context compression — if you previously read a file but the content was compressed out, use `cx overview` to re-orient and `cx definition` for the specific symbols you need. Don't re-read the full file.

## Reading patterns

- Check signatures for `pub`/`export` to identify public API without reading the file.
- `cx overview DIR --full` includes signatures (not recursive, only files in DIR root).
- `cx overview DIR/subdir --full` for subdirectory overviews with signatures.