import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Title should be visible
    await expect(page.locator('h1')).toHaveText('CAPITAIS');

    // Game cards should be visible
    await expect(page.locator('h3', { hasText: 'Desafio Mix' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Bandeiras' })).toBeVisible();
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    await expect(page.getByRole('paragraph').filter({ hasText: 'Desafios de Hoje' })).toBeVisible();
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    await expect(page.getByRole('paragraph').filter({ hasText: 'Desafios de Hoje' })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper page structure on the home page', async ({ page }) => {
    await page.goto('/');

    // Verify the page has a single h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Verify all buttons are clickable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verify page has proper language attribute
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('should have descriptive page title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('capitais');
  });

  test('should handle keyboard navigation on practice modes', async ({ page }) => {
    await page.goto('/practice');

    // Tab through the mode buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // The focused element should be a button
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBe('BUTTON');
  });
});
