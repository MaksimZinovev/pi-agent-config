# Patterns

Reliable workflows and techniques discovered through real task experience.

---

## [2025-01-09] Snapshot-wait-act-resnapshot loop

**TL;DR:** After every action that changes the page, `wait --load networkidle` then re-snapshot. Cheap insurance against stale refs.

**Context:** Any browser automation task with dynamic pages.
**Applies to:** core — all web automation

### The pattern

```bash
# 1. Open and wait for full load
agent-browser open <url>
agent-browser wait --load networkidle

# 2. Snapshot to discover elements
agent-browser snapshot -i

# 3. Act on a ref
agent-browser click @e3

# 4. Wait for page to settle, re-snapshot
agent-browser wait --load networkidle
agent-browser snapshot -i

# 5. Repeat 3-4 for each action
```

**Key insight:** `wait --load networkidle` between action and re-snapshot prevents stale refs. Skip it on fast static pages, but it's cheap insurance.

---

## [2025-01-09] Quick data extraction with get commands

**TL;DR:** Use `snapshot -i` to discover refs, then `get text/attr/value/count` for efficient extraction — no need to parse full HTML.

**Context:** Scraping structured data (prices, names, links) from a page.
**Applies to:** core — data extraction, scraping

### The pattern

```bash
agent-browser open https://example.com/products
agent-browser wait --load networkidle
agent-browser snapshot -i      # discover refs

# Extract specific values
agent-browser get text @e1        # text content
agent-browser get attr @e1 href   # any attribute
agent-browser get value @e2       # input value
agent-browser get count ".product" # element count

# Or get JSON for programmatic parsing
agent-browser snapshot -i --json | \
  jq '.[] | select(.role == "link") | {name, href}'
```

---

## [2025-01-09] Named sessions for multi-step workflows

**TL;DR:** Use `--session <name>` to keep auth and cookies across commands. Save/restore state with `state save/load`.

**Context:** Tasks that span multiple pages or need persistent auth.
**Applies to:** core — authentication, multi-page workflows

### The pattern

```bash
# Start named session — auth persists across all commands
agent-browser --session my-work open https://example.com/login
agent-browser --session my-work snapshot -i
agent-browser --session my-work fill @e1 "user@example.com"
agent-browser --session my-work fill @e2 "password"
agent-browser --session my-work click @e3
agent-browser --session my-work wait --load networkidle

# Continue in same session — already authenticated
agent-browser --session my-work open https://example.com/dashboard
agent-browser --session my-work snapshot -i

# Save state for reuse later
agent-browser --session my-work state save ./auth-state.json
agent-browser --session my-work close

# Restore without re-authenticating
agent-browser --session my-work state load ./auth-state.json
```