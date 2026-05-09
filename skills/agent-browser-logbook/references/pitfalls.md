# Pitfalls

Things that break, bite, or surprise you when using agent-browser.

---

## [2025-01-09] Stale refs after page changes

**TL;DR:** Always re-snapshot after any click/navigation that changes the page — refs expire instantly.

**Context:** Clicking a button that navigates or triggers a dynamic re-render.
**Applies to:** core — all web automation

### The problem

Element refs (`@e1`, `@e2`) are assigned fresh on every `snapshot`. After a click that changes the page, all refs from the previous snapshot become stale. Using a stale ref silently fails or operates on the wrong element.

### The fix

```bash
# WRONG — stale refs after navigation
agent-browser click @e3       # navigates
agent-browser fill @e7 "text"  # @e7 is from OLD page → misfires

# RIGHT — re-snapshot after page change
agent-browser click @e3
agent-browser snapshot -i      # fresh refs
agent-browser fill @e7 "text"  # now correct
```

---

## [2025-01-09] SPA pages need explicit waits

**TL;DR:** `open <url>` returns before JS renders. Add `wait --load networkidle` before snapshot on dynamic pages.

**Context:** Navigating to SPAs, dashboards, or API-driven pages.
**Applies to:** core — SPA and dashboard automation

### The problem

`agent-browser open <url>` returns once initial HTML loads, but interactive elements may not exist yet. A snapshot right after `open` returns an empty or partial tree.

### The fix

```bash
agent-browser open https://app.example.com/dashboard
agent-browser wait --load networkidle
agent-browser snapshot -i

# Or wait for a specific element
agent-browser wait ".dashboard-loaded"
agent-browser snapshot -i
```

---

## [2025-01-09] fill vs type — clears vs appends

**TL;DR:** `fill` clears then types. `type` appends to existing content.

**Context:** Entering text into form fields.
**Applies to:** core — form automation

### The fix

```bash
# Clear field and set fresh value
agent-browser fill @e3 "user@example.com"

# Append to existing content
agent-browser type @e3 " additional terms"
```

---

## [2025-01-09] Electron apps need CDP flag at launch

**TL;DR:** Quit the app first, then relaunch with `--remote-debugging-port`. Can't attach CDP after launch.

**Context:** Automating desktop apps (VS Code, Slack, Discord, Figma).
**Applies to:** electron — desktop app automation

### The fix

```bash
pkill -f "Slack"
sleep 1
open -a "Slack" --args --remote-debugging-port=9222
sleep 2  # wait for app to start
agent-browser connect 9222
```