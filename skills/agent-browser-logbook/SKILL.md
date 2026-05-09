---
name: agent-browser-logbook
description: Captures real-world learnings, pitfalls, and site-specific quirks discovered during agent-browser tasks. Always read this BEFORE running agent-browser commands, and ALWAYS append new entries after recovering from errors or discovering non-obvious workflows. This skill is the living memory that makes agent-browser usage progressively smarter.
allowed-tools: Bash(agent-browser:*), Bash(npx agent-browser:*), Bash(mkdir:*), Bash(cat:*)
---

# agent-browser Logbook

Living memory of hard-won knowledge from real tasks. Canonical skills (core, electron, dogfood) teach *how* agent-browser works. This logbook teaches *what actually works*.

## When to read

**Read this before every agent-browser session.** Skim headings in:

- `references/pitfalls.md` — things that bite you
- `references/patterns.md` — workflows that work reliably
- `references/site-specifics.md` — per-site quirks

## When to write

**Append a log entry automatically when:**

1. **Error recovery** — Hit an error, found the cause, fixed it. Write it down.
2. **Non-obvious discovery** — Found a workflow/flag/sequence not in the docs but essential.
3. **Site-specific quirk** — A site behaves unexpectedly (timing, headless detection, shadow DOM).
4. **Pattern refinement** — A documented approach has a better alternative. Note it.

## Entry format — progressive disclosure

Every entry uses progressive disclosure: **title + one-liner first** so a reader can scan quickly, then expand for details.

```
## [YYYY-MM-DD] Short title

**TL;DR:** One sentence — the fix or takeaway. Scannable in 2 seconds.

**Context:** What task? What went wrong? Why is this non-obvious?
**Applies to:** core / electron / dogfood — and which sites

### The problem

1-3 sentences max. What broke, what surprised you, what you expected.

### The fix

```bash
# Minimal runnable reproduction — copy-paste and it works
agent-browser open <url>
agent-browser wait --load networkidle
agent-browser snapshot -i
```

### Why (optional, if non-obvious)

1-2 sentences on the underlying cause. Skip if obvious from the fix.
```

## Entry quality rules

These are enforced by `templates/validate-logbook.sh`. Entries that violate rules will fail validation.

| Rule | Limit | Why |
|------|-------|-----|
| Max lines per entry | **40 lines** (hard limit) | Entries must be scannable. Split if longer. |
| Required fields | `TL;DR`, `Context`, `Applies to` | A reader in a rush needs the gist instantly. |
| Bash blocks | Every entry must include ≥1 `bash` code block | No hand-waving — show the command. |
| One topic per entry | No compound entries | "Stale refs AND wait timing" → two separate entries. |
| No duplicate dates | Each `[YYYY-MM-DD]` + title must be unique within a file | Prevents merge conflicts and confusion. |

## Filing guide

| What happened | File it in | Example |
|---------------|-----------|---------|
| Something broke or surprised you | `references/pitfalls.md` | Stale refs, silent failures, timing issues |
| Found a reliable workflow | `references/patterns.md` | Snapshot-wait-act loop, session reuse |
| A site behaves weirdly | `references/site-specifics.md` | Google CAPTCHA, Shadow DOM, SPA quirks |

## Cross-referencing canonical skills

When a log entry complements a canonical skill, link it:

- Pitfall about snapshot refs → `agent-browser-core > references/snapshot-refs.md`
- Electron app quirk → `agent-browser-electron > SKILL.md`
- Testing workflow → `agent-browser-dogfood > references/issue-taxonomy.md`

Canonical skills stay pristine. All learnings go here.

## Validation

Run before committing logbook changes:

```bash
bash ~/.pi/agent/skills/agent-browser-logbook/templates/validate-logbook.sh
```

Checks entry length (40 lines max), required structure (`TL;DR`, `Context`, `Applies to`), bash code block presence, and duplicate titles.

## Maintenance

- **Prune quarterly** — Remove outdated entries (site redesigned, bug fixed upstream).
- **Promote rarely** — 5+ entries on same topic → consolidate into one.
- **Never delete files** — Only prune entries. Structure stays stable.

## File structure

```
agent-browser-logbook/
├── SKILL.md              ← This file — read/write rules
├── references/
│   ├── pitfalls.md       ← Things that break or bite you
│   ├── patterns.md       ← Reliable workflows and techniques
│   └── site-specifics.md ← Per-site quirks and fixes
└── templates/
    ├── log-entry.md      ← Template for new entries
    └── validate-logbook.sh  ← Enforce entry quality rules
```