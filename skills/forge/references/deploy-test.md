# Forge Deploy & Test Cycle

## Quick Deploy

```bash
# Deploy to development environment
forge deploy --environment development

# Tunnel for local development
forge tunnel
```

## Testing Deployed App

### Prerequisites
1. Deployed app must be installed on target Jira site
2. Browser session must be authenticated

### Browser Verification Pattern

**Primary: Chrome DevTools MCP** for page inspection (take_snapshot, take_screenshot).

**Secondary: Playwright CLI** for test writing and frame JS evaluation.

```bash
# 0. Clean up stale sessions
playwright-cli session-stop-all

# 1. Open headed browser (for login-required pages)
playwright-cli --headed open "https://<site>.atlassian.net/browse/<KEY>-<NUM>"

# 2. Use chrome-devtools MCP to take snapshot and verify app loaded
# 3. Use playwright-cli --headed run-code for iframe-specific JS evaluation
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| App not visible | Module not registered in manifest.yml | Check `jira:issuePanel` entry |
| Blank iframe | App not deployed to environment | Run `forge deploy --environment <env>` |
| Stale content | Browser cache | Hard refresh (Ctrl+Shift+R) or clear session |
| Cross-origin error in JS | Forge iframe isolation | Use `page.frame()` API instead of `contentDocument` |

## Environment Variables

```bash
# Set environment variables for deployment
forge settings set environment-development.FORGE_USER_VAR_JIRA_SITE_URL "https://automatify-com-au.atlassian.net"

# List current settings
forge settings list
```