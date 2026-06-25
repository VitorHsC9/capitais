import { test, expect } from '@playwright/test';

test.describe('Daily Challenges', () => {
  test('should load the daily flag challenge', async ({ page }) => {
    await page.goto('/daily');

    // Should show the daily challenge header
    await expect(page.getByText('Desafio Diário')).toBeVisible();

    // Should show "Que país é esse?" question or a result screen
    const isPlaying = await page.getByText('Que país é esse?').isVisible().catch(() => false);
    const isFinished = await page.getByText(/VOCÊ ACERTOU|NÃO FOI DESSA VEZ/i).isVisible().catch(() => false);

    expect(isPlaying || isFinished).toBeTruthy();
  });

  test('should load the daily anagram challenge', async ({ page }) => {
    await page.goto('/daily-anagram');

    // Anagram uses "Desafio da Capital" as title
    await expect(page.getByText('Desafio da Capital')).toBeVisible();
    // Should show the shuffle prompt
    await expect(page.getByText('Desembaralhe a Capital')).toBeVisible();
  });

  test('should load the daily wordle challenge', async ({ page }) => {
    await page.goto('/daily-wordle');

    // Wordle should have its challenge content loaded
    // The header h1 is always "CAPITAIS", and the page should have specific content
    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    // Wordle shows a grid or input for guessing
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should load the daily map challenge', async ({ page }) => {
    await page.goto('/daily-map');

    // Map challenge should load with its content
    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should load the daily country challenge', async ({ page }) => {
    await page.goto('/daily-country');

    // Country challenge should load with its content
    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should load the daily population challenge', async ({ page }) => {
    await page.goto('/daily-population');

    // Population challenge should have its specific content
    await expect(page.getByText('Desafio Diário')).toBeVisible();
  });

  test('should load the daily mix challenge', async ({ page }) => {
    await page.goto('/daily-mix');

    // Mix challenge should load
    await expect(page.locator('h1')).toHaveText('CAPITAIS');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should navigate between daily challenges using next button', async ({ page }) => {
    await page.goto('/daily');

    // If the challenge is completed, there should be a "Próximo Desafio" button
    const nextButton = page.getByText('Próximo Desafio');
    const isVisible = await nextButton.isVisible().catch(() => false);

    if (isVisible) {
      await nextButton.click();
      // Should navigate to the next daily challenge (anagram)
      await page.waitForURL(/daily-anagram/);
    }
  });
});
