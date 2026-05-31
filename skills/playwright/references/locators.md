# Playwright Locator Patterns

Reference for selecting elements in Playwright tests.

## Priority Order for Locators

Use in this order of preference:
1. User-facing attributes (`getByRole`, `getByLabel`, `getByPlaceholder`)
2. Text content (`getByText`)
3. Test IDs (`getByTestId`)
4. CSS selectors (`locator`) - last resort



## Filtering Locators Approach

When dealing with strict mode violations, use the "filtering locators" approach that prioritizes user-facing attributes and explicit contracts:

Step-by-step approach:
1. Use 'naive' approach with getByRole(), getByLabel(), getByText() following best practices
2. Target nearest parent element with filtering
3. Combine results to get unique locator
4. Verify by running the test
5. As last resort, use .first(), .last(), or .nth() methods

Practical Example - SCOOLENDAR element:

```typescript
// Step 1: Use 'naive' approach prioritizing user-facing attributes
page.getByText("SCOOLENDAR")

// Step 2: Target nearest parent element
page.locator('section').filter({hasText: /smart and cool calendar/i})

// Step 3: Combine results for unique locator
page.locator('section').filter({hasText: /smart and cool calendar/i}).getByText("SCOOLENDAR")

// Step 4: Verify by running the test
await expect(page.locator('section')
  .filter({hasText: /smart and cool calendar/i})
  .getByText("SCOOLENDAR")).toBeVisible();

// Step 5: If filtering fails, read the guide and follow recommendations
```

Common strict mode violation fixes:
```typescript
// ❌ BAD: Ambiguous selector, resolves to 2 elements
await expect(page.locator('p:has-text("SCOOLENDAR")')).toBeVisible();

// ❌ BAD: Relies on DOM structure
await expect(page.locator('p.home_header_title:has-text("SCOOLENDAR")')).toBeVisible();

// ❌ BAD: .first() is not robust - order can change
await expect(page.locator('p:has-text("SCOOLENDAR")').first()).toBeVisible();

// ✅ GOOD: Filtering locators approach
await expect(page.locator('section')
  .filter({hasText: /smart and cool calendar/i})
  .getByText("SCOOLENDAR")).toBeVisible();
```

Official documentation:
- [Playwright Locators Guide](https://playwright.dev/docs/locators#locating-elements)
- [Playwright Locators Quick Guide](https://playwright.dev/docs/locators#quick-guide)




## getByRole - Best Practice

Primary method for accessibility and resilient tests.

```typescript
// Button by name
page.getByRole('button', { name: 'Submit' }).click()

// Link by name
page.getByRole('link', { name: 'Learn more' }).click()

// Form controls
page.getByRole('textbox', { name: 'Email' }).fill('test@example.com')
page.getByRole('checkbox', { name: 'Subscribe' }).check()
page.getByRole('combobox', { name: 'Country' }).selectOption('USA')

// With exact/false matching
page.getByRole('button', { name: /submit/i })  // case-insensitive regex
page.getByRole('button', { name: 'submit', exact: false })  // contains

// Multiple matching elements
page.getByRole('listitem').filter({ hasText: 'Item 2' })
page.getByRole('button', { name: 'Buy' }).nth(1)

// Combined filters
page.getByRole('button', { name: 'Add' })
  .filter({ has: page.getByText('Cart') })
```

## getByLabel - Form Labels

```typescript
// Input with associated label
page.getByLabel('Email address').fill('test@example.com')
page.getByLabel('Password', { exact: true }).type('secret123')

// Textarea
page.getByLabel('Comments').fill('My comment')
```

## getByPlaceholder

```typescript
page.getByPlaceholder('Enter your email').fill('test@example.com')
page.getByPlaceholder(/search/i).type('query')
```

## getByText

```typescript
// Exact match
page.getByText('Welcome').click()
page.getByText('Submit', { exact: true }).click()

// Contains/substring
page.getByText('Welcome', { exact: false })

// Regex
page.getByText(/welcome/i)
page.getByText(new RegExp('welcome', 'i'))

// Within element
page.locator('.alert').getByText('Success')
```

## getByTestId - Dedicated Test Attributes

```typescript
// With data-testid attribute
page.getByTestId('submit-button').click()
page.getByTestId('email-input').fill('test@example.com')

// With custom test id attribute (configured in playwright.config)
page.getByTestId('submit-btn')  // if data-test-id is configured
```

## getByTitle - Tooltip/Title

```typescript
page.getByTitle('Close dialog').click()
```

## CSS Selectors - Last Resort

```typescript
// By class
page.locator('.submit-button').click()
page.locator('.btn.primary').click()

// By ID
page.locator('#submit-btn').click()

// By attribute
page.locator('[data-action="submit"]').click()
page.locator('[name="email"]').fill('test@example.com')

// CSS combinators
page.locator('form > .submit-btn').click()
page.locator('.nav + .content').waitFor()
page.locator('.sidebar ~ footer').isVisible()

// Pseudo-classes
page.locator('li:first-child').click()
page.locator('tr:nth-child(2)').click()
page.locator('button:visible').click()
```

## XPath - Avoid If Possible

```typescript
page.locator('//button[contains(text(), "Submit")]').click()
page.locator('//input[@name="email"]').fill('test@example.com')
```

## Chaining Locators

```typescript
// Filter by text content
page.locator('.button').filter({ hasText: 'Submit' }).click()

// Filter by having another element
page.locator('nav').filter({ has: page.getByRole('link', { name: 'Login' }) })

// Get element inside another
page.locator('.form').getByRole('button', { name: 'Submit' })
page.getByTestId('modal').getByText('Confirm')

// First/last/nth
page.locator('.item').first.click()
page.locator('.item').last.click()
page.locator('.item').nth(2).click()

// And/Or operators
page.getByRole('button').and(page.getByText('Submit'))
page.getByRole('button').or(page.getByRole('link'))
```

## Dynamic/Hidden Elements

```typescript
// Wait for element to be attached
page.getByText('Loaded').waitFor()

// Wait for visible
page.locator('.hidden').waitFor({ state: 'visible' })

// Wait for hidden
page.locator('.loading').waitFor({ state: 'hidden' })

// Wait for attached (in DOM but not visible)
page.locator('#async-content').waitFor({ state: 'attached' })

// Wait for detached (removed from DOM)
page.locator('#to-be-removed').waitFor({ state: 'detached' })
```

## Shadow DOM

```typescript
// Shadow root access
const shadowRoot = page.locator('.custom-element').shadowRoot()
shadowRoot.getByRole('button').click()

// Chained
page.locator('.host').shadowRoot().getByText('Content')
```

## iFrames

```typescript
// Get frame by name/URL
const frame = page.frame('iframe-name')
frame.getByRole('button').click()

// Frame locator
page.frameLocator('#my-frame').getByRole('button').click()
page.frameLocator('iframe[src*="embed"]').getByText('Content')

// Nested frames
page.frameLocator('#outer').frameLocator('#inner').getByText('Deep')
```

## Lists and Tables

```typescript
// Get all rows
const rows = page.getByRole('row')
const count = await rows.count()

// Iterate
for (const row of await rows.all()) {
  console.log(await row.textContent())
}

// Find specific row
page.getByRole('row').filter({ hasText: 'Item 2' })

// Table cells
page.getByRole('cell', { name: 'Total' })
```

## Parent/Child Navigation

```typescript
// Get parent
page.getByText('Child').locator('..')
page.getByRole('button').locator('xpath=../..')

// Get from child to parent
const button = page.getByRole('button', { name: 'Submit' })
const form = button.locator('..')
```

## Input Value Assertions

```typescript
// Check input value
await expect(page.getByLabel('Email')).toHaveValue('test@example.com')

// Check placeholder
await expect(page.getByPlaceholder('Search')).toHaveAttribute('placeholder', 'Search...')

// Check checked state
await expect(page.getByLabel('Subscribe')).toBeChecked()

// Check disabled
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()
```

## Common Patterns

```typescript
// Navigation links
page.getByRole('link', { name: 'Home' }).click()

// Menu items
page.getByRole('menuitem', { name: 'Settings' }).click()

// Tabs
page.getByRole('tab', { name: 'Profile' }).click()

// Dialogs
page.getByRole('dialog').getByText('Confirm').click()

// Alerts
page.getByRole('alert').getByText('Success!')
```
