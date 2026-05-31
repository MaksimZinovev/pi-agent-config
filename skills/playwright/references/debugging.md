# Playwright Debugging Patterns

Reference for debugging Playwright tests.

## Running Tests in Debug Mode

```bash
# Run with headed browser
npx playwright test --headed

# Run specific test file
npx playwright test tests/login.spec.ts --headed

# Run with debug mode (step through)
npx playwright test --debug

# Run with inspector on failure
npx playwright test --debug-on-fail

# Run with trace enabled
npx playwright test --trace on

# Slow motion (helpful for watching)
npx playwright test --headed --slow-mo=1000
```

## Trace Viewer

```bash
# Run tests with trace
npx playwright test --trace on

# View trace after run
npx playwright show-trace trace.zip
```

```typescript
// In code - enable trace for test
test.use({ trace: 'on-first-retry' })
test('example', async ({ page }) => {
  // ...
})

// Always on
test.use({ trace: 'on' })
```

## Screenshots

```typescript
// On failure (auto in config)
test('example', async ({ page }) => {
  await page.screenshot({ path: 'screenshot.png' })
})

// Full page screenshot
await page.screenshot({ path: 'full.png', fullPage: true })

// Element screenshot
await page.getByRole('button').screenshot({ path: 'button.png' })

// On failure in beforeEach/afterEach
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ path: `failure-${testInfo.title}.png` })
  }
})
```

## Console Logging

```typescript
// Listen to console events
page.on('console', msg => {
  console.log(`Console [${msg.type()}]: ${msg.text()}`)
})

// Get all console messages
const messages = []
page.on('console', msg => messages.push(msg))

// Filter by type
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Page error:', msg.text())
  }
})
```

## Network Debugging

```typescript
// Log all requests
page.on('request', request => {
  console.log('Request:', request.url())
})

// Log all responses
page.on('response', response => {
  console.log('Response:', response.url(), response.status())
})

// Wait for specific request
const [request] = await Promise.all([
  page.waitForRequest('**/api/data'),
  page.getByRole('button', { name: 'Load' }).click()
])

// Wait for response
const [response] = await Promise.all([
  page.waitForResponse('**/api/data'),
  page.getByRole('button', { name: 'Load' }).click()
])

// Check response status
await expect(response).toBeOK()
const data = await response.json()
```

## Playwright Inspector

```bash
# Start inspector
npx playwright test --debug

# In code - pause execution
await page.pause()

# Conditional pause
if (someCondition) {
  await page.pause()
}
```

## Locating Elements Issues

```typescript
// Check if element exists
const exists = await page.getByRole('button', { name: 'Submit' }).count() > 0

// Wait for element with timeout
await page.getByRole('button').waitFor({ timeout: 5000 })

// Debug locator - see what it matches
const button = page.getByRole('button')
console.log('Count:', await button.count())
console.log('All text:', await button.allTextContents())

// Use locator.highlight() to see elements
await page.getByRole('button').highlight()

// Get all matching elements
const elements = await page.getByRole('listitem').all()
for (const el of elements) {
  console.log(await el.textContent())
}
```

## Timeout Issues

```typescript
// Test-specific timeout
test.setTimeout(60000)  // 60 seconds

// Action-specific timeout
await page.click('button', { timeout: 10000 })

// Wait with timeout
await page.waitForSelector('.result', { timeout: 5000 })

// Expect with timeout
await expect(page.getByText('Done')).toBeVisible({ timeout: 10000 })

// Default timeout in config
// use: { testTimeout: 60000, actionTimeout: 10000 }
```

## Flaky Tests - Waits and Race Conditions

```typescript
// Avoid arbitrary waits
await page.waitForTimeout(1000)  // BAD

// Use waitFor for conditions
await page.waitForURL('**/dashboard')
await page.waitForSelector('.success')
await page.waitForResponse('**/api/complete')

// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.getByRole('button', { name: 'Submit' }).click()
])

// Wait for load state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for element state
await page.getByRole('button').waitFor({ state: 'attached' })
await page.getByRole('button').waitFor({ state: 'visible' })
await page.getByRole('button').waitFor({ state: 'hidden' })

// Retry logic
await expect(async () => {
  const response = await page.request.get('/api/data')
  expect(response.status()).toBe(200)
}).toPass({ timeouts: { interval: 1000 } })
```

## Assertion Debugging

```typescript
// Soft assertions - continue on failure
test('soft assertions', async ({ page }) => {
  await test.step('check multiple things', async () => {
    await expect.soft(page.getByText('Title')).toBeVisible()
    await expect.soft(page.getByText('Subtitle')).toBeVisible()
    await expect.soft(page.getByText('Footer')).toBeVisible()
  })
  // All soft assertions checked at end
})

// Detailed assertion messages
await expect(page.getByRole('heading'), 'Expected heading to be visible').toBeVisible()

// Custom matcher messages
await expect(page.locator('.count')).toHaveText(/5/, {
  message: 'Expected count to be 5'
})

// Snapshot debugging
await expect(page).toHaveScreenshot('baseline.png')
// Update: npx playwright test --update-snapshots
```

## Common Failure Patterns

```typescript
// Element not clickable - intercepted
// Solution: Use force or scroll into view first
await page.getByRole('button').scrollIntoViewIfNeeded()
await page.getByRole('button').click({ force: true })

// Element detached from DOM
// Solution: Re-locate element before action
await page.reload()
await page.getByRole('button').click()  // Fresh locator

// Timeout in waitForFunction
// Solution: Add polling and timeout options
await page.waitForFunction(() => {
  return window.someGlobal === 'ready'
}, { polling: 100, timeout: 10000 })

// iframe issues
// Solution: Use frameLocator
page.frameLocator('#iframe').getByRole('button').click()
```

## Page Object Debugging

```typescript
// In page object
class LoginPage {
  constructor(private page: Page) {}

  get emailInput() {
    return this.page.getByLabel('Email')
  }

  async login(email: string, password: string) {
    // Debug: Log element state
    console.log('Email visible:', await this.emailInput.isVisible())
    console.log('Email count:', await this.emailInput.count())

    await this.emailInput.fill(email)
  }
}
```

## Verbose Logging

```typescript
// Enable debug logging
DEBUG=pw:* npx playwright test

// In code
page.on('load', () => console.log('Page loaded'))
page.on('domcontentloaded', () => console.log('DOM ready'))
page.on('requestfailed', request => {
  console.log('Request failed:', request.url(), request.failure())
})
```

## Test Isolation Issues

```typescript
// Disable test isolation if needed (not recommended)
test.use({ testIdAttribute: 'data-testid' })

// Use storage state for auth
test.use({ storageState: 'auth.json' })

// Clean state before test
test.beforeEach(async ({ page }) => {
  await page.goto('/settings')
  await page.context().clearCookies()
})
```

## Video Recording

```typescript
// In playwright.config
use: {
  video: 'retain-on-failure',
  // or: 'on' for all tests
}

// Access video path
test.afterEach(async ({ page }, testInfo) => {
  const video = page.video()
  if (video && testInfo.status !== 'passed') {
    console.log('Video:', video.path())
  }
})
```
