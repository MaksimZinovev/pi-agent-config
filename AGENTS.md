# Agents.md

You have access to many tools and skills. Choose the optimal tools and skills for the current task and context. Always let user know if you have any issues with acting skills or tools, then wait for feedback.

- ALWAYS check and present evidence before reporting the change or task is
is done, No evidence - not done. Prefer programmatic checks over direct check where possible.
- Use skills proactively without asking.
- Autonomously decide which skills to use.
- Apply relevant skills as needed — don't wait for permission.
- If you encounter repeating failures or errros (2 or more), immediately use skill: systematic-debugging.
- Auto-invoke systematic-debugging on any error
- Reading files tool selection:
  - Indexed dir (has git root): `cx` first → `ck` → `ast_grep` → `read`
  - Non-indexed dir (no git root): `ck` first → `ast_grep` → `read`
  - Never use `grep`/`find` in either case.
  - Use relative paths from project root (e.g. `cx overview apps/cli/src/auto.ts`).
  - Before editing → `cx definition --name X` gives exact text for Edit's `old_string`.
  - Fall back to `read` only when you need the full file or context beyond the symbol body.
  - New codebase → start with `cx overview .` to orient before drilling in.
  - Deeper tool details → see `AGENTS_TOOLING.md`.

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
