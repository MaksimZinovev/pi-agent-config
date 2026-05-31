# Playwright CLI Tool

Using the playwright-cli MCP tool for browser automation and test generation.

## Overview

The `pw` CLI tool is a wrapper around the Playwright MCP server, providing convenient commands for:
- Browser navigation and interaction
- Screenshots and accessibility snapshots
- Test recording and generation
- Session management

## Installation

The CLI is bundled from `@playwright/mcp` using mcporter:

```bash
npx -y mcporter generate-cli "npx -y @playwright/mcp@latest --headless --user-data-dir ~/.cache/claude-playwright" \
  --name playwright --runtime node --bundle dist/playwright-mcp-cli.cjs
```

## Core Commands

| Command                    | Description                 | Example                         |
| -------------------------- | --------------------------- | ------------------------------- |
| `nav <url>`                | Navigate to URL             | `pw nav https://example.com`    |
| `snap`                     | Take accessibility snapshot | `pw snap`                       |
| `shot [file]`              | Take screenshot             | `pw shot page.png`              |
| `click <desc> <ref>`       | Click element               | `pw click "Submit" e123`        |
| `type <desc> <ref> <text>` | Type text                   | `pw type "Name" e45 "John"`     |
| `eval <code>`              | Evaluate JavaScript         | `pw eval "document.title"`      |
| `code <snippet>`           | Run Playwright code         | `pw code "await page.goBack()"` |
| `close`                    | Close browser               | `pw close`                      |

## Session Management

| Command               | Description        | Example                                          |
| --------------------- | ------------------ | ------------------------------------------------ |
| `tabs [action] [idx]` | Manage tabs        | `pw tabs list`, `pw tabs new`, `pw tabs close 0` |
| `resize <w> <h>`      | Resize window      | `pw resize 1920 1080`                            |
| `back`                | Go back in history | `pw back`                                        |
| `press <key>`         | Press key          | `pw press Enter`                                 |
| `wait [time|text]`    | Wait               | `pw wait 2`, `pw wait "Loaded"`                  |
| `console [level]`     | Console messages   | `pw console error`                               |

## Test Generation Commands

| Command          | Description          | Example            |
| ---------------- | -------------------- | ------------------ |
| `record <tc-id>` | Start recording test | `pw record tc-001` |
| `stop`           | Stop recording       | `pw stop`          |
| `snippet`        | Show code snippet    | `pw snippet`       |
| `file <tc-id>`   | Generate test file   | `pw file tc-001`   |

## Recording Workflow

```bash
# 1. Start recording with a test case ID
pw record tc-001

# 2. Perform actions (these are recorded)
pw nav https://example.com
pw snap
pw click "Submit" e123
pw type "Email" e45 "test@example.com"

# 3. Stop recording
pw stop

# 4. Output as full test file
pw file tc-001

# OR output as snippet to copy-paste
pw snippet
```

## Output Modes

```bash
# JSON output for automation
pw nav https://example.com --json
pw nav -j https://example.com

# Markdown output
pw snap --markdown
pw snap -m

# Raw MCP response
pw eval "document.title" --raw
pw eval -r "document.title"
```

## Direct CLI Usage

```bash
# Show all available tools
node dist/playwright-mcp-cli.cjs --help

# Direct tool invocation
node dist/playwright-mcp-cli.cjs browser-navigate --url https://example.com
node dist/playwright-mcp-cli.cjs browser-click --element "Submit" --ref e123
```

## MCP Tool Reference

The CLI exposes these Playwright MCP tools:

### Navigation & State
- `browser-navigate` - Navigate to URL
- `browser-navigate-back` - Go back in history
- `browser-snapshot` - Accessibility snapshot
- `browser-take-screenshot` - Take screenshot

### Element Interaction
- `browser-click` - Click element (supports double-click, modifiers)
- `browser-type` - Type text (supports submit, slow typing)
- `browser-hover` - Hover over element
- `browser-select-option` - Select dropdown option
- `browser-drag` - Drag and drop

### Form & Input
- `browser-fill-form` - Fill multiple form fields
- `browser-file-upload` - Upload files
- `browser-press-key` - Press keyboard key

### Advanced
- `browser-evaluate` - Evaluate JavaScript on page/element
- `browser-run-code` - Run Playwright code snippet
- `browser-console-messages` - Get console messages
- `browser-network-requests` - Get network requests

### Session
- `browser-close` - Close page
- `browser-tabs` - Manage tabs (list/new/close/select)
- `browser-resize` - Resize window
- `browser-wait-for` - Wait for time or text
- `browser-handle-dialog` - Handle alert/dialog

## Atomic Testing Workflow with pw CLI

The `pw` CLI tool supports atomic test creation following the one-action-per-test principle:

1. **Explore** - Use `pw nav`, `pw snap` to discover actual page structure
2. **Write** - Generate atomic test with `atomic-test-generator` script
3. **Run** - Execute test with `npx playwright test`
4. **Report** - Share results with user
5. **Pause** - Wait for permission before proceeding

Example atomic workflow:
```bash
# 1. Explore page structure
pw nav https://example.com
pw snap

# 2. Generate atomic test template
./scripts/atomic-test-generator --feature navigation --action "main menu"

# 3. Implement and run single action
# Edit generated test, then:
npx playwright test tests/navigation-main-menu.spec.ts

# 4. Report results and wait for user permission to continue
```

See [atomic-testing.md](atomic-testing.md) for complete atomic testing workflow.

## Project Conventions

When generating tests using the CLI:

- **Test files**: `.spec.ts` extension in `tests/` directory
- **Test IDs**: Include `tc-XXX` identifiers
- **Browser**: Chromium-only (matches project config)
- **Structure**: Uses `test.step()` for organization with Setup/Action/Verification phases

## Generated Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Recorded test: tc-001', () => {
  test('should tc-001', async ({ page }) => {
    await page.goto('https://example.com');

    await test.step('Click Submit button', async () => {
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    await test.step('Type email', async () => {
      await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    });
  });
});
```

## Shell Alias Setup

Add to `~/.zshrc` or `~/.bashrc` for global access:

```bash
# Playwright CLI alias
alias pw='/path/to/scool-playwright/scripts/pw'
```

Then use from anywhere:

```bash
pw nav https://example.com
pw snap
```

## Troubleshooting

### CLI not found

```bash
# Regenerate the CLI
npx -y mcporter generate-cli "npx -y @playwright/mcp@latest" \
  --name playwright --runtime node --bundle dist/playwright-mcp-cli.cjs
```

### Browser not installed

```bash
node dist/playwright-mcp-cli.cjs browser-install
```

### Permission denied on script

```bash
chmod +x scripts/pw
```
