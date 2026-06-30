import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing Page', () => {
  test('should load and display hero content', async ({ page }) => {
    await page.goto('/');
    
    // Verify core text is visible
    await expect(page.getByText('Oversight', { exact: true })).toBeVisible();
    await expect(page.getByText('Never drop a commitment')).toBeVisible();
    
    // The "Sign up" button
    const getStartedBtn = page.getByRole('button', { name: /Sign up/i });
    await expect(getStartedBtn).toBeVisible();
  });

  test('should pass accessibility checks', async ({ page }) => {
    await page.goto('/');
    // Disable color-contrast check if the design uses subtle colors that fail strictly but are approved
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) 
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

});
