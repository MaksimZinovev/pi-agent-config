# Atomic Testing with Playwright

## Overview

**Atomic test creation beats comprehensive complexity.** Build incrementally: 1-2 actions/assertions per test, verify each works, never assume page structure without exploration.

## When to Use

**Use when:**

- Creating new test (use in most cases)
- Tests fail with "strict mode violation" errors
- Registration forms have unexpected labels/structure
- Navigation elements need complex workarounds
- Tests timeout waiting for assumed elements
- Multiple test steps make debugging impossible
- Tests use `page.goto()` repeatedly to reset state

**Don't use when:**

- Simple static pages with known structure
- Tests already passing reliably
- No MCP server/cli-tool available

## Core Pattern

**Before (Agent Under Pressure):**

```typescript
// ❌ Complex test with assumptions
test("should validate home page navigation and functionality", async ({
  page,
}) => {
  await page.goto("https://scoolendar.com/");
  // 20+ lines of complex interactions
  await expect(page.getByLabel("First name")).toBeVisible(); // FAILS - wrong assumption
});
```

**After (Atomic Approach):**

```typescript
// ✅ Single action, single assertion
test("should navigate to home page tc-001", async ({ page }) => {
  await test.step("Navigate and verify URL", async () => {
    await page.goto("https://scoolendar.com/");
    await expect(page).toHaveURL(/scoolendar\.com/);
  });
});
```

## Quick Reference

| Situation             | Atomic Approach                                         | Common Pitfall           |
| --------------------- | ------------------------------------------------------- | ------------------------ |
| **Page exploration**  | Use Playwright MCP/cli tool to discover structure first | Assume elements exist    |
| **Form testing**      | Test one field per test                                 | Test entire form at once |
| **Navigation**        | One click per test, verify URL                          | Complex multi-step flows |
| **Strict violations** | Use filtering locators approach                         | Use ambiguous selectors  |
| **Timeout issues**    | Add specific waits for dynamic content                  | Use arbitrary timeouts   |
| **Test scaffolding**  | Use atomic-test-generator script                        | Manual template creation |

## Implementation Workflow

### Atomic Loop: explore → write → run → report → pause

The AI assistant follows this iterative loop when generating Playwright tests:

1. **Explore** - Use playwright-cli/MCP to discover actual page structure
2. **Write** - Create single action test with test.step() structure
3. **Run** - Execute test immediately
4. **Report** - Share results with user
5. **Pause** - Wait for permission before proceeding

### Step 1: Explore Before Testing

Use playwright-cli to understand page structure before writing any tests:

```bash
# Navigate and get accessibility snapshot
pw nav https://example.com
pw snap

# Explore elements
pw click "Menu" e123
pw snap
```

Document actual elements found - don't assume.

### Step 2: Create Minimal Viable Test

Start with absolute minimum - navigate and verify basic functionality. Run test after each change.

**Quick Start:** Use the atomic-test-generator tool:

```bash
./atomic-test-generator --feature <feature-name> --action "<action-description>"
```

This creates atomic test templates with proper test.step() organization and tc-XXX IDs.

### Step 3: Build Incrementally

Add ONE action/assertion at a time. Stop after 2 failures or 1 minute of troubleshooting.

### Step 4: Handle Strict Mode Violations

Use filtering locators approach - combine parent element filtering with text-based selection:

```typescript
// ❌ Ambiguous selector
page.getByRole("button", { name: "Submit" }); // Multiple matches

// ✅ Filter by parent
page.locator(".login-form").getByRole("button", { name: "Submit" });
```

### Step 5: Use Web-First Assertions

Prioritize `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors. Use auto-retrying assertions, not hard-coded waits.

```typescript
// ❌ Arbitrary wait
await page.waitForTimeout(5000);

// ✅ Wait for specific condition
await page.waitForURL("**/dashboard");
await expect(page.getByText("Loaded")).toBeVisible();
```

## Using the Atomic Test Generator

The `atomic-test-generator` script scaffolds proper test structure:

```bash
# Generate single test
./atomic-test-generator --feature login --action "user authentication"

# Generate multiple tests
./atomic-test-generator -f navigation -a "menu navigation" -c 3

# Generate tests in specific directory
./atomic-test-generator --feature search --action "product search" --count 2 --output ./tests/search
```

**Generated structure includes:**

- Proper test.step() organization
- Setup/Action/Verification phases
- Auto-generated tc-XXX test IDs
- Clear TODO comments for implementation

## Common Mistakes

| Mistake                   | Why it happens                  | Fix                                            |
| ------------------------- | ------------------------------- | ---------------------------------------------- |
| **Assuming form labels**  | "First name" seems standard     | Use Playwright MCP/cli to verify actual labels |
| **Complex workarounds**   | Navigation toggle doesn't work  | Test simple interactions first                 |
| **Not using filtering()** | Causes strict mode violation    | Use filtering locators approach                |
| **Repeated page.goto()**  | Easy state reset                | Use test isolation instead                     |
| **Long test steps**       | "Comprehensive" mindset         | One specific action per step                   |
| **Manual templates**      | Creating boilerplate repeatedly | Use atomic-test-generator script               |

## Red Flags - STOP and Start Over

- Writing "comprehensive test" with multiple scenarios
- Using `page.goto()` to reset state between test steps
- Creating complex fallback logic for element selection
- Assuming form labels without Playwright MCP/cli exploration
- Writing tests with more than 2 actions/assertions per step

**All of these mean: Delete the test. Start over with atomic approach.**

## Rationalization Counter

| Excuse                                    | Reality                                                                  | Atomic Approach                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| "I need comprehensive test coverage"      | Complex tests hide failures and are impossible to debug                  | Build coverage incrementally: one working test at a time               |
| "First name is standard label"            | Pages have custom implementations - verify with Playwright MCP/cli first | Use Playwright MCP/cli to explore actual form structure before testing |
| "Tests pass locally, fail in CI"          | Different load times and race conditions                                 | Handle dynamic content explicitly with proper waits                    |
| "Strict mode violation is just a warning" | It's a test failure - multiple elements match your selector              | Use filtering locators approach to create unique selectors             |
| "Creating templates manually is faster"   | Manual creation leads to inconsistent structure and missed steps         | Use atomic-test-generator for consistent, proper structure             |

## Real-World Impact

**Before skill:** 2 failed tests, strict mode violations, timeouts

- 245 lines of complex test code
- Multiple assumptions about page structure
- Tests failing after 9.6s and 3.1s

**After skill:** Individual passing tests, reliable assertions

- 15-20 lines per focused test
- Verified element structure
- Atomic debugging, faster feedback
