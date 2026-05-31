# AGENTS_BROWSER.md

Additional tool-specific details. Only read when you need deeper guidance on browser automation and usage. See `AGENTS.md` for the baseline rules.

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands. By default, I assume it is already installed globally.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
