## Assertion Best Practices

| Purpose | Best Assertion | Example |
|---------|----------------|---------|
| UI Structure | `toMatchAriaSnapshot()` | `await expect(page.locator('.header')).toMatchAriaSnapshot();` |
| Element Counts | `toHaveCount()` | `await expect(page.locator('.item')).toHaveCount(3);` |
| Text Content | `toHaveText()` for exact, `toContainText()` for partial | `await expect(page.locator('.title')).toHaveText('Welcome');` |
| Navigation | `toHaveURL()` | `await expect(page).toHaveURL(/dashboard/);` |
| Visibility | `toBeVisible()` (only for visibility changes) | `await expect(page.locator('.modal')).toBeVisible();` |
| Presence | `toBeAttached()` | `await expect(page.locator('.dynamic')).toBeAttached();` |
