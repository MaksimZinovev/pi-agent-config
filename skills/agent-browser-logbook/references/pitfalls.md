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

---

## [2025-05-10] --state flag ignored when daemon is already running

**Context:** Trying to restore a saved auth session with `agent-browser --state ./auth.json`.
**Problem:** When the daemon is already running, `--state` is silently ignored with a warning: `⚠ --state ignored: daemon already running. Use 'agent-browser close' first to restart with new options.` The browser opens the URL with no auth state, landing on the login page.
**Solution:** Use `state load` instead of `--state` for a running daemon. `--state` only works at launch time.

```bash
# WRONG — daemon already running, flag is ignored
agent-browser --state ./auth.json open https://example.com
# Output: ⚠ --state ignored: daemon already running

# RIGHT — load state into running daemon, then navigate
agent-browser state load ./auth.json
agent-browser open https://example.com

# ALTERNATIVE — shut down daemon first, then use --state at launch
agent-browser close --all
agent-browser --state ./auth.json open https://example.com
```

**Better alternative:** Use `--session-name` which auto-saves/restore:

```bash
agent-browser --session-name jira open https://jira.example.com
# ... login ...
agent-browser close  # auto-saves session
# Later: auto-restores
agent-browser --session-name jira open https://jira.example.com  # already logged in
```

**Applies to:** core — authentication, session management

---

## [2025-05-10] Atlassian login multi-step redirect breaks simple wait

**Context:** Opening a Jira ticket URL when not authenticated.
**Problem:** Atlassian login goes through `id.atlassian.com/login` → `id.atlassian.com/join/user-access` → final redirect. Between each step, `agent-browser get url` still shows a login URL. Simple `wait --load` or `wait 5000` is not enough because the redirect chain can take 20-60 seconds depending on SSO.
**Solution:** Poll for URL change in a loop. Check if the URL no longer contains `login`, `signin`, or `authorize`. Only then snapshot the page.
**Applies to:** core — authentication, site-specific (atlassian.net)

```bash
# Wrong: assumes page is ready immediately after navigate
agent-browser open https://example.atlassian.net/browse/KAN-1
agent-browser snapshot -i  # may still be on login page

# Right: poll until past authentication
for i in $(seq 1 20); do
  URL=$(agent-browser get url)
  if ! echo "$URL" | grep -qi "login\|signin\|authorize\|join/user-access"; then
    break
  fi
  sleep 5
done
agent-browser wait --load networkidle
agent-browser snapshot -i
```

---

## [2025-05-10] SPA-heavy sites need double-wait after auth redirects

**Context:** After multi-step auth redirects on SPA sites (Jira, Confluence, etc.).
**Problem:** Even after the URL resolves past the login page, dynamic panels load after the page shell. A single `wait --load networkidle` gives incomplete snapshot refs — missing the TestOps issue panel, for example.
**Solution:** Double-wait: networkidle for page shell, then a short sleep for dynamic hydration:

```bash
agent-browser state load ./auth.json
agent-browser open https://example.atlassian.net/browse/KAN-1
agent-browser wait --load networkidle  # page shell
sleep 2                                # dynamic panels hydrate
agent-browser snapshot -i              # now refs are complete
```

**Applies to:** core — any heavy SPA (Jira, Confluence, Salesforce, etc.)
