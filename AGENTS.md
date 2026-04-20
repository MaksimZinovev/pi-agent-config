
# Agents.md

You have access to many tools and skills. Choose the optimal tools and skills for the current task and context. Always let user know if you have any issues with acting skills or tools, then wait for feedback.

- Use skills proactively without asking.
- Autonomously decide which skills to use.
- Apply relevant skills as needed — don't wait for permission.
- If you encounter repeating failures or errros (2 or more), immediately use skill: systematic-debugging.
- Auto-invoke systematic-debugging on any error
- Always use cx before reading files

## Skill Triggers (Invoke Immediately)

| Trigger                               | Skill                            |
| -------------------                   | -------------------------------- |
| Unclear error                         | `systematic-debugging`           |
| Need docs/evidence/install new tool   | `research-docs-grounding`        |
| Browser automation                    | `agent-browser`                   |


## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.  By default, I assume it is already installed globally.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes

## Search hierarchy: cx → ck → ast_grep_search/lsp_navigation → read (never grep/find)

`cx` is auto-warmed at session start (cx-cache-warm extension) and `--root` is auto-injected.
If `cx` reports "no indexed files" (non-code dirs, no git root), fall back to `ck` or `ast_grep_search`.
Use relative paths from project root: `cx overview apps/cli/src/auto.ts` not absolute paths.

- Explore a directory → `cx overview <dir>` (~20 tokens per entry)
- Understand a file's structure → `cx overview <file>` (~200 tokens)
- Find symbols across the project → `cx symbols [--kind K] [--name GLOB] [--file PATH]`
- Read a specific function/type → `cx definition --name <name>` (~500 tokens)
- Find all usages of a symbol → `cx references --name <name>` shows every usage with enclosing function and context
- Check blast radius before refactoring → `cx references --name <name> --unique` shows one row per dependent function
- Fall back to Read tool only when you need the full file or surrounding context beyond the symbol body
- Text search → `ck "pattern"` (semantic grep, replaces grep/find — use before raw grep/find)
- AST patterns → `ast_grep_search` (structural code matching, no indexing needed)


## When to use cx/ck instead of Read or grep

- New codebase → `cx overview .` then drill in. Cheaper than `ls` + reading files.
- Before reading a file → `cx overview <file>` first. You often don't need the full file.
- Before editing → `cx definition --name X` gives exact text for Edit's `old_string`.
- Before refactoring → `cx references --name X --unique` shows which functions depend on X.
- Text search → `ck "pattern"` (semantic grep, always prefer over grep/find).
- After context compression → `cx overview` to re-orient, `cx definition` for specific symbols. Don't re-read the full file.

## Quick reference

```
cx overview PATH                                    file or directory table of contents
cx overview DIR --full                              directory overview with signatures
cx symbols [--kind K] [--name GLOB] [--file PATH]   search symbols project-wide
cx definition --name NAME [--from PATH] [--kind K]  get a function/type body
cx references --name NAME [--file PATH] [--unique]   find all usages (--unique: one per caller)
ck "pattern" PATH                                   semantic grep (replaces grep/find)
ck --sem "concept" PATH                             semantic search
ck --lex "phrase" PATH                              BM25 full-text search
ck --hybrid "pattern" PATH                           regex + semantic combined
cx lang list                                         show supported languages
cx lang add LANG [LANG...]                           install language grammars
```

Short aliases: `cx o`, `cx s`, `cx d`, `cx r`

Symbol kinds: fn, method, struct, enum, trait, type, const, class, interface, module, event

Check signatures for `pub`/`export` to identify public API without reading the file.

## Missing grammars

If cx reports a missing grammar (e.g. `cx: rust grammar not installed`), install it with `cx lang add rust`. Run `cx lang list` to see what's installed.
