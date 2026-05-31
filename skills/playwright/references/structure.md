# Playwright Test Structure Patterns

Reference for structuring Playwright tests.

## Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.getByRole('heading')).toHaveText('Welcome');
});
```

## Test Describe Blocks

```typescript
test.describe('Login functionality', () => {
  test('valid login', async ({ page }) => {
    // ...
  });

  test('invalid login', async ({ page }) => {
    // ...
  });
});
```

## Test Steps

```typescript
test('checkout flow', async ({ page }) => {
  await test.step('Add item to cart', async () => {
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  });

  await test.step('View cart', async () => {
    await page.getByRole('link', { name: 'Cart' }).click();
  });

  await test.step('Checkout', async () => {
    await page.getByRole('button', { name: 'Checkout' }).click();
  });
});
```

## BeforeEach/AfterEach

```typescript
test.describe('Form tests', () => {
  test.beforeEach(async ({ page }) => {
    // Run before each test
    await page.goto('/form');
  });

  test.afterEach(async ({ page, browserName }) => {
    // Run after each test
    console.log(`Finished test in ${browserName}`);
  });

  test('submit form', async ({ page }) => {
    // Test code here
  });
});
```

## BeforeAll/AfterAll

```typescript
test.describe('Database tests', () => {
  test.beforeAll(async () => {
    // Run once before all tests in describe
    await setupDatabase();
  });

  test.afterAll(async () => {
    // Run once after all tests in describe
    await cleanupDatabase();
  });

  test('query data', async () => {
    // ...
  });
});
```

## Test Fixtures

```typescript
// In fixtures.ts
import { test as base } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
  apiClient: APIClient;
};

export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await use(page);
  },

  apiClient: async ({}, use) => {
    const client = new APIClient();
    await use(client);
    await client.cleanup();
  },
});

// In test file
import { test, expect } from './fixtures';

test('authenticated action', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');
  // ...
});
```

## Configuration with test.use()

```typescript
test.use({ viewport: { width: 1280, height: 720 } });
test('desktop test', async ({ page }) => {
  // Runs with desktop viewport
});

test.use({ viewport: { width: 375, height: 667 } });
test('mobile test', async ({ page }) => {
  // Runs with mobile viewport
});

// Multiple options
test.use({
  viewport: { width: 1920, height: 1080 },
  locale: 'en-GB',
  timezoneId: 'Europe/London',
  contextOptions: {
    permissions: ['geolocation']
  }
});
```

## Parametrized Tests

```typescript
const testData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

for (const { name, age } of testData) {
  test(`validate user ${name}`, async ({ page }) => {
    await page.goto(`/users/${name}`);
    await expect(page.getByText(`Age: ${age}`)).toBeVisible();
  });
}
```

## Test Annotations

```typescript
// Skip test
test.skip('broken test', async ({ page }) => {
  // This test will be skipped
});

// Conditional skip
test.skip(browserName === 'firefox', 'Firefox not supported', async ({ page }) => {
  // Skipped in Firefox
});

// Only run this test
test.only('focus test', async ({ page }) => {
  // Only this test runs
});

// Fixme (skip with message)
test.fixme('needs fixing', async ({ page }) => {
  // Skipped, marked as needing fix
});

// Fail test (expect to fail - passes if it fails)
test.fail('known bug', async ({ page }) => {
  // Expected to fail
});

// Slow test (extends timeout)
test.slow('slow operation', async ({ page }) => {
  // Timeout tripled
});

// Custom annotations
test('example', async ({ page }) => {
  test.info().annotations.push({
    type: 'issue',
    description: 'https://github.com/issue/123'
  });
});
```

## Tags

```typescript
// In playwright.config.ts
// use: { tag: ['smoke', 'critical'] }

test('critical path', async ({ page }) => {
  test.info().tags.push('smoke');
  test.info().tags.push('critical');
  // ...
});

// Or via annotation
test('another test', async ({ page }) => {
  test.info().annotations.push({ type: 'tag', description: 'integration' });
});

// Run by tag
// npx playwright test --grep @smoke
```

## Expect Assertions

```typescript
// Element state
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByRole('button')).toBeHidden();
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();
await expect(page.getByRole('button')).toBeChecked();
await expect(page.getByRole('button')).toBeFocused();
await expect(page.getByRole('button')).toHaveAttribute('href', '/home');
await expect(page.getByRole('button')).toHaveClass(/active/);
await expect(page.getByRole('button')).toHaveCSS('color', 'rgb(255, 0, 0)');
await expect(page.getByRole('button')).toHaveID('submit-btn');
await expect(page.getByRole('button')).toHaveText('Submit');
await expect(page.getByRole('button')).toHaveValue('text');
await expect(page.getByRole('button')).toHaveCount(3);

// Page assertions
await expect(page).toHaveURL('**/dashboard');
await expect(page).toHaveTitle('Dashboard');

// Custom timeout
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 10000 });

// Soft assertions (continue on failure)
await expect.soft(page.getByText('Title')).toBeVisible();
await expect.soft(page.getByText('Subtitle')).toBeVisible();
```

## Retry Logic

```typescript
// In playwright.config.ts
// use: { retries: 2 }

// Or in test
test('flaky test', async ({ page }) => {
  test.retries(3);
  // ...
});
```

## Parallel and Serial Execution

```typescript
// Run tests in parallel (default)
test.describe('parallel tests', () => {
  test('test 1', async ({ page }) => {});
  test('test 2', async ({ page }) => {});
});

// Force serial execution
test.describe.configure({ mode: 'serial' });
test.describe('dependent tests', () => {
  test('test 1', async ({ page }) => {});
  test('test 2', async ({ page }) => {}); // Waits for test 1
});

// Worker isolation
test.describe('worker tests', () => {
  test('shares worker', async ({ page }) => {});
});
```

## Page Object Model Pattern

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async getErrorMessage() {
    return this.page.getByRole('alert').textContent();
  }
}

// In test
import { LoginPage } from './pages/LoginPage';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('**/dashboard');
});
```

## API Testing with Playwright

```typescript
test('API request', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.users).toHaveLength(10);
});

test('API POST request', async ({ request }) => {
  const response = await request.post('https://api.example.com/users', {
    data: {
      name: 'John',
      email: 'john@example.com'
    }
  });
  expect(response.status()).toBe(201);
});
```

## Visual Regression Testing

```typescript
test('visual comparison', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

// Element screenshot
test('component visual', async ({ page }) => {
  await page.goto('/components/button');
  await expect(page.getByRole('button')).toHaveScreenshot('button.png');
});
```

## Network Request Testing

```typescript
test('API call tracking', async ({ page }) => {
  // Listen for requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('API Request:', request.method(), request.url());
    }
  });

  // Wait for specific response
  const [response] = await Promise.all([
    page.waitForResponse('**/api/data'),
    page.getByRole('button', { name: 'Load' }).click()
  ]);

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('results');
});
```

## Storage State for Auth

```typescript
// Save storage state
test('save storage state', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.context().storageState({ path: 'auth.json' });
});

// Use storage state
test.use({ storageState: 'auth.json' });
test('authenticated test', async ({ page }) => {
  // Already logged in
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

## Emulate Devices

```typescript
// Emulate mobile device
test.use({ ...devices['iPhone 13'] });
test('mobile test', async ({ page }) => {
  // Runs on iPhone 13 viewport and user agent
});

// Emulate desktop
test.use({ viewport: { width: 1920, height: 1080 } });
test('desktop test', async ({ page }) => {
  // Desktop viewport
});

// Geolocation
test.use({ geolocation: { longitude: 12.4924, latitude: 41.8902 }, permissions: ['geolocation'] });
test('location test', async ({ page }) => {
  // Has geolocation permissions
});
```
