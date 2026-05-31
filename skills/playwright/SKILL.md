---
name: playwright
description: "Comprehensive Playwright testing skill for test authoring, debugging, browser automation, and test improvement. Use when you need to explore web app or investigat issue, authoring new Playwright tests or test suites, debugging failing or flaky tests, using Playwright for browser automation (screenshots, navigation, form filling, accessibility testing), improving or refactoring existing Playwright tests, setting up test infrastructure and fixtures, or working with playwright-cli MCP tool for live browser interaction. Covers vanilla Playwright patterns with @playwright/test, including locators, assertions, test structure, and debugging techniques. Emphasizes atomic test creation with one-action-per-test principle using test.step() structure. Use when you need browser web debugging, exploration, accessibility snapshots, test recording"
---

# Playwright Testing

Skill includes documented instructions, custom cli tools and and utility scipts: `$HOME.claude/skills/playwright`

ALWAYS assume that Playwright-cli (https://github.com/microsoft/playwright-cli) and pw tools are already available and configured. By default you MUST use Playwright CLI (to confirm: run `playwright-cli --version`). Switch to mcporter call syntax only when you let user know why Playwright-cli cannot be used and got approval.  Quick check `playwright-cli -help`  `pw --help |  head -n 15` or `mcporter call "playwright.browser_navigate(url: \"https://example.com\")" `

This document is optimized for progressive disclosure. You should be able to find key commands and examples below. Read, explore referenced documents, tools only when you need them. If you faced immediate blocker and was not able to resolve after 1st attempt, then stop and let user know.
Example:

- User: Generate new test for sckoolendar.com home page. Use 'playwright' skill
  Bad:
- Assistant: "I need to understand and explore 'playwright' skill". Reads fully skill.md, checks each script in scripts folder, explores referenced folders, files, runs `playwright-cli help` before executing any commands
  Good:
- Assistant: Reads skill.md or its first 100 lines (better). Assistant finds quick start and relevand sections, finds relevant command and uses it `playwright-cli open https://scoolendar.com`. Proceeds with the task, using and loading referenced resources only when needed. For quick tests uses commands with less tokens `playwright-cli -help | head -n 15` instead of `pw --help`, unless full output needed.

## Lessons Learned from previous sessions

 1. Never skip manual exploration - go through pages and actions end-to-end first
  - Playwright tests in --headed mode provide better debugging than playwright-cli
  - Use test execution for exploration instead of manual browsing tools

  2. Avoid strict mode violations from the start
  - getByText(/regex/) often matches multiple elements → use .first() or more specific selectors
  - Use .locator(".class").toContainText() instead of broad text regex when multiple matches exist

  3. Use timestamps for unique test data
  - new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 15) prevents collisions
  - Essential for create/update operations that persist data between runs

  4. Reuse existing patterns before innovating
  - Copy imports, helpers, and structure from working tests in the same directory
  - The project uses .ts extension in imports despite TypeScript warnings (it's a project convention)

  5. Verify in both modes before declaring done
  - Run in --headed for debugging selectors
  - Run headless to confirm reliability (CI runs headless)
  - Fix TypeScript issues only in your files - ignore pre-existing errors


## Task Selection Guide

Choose your task to find relevant patterns and references:

| Task                    | Reference                                         | Key Patterns                                |
| ----------------------- | ------------------------------------------------- | ------------------------------------------- |
| Atomic testing      | [atomic-testing.md](references/atomic-testing.md) | One-action-per-test, test.step() workflow   |
| Authoring new tests | [structure.md](references/structure.md)           | Test blocks, fixtures, beforeEach/afterEach |
| Selecting elements  | [locators.md](references/locators.md)             | getByRole, getByLabel, getByTestId          |
| User interactions   | [actions.md](references/actions.md)               | Click, type, hover, drag, form filling      |
| Debugging tests     | [debugging.md](references/debugging.md)           | Trace viewer, screenshots, console logs     |
| Browser automation  | [playwright-cli.md](references/playwright-cli.md) | playwright CLI tool, recording, snapshots           |

## Playwright-CLI - Quick Start

playwright-cli (https://github.com/microsoft/playwright-cli) is your default tool - has everything you need for browser interaction, debugging, exploration, accessibility snapshots, test recording. When you cannot use `playwright-cli` it is mandatory to pause and let user know, wait for feedback.

Backup: 
pw  - browser automation CLI tool generated via [mcporter](https://github.com/steipete/mcporter) from the Playwright MCP server.
Use the `pw` CLI for live browser interaction, debugging, exploration, accessibility snapshots, test recording etc.
For detailed guide, refer to `$HOME/.claude/skills/playwright/references/playwright-cli.md)` or try `mcporter playwright`, `mcporter list`

- Central location: `~/repos/playwright-cli/scripts/pw`

---

## Playwright-CLI Workflow

Startup Checklist 

- [ ] Always run first to stop all existing sesion when you start working on new task:
```
session-list                list all sessions
session-stop-all            stop all sessions
session-stop [name]         stop session        # when needed
```
- [x] Always run in headed mode `playwright-cli `  , unless instructed by user 



Mix and match "Observation", "Thought", "Action" based on current context and task.

```shell
# Example: User asked assistant to create new Playwright test "Update event"
# Thought: I should use optimal strategy to explore and understand web pages and navigation path. 
# For example, 1) search if there are existing web page snapshots available in `.playwright-cli` folder
# 2) launch browser in headed mode and explore web pages 3) Read existing tests
ck --hybrid "event" /.playwright-cli         # Action:  Run hybrid search in `.playwright-cli` directory using ck tool - combines regex + semantic
# Observation: I can see the snapshots and structure of the events-related pages  
```

## Playwright-CLI calling pattern `mcporter call ...`

```shell
# 1) Open the page you’re about to write a test for
# use npx mcporter or cll directly
# Set $BASE_URL in your shell forst
mcporter call "playwright.browser_navigate(url: \"scoolendar\.com\")"

# 2) Capture a DOM snapshot you can turn into stable locators/assertions
mcporter call "playwright.browser_snapshot(filename: \"out/snapshots/login.md\")"

# 3) Click button (example: by accessible name)
mcporter call "playwright.browser_click(selector: \"role=button[name='Sign in']\")"

# 4) Close browser
mcporter call "playwright.browser_close()"

mcporter playwright --schema      # View all tools and commands schema
mcporter list                     # View other mcp servers, tools
mcporter help                     # Discover
```

### condition-based-waiting

When to use:

- Tests use arbitrary `waitForTimeout()` calls
- Race conditions causing flaky tests
- Tests fail due to timing issues

Examples:

```
"Test fails because dialog appears too slowly"
"Need to wait for API response before asserting"
"Element not immediately available after navigation"
```

---

## 1. Atomic Test Authoring

### Core Principle: One Action Per Test

Build tests incrementally: implement 1-2 actions/assertions/steps max, verify each works, never assume page structure without exploration.

Atomic Workflow Checklist (mandatory):

- [x] used todo tool to add each item below from `Atomic Workflow` to ensure that all instructions are followed
- [x] ran `playwright-cli session-stop-all` before starting new session to ensure all previous sessions are closed
- [x] used `ck` skill and tool to learn from available .yml page snapshots in `.playwright-cli`
- [x] explored web app by using live browser interactions (headed mode) 
- [x] planned test design and structure before implementation
- [x] wrote test using atomic test generator and existing patterns
- [x] ran lint and LSP checks after each change; prettier - before task completion is announced
- [x] ran test to verify it passes, reolved outstanding issues 
- [x] checked final test against `6 Design & Technical Patterns Checklist` before task completion is announced

###  6 Design & Technical Patterns Checklist (mandatory)

```typescript
const TEST_EMAIL = process.env[`TEST_EMAIL_${ENV}`] || "missing";   // 1) Environment-based configuration pattern - Use process.env[VARIABLE_${ENV}] suffix pattern to load env-specific values for sensitive data
const {PRIVATE_EVENT_ID, SUBJECT_NAME} = getCurrentEnvConfig();     // 2) Environment-based configuration pattern - Use getCurrentEnvConfig() pattern to load env-specific values for non-sensitive data
test.beforeEach(async ({page}) => {await performLogin(page);});     // 3) Helper functions and use of Playwright's hooks for common flows. Extract only reusable operations like performLogin() into async functions to reduce duplication 

  /*4) # Unique custom locator that prevents `locator strictness violation` when more than one element matches. 
    This locator is used when page has list of identical elements (e.g. events page has a list of cards; each card has the same button names and roles). 
    Locator `locator('a > button').first()` would not match correct button if order changes. 
    Locator getByRole("button", {name: "View"}) would throw strictness violation error. */
page.locator(`a[href*='/${PRIVATE_EVENT_ID}']`).getByRole("button", {name: "View"})            

await expect(page.locator("#preloader")).toBeHidden();              // 5) Spin-wait for loading indicator to disappear after page state changes (navigation, form submission, etc.)
page.getByRole("button", {name: "Submit"})                          // 6) Locator strategy that prioritizes user-facing attributes and explicit contracts. Bad: page.locator('input[id="submit-button"]')
```
### Generating atomic test template

```shell
./scripts/atomic-test-generator --feature login --action "user authentication"
```


### Quick Atomic Test Template

Use the atomic-test-generator script:

```bash
# Generate single test boilerplate using script
$HOME/.claude/skills/playwright/scripts/atomic-test-generator --feature login --action "user authentication"
# Output:
Generating 1 atomic test(s)...
Feature: login
Action: user authentication
Output Directory: ./

# Generate multiple tests
$HOME/.claude/skills/playwright/scripts/atomic-test-generator -f navigation -a "menu navigation" -c 3

# Generate tests in specific directory
$HOME/.claude/skills/playwright/scripts/atomic-test-generator --help
  -f, --feature <name>      Feature area name (required)
  -a, --action <description> Action description for test case (required)
  -c, --count <number>      Number of test cases to generate (default: 1)
  -o, --output <dir>        Output directory (default: current directory)
  -h, --help               Show this help message

```

Generated structure:

```typescript
import { test, expect } from "@playwright/test";

test.describe("login", () => {
  test("should user authentication tc-001", async ({ page }) => {
    await test.step("Setup: Navigate to page", async () => {
      await page.goto("https://example.com");
    });

    await test.step("Action: Perform user interaction", async () => {
      // TODO: Add specific interaction
    });

    await test.step("Verification: Check expected result", async () => {
      // TODO: Add specific assertion
    });
  });
});
```

### Test Step Organization

Use `test.step()` for clarity:

```typescript
test("checkout flow", async ({ page }) => {
  await test.step("Add to cart", async () => {
    await page.getByRole("button", { name: "Add to Cart" }).click();
  });
  await test.step("View cart", async () => {
    await page.getByRole("link", { name: "Cart" }).click();
  });
  await test.step("Checkout", async () => {
    await page.getByRole("button", { name: "Checkout" }).click();
  });
});
```

### Red Flags - Stop and Start Over

- Writing "comprehensive test" with multiple scenarios
- Using `page.goto()` to reset state between test steps
- Creating complex fallback logic for element selection
- Assuming form labels without MCP exploration
- Writing tests with more than 2 actions/assertions per step

All of these mean: Delete the test. Start over with atomic approach.

See [atomic-testing.md](references/atomic-testing.md) for complete atomic testing workflow.

---

## 2. Browser Automation with playwright-cli

### Navigation & Interaction

# Navigate
# Take accessibility snapshot
# Take screenshot
# Click elemen
# Type text
# Evaluate JavaScript


### Test Recording Workflow

# 1. Start recording
# 2. Perform actions
# 3. Stop recording

See `playwright-cli -help` or [playwright-cli.md](references/playwright-cli.md) for complete CLI reference.

---

## 3. Test Debugging

### Debug Mode

```bash
# Step through tests
npx playwright test --debug

# Debug on failure
npx playwright test --debug-on-fail

# With trace
npx playwright test --trace on
```

### Common Debugging Techniques

1. Trace Viewer - See full execution trace
2. Screenshots - Capture state on failure
3. Console Logs - Listen to page console events
4. Network Monitoring - Track API requests/responses

### Flaky Test Fixes

- Replace `waitForTimeout()` with conditional waits
- Use `waitForFunction()`, `waitForURL()`, `waitForResponse()`
- Check element states before interaction
- Add retry logic for intermittent conditions

See [debugging.md](references/debugging.md) for complete debugging patterns.

---

## 4. Element Locator Priority

Use in this order:

1. `getByRole()` - Best practice, accessibility-first
2. `getByLabel()` - Form inputs with labels
3. `getByText()` - Text content
4. `getByTestId()` - Dedicated test attributes
5. `locator()` - CSS selectors (last resort)

See [locators.md](references/locators.md) for comprehensive locator patterns.

---

## 5. Project Conventions

When working with vanilla Playwright projects:

- Test files: `.spec.ts` extension in `tests/` directory
- Test IDs: Use `tc-XXX` format for traceability
- Browser: Chromium by default (configurable)
- Assertions: `expect()` from `@playwright/test`
- Structure: Use `test.step()` for organization

---



## Troubleshooting 

See `$HOME/.claude/skills/playwright/references/playwright-cli.md)`

---

## Resources

### references/locators.md

Comprehensive guide for selecting elements in Playwright - getByRole, getByLabel, getByTestId, CSS selectors, chaining locators, handling dynamic elements, shadow DOM, iframes.

### references/actions.md

All user interactions - click, type, hover, drag, keyboard input, form filling, dropdowns, file upload, dialogs, navigation, waiting strategies.

### references/debugging.md

Debugging techniques - trace viewer, screenshots, console logging, network monitoring, locator debugging, timeout issues, flaky test fixes.

### references/structure.md

Test structure patterns - test blocks, fixtures, beforeEach/afterEach, test steps, parametrized tests, annotations, parallel execution, page object model, API testing.

### references/playwright-cli.md

Using the `pw` CLI tool for browser automation and test recording - core commands, session management, test recording workflow, output modes, MCP tool reference.

### references/atomic-testing.md

Atomic test creation workflow - explore-write-run-report-pause cycle, one-action-per-test principle, test.step() organization, strict mode violation handling, filtering locators approach, common mistakes, red flags.

### scripts/atomic-test-generator

Executable Node.js script for generating atomic test templates with proper test.step() structure, Setup/Action/Verification phases, and tc-XXX test IDs.


### references/assertions.md

Assertion Best Practices
