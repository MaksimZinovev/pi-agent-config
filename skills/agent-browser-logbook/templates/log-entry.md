# Log Entry Template

Use this template when appending a new entry. Entries must follow
progressive disclosure: **TL;DR first**, then expand.

---

## For `references/pitfalls.md`

```markdown
## [YYYY-MM-DD] Short title

**TL;DR:** One sentence — the fix or takeaway. Scannable in 2 seconds.

**Context:** What task? What broke or surprised you?
**Applies to:** core / electron / dogfood — and which sites

### The problem

1-3 sentences max. What happened, what you expected.

### The fix

\```bash
# Minimal runnable commands — copy-paste and it works
agent-browser open <url>
agent-browser wait --load networkidle
agent-browser snapshot -i
\```

### Why (optional)

1-2 sentences on the underlying cause. Skip if obvious.
```

---

## For `references/patterns.md`

```markdown
## [YYYY-MM-DD] Short title

**TL;DR:** One sentence — the pattern takeaway. Scannable in 2 seconds.

**Context:** What task or scenario does this pattern solve?
**Applies to:** core / electron / dogfood — and which sites

### The pattern

\```bash
# Step-by-step runnable commands
agent-browser open <url>
agent-browser wait --load networkidle
agent-browser snapshot -i
\```

**Key insight:** Why this works better than the obvious approach.
```

---

## For `references/site-specifics.md`

```markdown
## <domain>

**TL;DR:** One sentence — the main quirk or workaround.

- **Quirk:** What's unusual about this site
- **Workaround:**

\```bash
agent-browser open https://<domain>
agent-browser wait --load networkidle
# site-specific commands here
\```

- **Discovered:** YYYY-MM-DD
```

---

## Filing rules

1. **One topic per entry** — No compound entries.
2. **Always include bash** — Every entry needs ≥1 runnable code block.
3. **Max 40 lines per entry** — Split if longer.
4. **TL;DR first** — Progressive disclosure: gist, then details.
5. **Date stamp in heading** — Format: `[YYYY-MM-DD]`.
6. **Tag applicability** — Always add `Applies to:` with skill area.

## Validate before committing

```bash
bash ~/.pi/agent/skills/agent-browser-logbook/templates/validate-logbook.sh
```