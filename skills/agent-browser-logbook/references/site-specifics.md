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