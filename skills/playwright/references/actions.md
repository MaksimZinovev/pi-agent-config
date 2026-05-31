# Playwright Actions and Interactions

Reference for user interactions in Playwright tests.

## Click Actions

```typescript
// Simple click
await page.getByRole('button', { name: 'Submit' }).click()

// Double click
await page.getByRole('button').dblclick()

// Right click (context menu)
await page.getByRole('button').click({ button: 'right' })

// With modifiers
await page.getByRole('button').click({ modifiers: ['Shift'] })
await page.getByRole('button').click({ modifiers: ['Control', 'Shift'] })

// Force click (bypass actionability)
await page.getByRole('button').click({ force: true })

// Click with position
await page.getByRole('button').click({ position: { x: 10, y: 10 } })

// Click count (triple click)
await page.getByRole('button').click({ clickCount: 3 })
```

## Type and Fill

```typescript
// Fill (clears existing value)
await page.getByLabel('Email').fill('test@example.com')

// Type (doesn't clear, simulates typing)
await page.getByLabel('Email').type('test@example.com')

// Slow typing (visible)
await page.getByLabel('Email').type('test@example.com', { delay: 100 })

// Clear first then type
await page.getByLabel('Email').clear()
await page.getByLabel('Email').fill('test@example.com')

// Press keys while typing
await page.getByLabel('Search').type('query', { delay: 50 })
```

## Keyboard Input

```typescript
// Single key
await page.getByRole('textbox').press('Enter')
await page.keyboard.press('Escape')
await page.keyboard.press('F11')

// Key combinations
await page.keyboard.press('Control+A')
await page.keyboard.press('Shift+Home')
await page.keyboard.press('Meta+C')  // Cmd on Mac, Ctrl on Windows

// Special keys
await page.keyboard.press('Backspace')
await page.keyboard.press('Delete')
await page.keyboard.press('ArrowDown')
await page.keyboard.press('Tab')
await page.keyboard.press('PageDown')
await page.keyboard.press('Space')

// Character input
await page.keyboard.type('Hello World')
await page.keyboard.insertText('text')
```

## Checkbox and Radio

```typescript
// Checkbox - check
await page.getByLabel('Subscribe').check()

// Checkbox - uncheck
await page.getByLabel('Subscribe').uncheck()

// Checkbox - set state
await page.getByLabel('Subscribe').setChecked(true)

// Radio button
await page.getByLabel('Option A').check()
```

## Dropdown Select

```typescript
// By value
await page.getByRole('combobox').selectOption('value1')

// By label
await page.getByRole('combobox').selectOption({ label: 'Option 1' })

// By index
await page.getByRole('combobox').selectOption({ index: 0 })

// Multiple values
await page.getByRole('combobox').selectOption(['value1', 'value2'])

// Get selected value
const value = await page.getByRole('combobox').inputValue()
```

## File Upload

```typescript
// Single file
await page.getByLabel('Upload').setInputFiles('path/to/file.pdf')

// Multiple files
await page.getByLabel('Upload').setInputFiles([
  'file1.pdf',
  'file2.pdf'
])

// File from buffer
await page.getByLabel('Upload').setInputFiles({
  name: 'file.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('content')
})

// Clear file input
await page.getByLabel('Upload').setInputFiles([])
```

## Hover

```typescript
// Hover over element
await page.getByRole('button').hover()

// Hover with position
await page.getByRole('button').hover({ position: { x: 5, y: 5 } })

// Hover then click dropdown item
await page.getByText('Menu').hover()
await page.getByRole('menuitem', { name: 'Item' }).click()
```

## Drag and Drop

```typescript
// Simple drag to another element
await page.locator('#source').dragTo(page.locator('#target'))

// With position
await page.locator('#source').dragTo(page.locator('#target'), {
  sourcePosition: { x: 10, y: 10 },
  targetPosition: { x: 20, y: 20 }
})

// Manual drag with mouse
await page.locator('#source').hover()
await page.mouse.down()
await page.locator('#target').hover()
await page.mouse.up()
```

## Scroll

```typescript
// Scroll element into view
await page.getByRole('button').scrollIntoViewIfNeeded()

// Scroll to position
await page.evaluate(() => window.scrollTo(0, 500))
await page.mouse.wheel(0, 100)  // delta x, y

// Scroll element
await page.locator('.container').scroll({ scrollTop: 100 })
await page.locator('.container').scroll({ scrollLeft: 50 })
```

## Form Filling

```typescript
// Fill multiple form fields
await page.getByLabel('Name').fill('John Doe')
await page.getByLabel('Email').fill('john@example.com')
await page.getByLabel('Phone').fill('555-1234')
await page.getByLabel('Message').fill('Hello')

// Using fill-form helper (if available)
// await page.fillForm({
//   'Name': 'John Doe',
//   'Email': 'john@example.com'
// })
```

## Date and Time Input

```typescript
// Date input
await page.getByLabel('Date').fill('2024-01-15')

// Time input
await page.getByLabel('Time').fill('14:30')

// Date-time
await page.getByLabel('DateTime').fill('2024-01-15T14:30')
```

## Content Editable

```typescript
// Fill contenteditable
await page.locator('[contenteditable]').fill('New content')

// Click and type
await page.locator('[contenteditable]').click()
await page.keyboard.type('New content')
```

## Focus and Blur

```typescript
// Focus element
await page.getByLabel('Email').focus()

// Blur element (lose focus)
await page.getByLabel('Email').blur()

// Check focused element
const isFocused = await page.getByLabel('Email').evaluate(el => el === document.activeElement)
```

## Actions API

```typescript
// Complex action sequences
await page.getByRole('button').click()
await page.getByRole('textbox').fill('text')
await page.keyboard.press('Enter')

// Using actions for pointer
await page.getByRole('button').tap()  // Touch tap
```

## Clipboard

```typescript
// Copy
await page.getByRole('button', { name: 'Copy' }).click()
// Or keyboard
await page.keyboard.press('Meta+C')

// Paste
await page.getByRole('textbox').focus()
await page.keyboard.press('Meta+V')

// Manipulate clipboard directly
await page.evaluate(() => {
  navigator.clipboard.writeText('copied text')
})
```

## Touch Actions

```typescript
// Tap
await page.getByRole('button').tap()

// Touch swipe
await page.locator('#swipe-area').tap()
await page.locator('#swipe-area').dragTo(page.locator('#target'))

// Pinch/zoom (device emulation)
const context = await browser.newContext({
  viewport: { width: 375, height: 667 }
})
```

## Navigation Actions

```typescript
// Navigate to URL
await page.goto('https://example.com')

// Go back
await page.goBack()

// Go forward
await page.goForward()

// Reload
await page.reload()
```

## Dialog and Alert Handling

```typescript
// Auto-dismiss (default)
page.on('dialog', dialog => dialog.accept())
await page.getByRole('button').click()

// Manual handling
page.on('dialog', dialog => {
  console.log(dialog.message())
  if (dialog.type() === 'confirm') {
    dialog.accept()
  } else {
    dialog.dismiss()
  }
})

// Fill prompt
page.on('dialog', dialog => {
  dialog.accept('input value')
})
```

## Waiting Strategies

```typescript
// Wait for URL
await page.waitForURL('**/dashboard')
await page.waitForURL(/\/dashboard/)

// Wait for selector
await page.waitForSelector('.loaded')
await page.waitForSelector('.loaded', { state: 'visible' })

// Wait for function
await page.waitForFunction(() => window.someVar === 'ready')

// Wait for request/response
await page.waitForRequest('**/api/data')
await page.waitForResponse('**/api/data')

// Wait for timeout (avoid if possible)
await page.waitForTimeout(1000)

// Wait for load state
await page.waitForLoadState('load')
await page.waitForLoadState('domcontentloaded')
await page.waitForLoadState('networkidle')
```
