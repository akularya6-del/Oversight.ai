# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard (Authenticated) >> should load the dashboard components
- Location: tests/e2e/dashboard.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="username"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input[name="username"]')

```

```yaml
- button "Sign in with Google":
  - text: Sign in with Google
  - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard (Authenticated)', () => {
  4  |   // Use a global setup or beforeEach to authenticate
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // 1. Go to sign-in page
  7  |     await page.goto('/api/auth/signin');
  8  | 
  9  |     // 2. Click on the Credentials (Test Auth) provider sign in form
  10 |     // NextAuth automatically generates a form for the credentials provider
  11 |     const usernameInput = page.locator('input[name="username"]');
  12 |     const passwordInput = page.locator('input[name="password"]');
  13 |     const signInButton = page.locator('button:has-text("Sign in with Test Auth")');
  14 | 
  15 |     // If TEST_MODE is working, this form will be visible
> 16 |     await expect(usernameInput).toBeVisible({ timeout: 10000 });
     |                                 ^ Error: expect(locator).toBeVisible() failed
  17 |     
  18 |     // 3. Login
  19 |     await usernameInput.fill('testuser');
  20 |     await passwordInput.fill('testpass');
  21 |     await signInButton.click();
  22 | 
  23 |     // 4. Verify we are redirected to the homepage or dashboard
  24 |     await page.waitForURL('**/');
  25 |     await page.goto('/dashboard');
  26 |     
  27 |     // Check for dashboard skeleton or main UI
  28 |     await expect(page.getByText('QA Test User')).toBeVisible({ timeout: 15000 });
  29 |   });
  30 | 
  31 |   test('should load the dashboard components', async ({ page }) => {
  32 |     // Ensure we are actually on the dashboard
  33 |     await expect(page).toHaveURL(/.*dashboard/);
  34 | 
  35 |     // Debugging: Log what's on the page if we fail
  36 |     try {
  37 |       await expect(page.getByText('Follow up: Seed Round').first()).toBeVisible({ timeout: 5000 });
  38 |     } catch (e) {
  39 |       console.log("PAGE TEXT CONTENT ON FAILURE:", await page.locator('body').innerText());
  40 |       throw e;
  41 |     }
  42 |     
  43 |     await expect(page.getByRole('button', { name: /Approve/i }).first()).toBeVisible({ timeout: 5000 });
  44 |   });
  45 | });
  46 | 
```