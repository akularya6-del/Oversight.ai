import { test, expect } from '@playwright/test';

test.describe('Dashboard (Authenticated)', () => {
  // Use a global setup or beforeEach to authenticate
  test.beforeEach(async ({ page }) => {
    // 1. Go to sign-in page
    await page.goto('/api/auth/signin');

    // 2. Click on the Credentials (Test Auth) provider sign in form
    // NextAuth automatically generates a form for the credentials provider
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    const signInButton = page.locator('button:has-text("Sign in with Test Auth")');

    // If TEST_MODE is working, this form will be visible
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    
    // 3. Login
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpass');
    await signInButton.click();

    // 4. Verify we are redirected to the homepage or dashboard
    await page.waitForURL('**/');
    await page.goto('/dashboard');
    
    // Check for dashboard skeleton or main UI
    await expect(page.getByText('QA Test User')).toBeVisible({ timeout: 15000 });
  });

  test('should load the dashboard components', async ({ page }) => {
    // Ensure we are actually on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Debugging: Log what's on the page if we fail
    try {
      await expect(page.getByText('Follow up: Seed Round').first()).toBeVisible({ timeout: 5000 });
    } catch (e) {
      console.log("PAGE TEXT CONTENT ON FAILURE:", await page.locator('body').innerText());
      throw e;
    }
    
    await expect(page.getByRole('button', { name: /Approve/i }).first()).toBeVisible({ timeout: 5000 });
  });
});
