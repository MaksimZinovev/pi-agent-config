---
name: cx
description: Semantic code navigation for AI agents. File overviews, symbol search, definitions, and references — without running a language server. cx gives agents a cost ladder. Start cheap, escalate only when needed
---

# cx — Semantic Code Navigation

Always assume cx is installed. Issues → stop, inform user, wait for feedback.

## Search hierarchy (indexed dir)

**`cx`** → `ck` → `ast_grep` → `read`. Never `grep`/`find` first when cx/ck are available.
Use relative paths from project root (e.g. `cx overview apps/cli/src/auto.ts`).

## Escalation: overview → symbols → definition → read

| Goal | Command | Cost |
|---|---|---|
| New codebase / explore dir | `cx overview <dir>` | ~20 tok/entry |
| File structure | `cx overview <file>` | ~200 tok |
| Find symbols | `cx symbols [--kind K] [--name GLOB] [--file PATH]` | varies |
| Function/type body (use before Edit) | `cx definition --name X` | ~500 tok |
| All usages | `cx references --name X` | varies |
| Blast radius per caller | `cx references --name X --unique` | varies |

Fall back to `read` only for full-file or context beyond symbol body.
Before editing: `cx definition --name X` gives exact `old_string` text without reading the whole file.
For usage patterns, see [references/usage-guide.md](references/usage-guide.md).

## Quick reference

```
cx overview PATH                                    table of contents
cx overview DIR --full                              with signatures (non-recursive)
cx symbols [--kind K] [--name GLOB] [--file PATH]   search symbols
cx definition --name NAME [--from PATH] [--kind K]  get symbol body
cx references --name NAME [--file PATH] [--unique]  find usages
cx lang add LANG                                    install missing grammar
```

Aliases: `cx o`, `cx s`, `cx d`, `cx r` | Kinds: fn, method, struct, enum, trait, type, const, class, interface, module, event