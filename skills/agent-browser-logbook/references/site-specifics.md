# Site-Specific Quirks

Per-site quirks, workarounds, and configurations. Add entries as you encounter them.

---

## example.com

**TL;DR:** Minimal page, only one link. Use other sites for interactive testing.

- **Quirk:** No interactive elements beyond "More information" link.
- **Workaround:**

```bash
# Use duckduckgo for interactive workflow testing instead
agent-browser open https://duckduckgo.com
agent-browser snapshot -i
```

- **Discovered:** 2025-01-09

---

## google.com

**TL;DR:** Aggressive bot detection — use `duckduckgo.com` instead, or add extra waits.

- **Quirk:** Shows CAPTCHAs on automation. Search combobox ref changes frequently.
- **Workaround:**

```bash
# Use duckduckgo when possible
agent-browser open https://duckduckgo.com

# If you must use Google, add waits between actions
agent-browser open https://www.google.com
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser fill @e13 "search terms"
agent-browser press Enter
agent-browser wait --load networkidle
```

- **Discovered:** 2025-01-09

---

## duckduckgo.com

**TL;DR:** Automation-friendly, consistently accessible search box. Use as default test site.

- **Quirk:** Generally cooperative. Search box always accessible via snapshot.
- **Workaround:**

```bash
agent-browser open https://duckduckgo.com
agent-browser snapshot -i
agent-browser fill @e1 "search query"
agent-browser press Enter
```

- **Discovered:** 2025-01-09

---

## automatify-dev.atlassian.net (Jira)

- **Quirk:** Atlassian login redirects through `id.atlassian.com` with multi-step OAuth/SSO flow. The URL changes multiple times (login → join/user-access → final redirect). Simple `wait --load` is not enough — need to poll for final URL or check page title.
- **Quirk:** Jira pages are heavily SPA-loaded. After `open`, need `wait --load networkidle` then `snapshot -i` for full content. Initial snapshot may show incomplete content.
- **Quirk:** Jira uses deeply nested shadow-DOM-like structures. `snapshot -i` works well but refs can be very numerous (200+ elements). Use `snapshot -s "selector"` to scope to specific panels.
- **Workaround for auth:** Save state after login with `agent-browser state save ./auth.json`. Reuse with `agent-browser --state ./auth.json open <url>`. Session cookies expire, so re-auth may be needed periodically.
- **Workaround for slow load:** Always use `wait --load networkidle` after `open` on Jira pages.
- **Discovered:** 2025-05-10
