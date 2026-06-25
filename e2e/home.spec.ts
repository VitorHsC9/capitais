import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page with title and main sections', async ({ page }) => {
    await page.goto('/');

    // Header should display the app title
    await expect(page.locator('h1')).toHaveText('CAPITAIS');

    // Main welcome section
    await expect(page.getByText('Bem-vindo')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Desafios de Hoje' })).toBeVisible();
  });

  test('should display all daily challenge game cards', async ({ page }) => {
    await page.goto('/');

    const expectedChallenges = [
      'Desafio Mix',
      'Bandeiras',
      'Capital',
      'Termo',
      'Mapa',
      'País',
      'População',
      'Desafio do País',
      'Termo do País',
    ];

    for (const challenge of expectedChallenges) {
      await expect(page.locator('h3', { hasText: challenge }).first()).toBeVisible();
    }
  });

  test('should display SRS, Online, Supreme and Practice sections', async ({ page }) => {
    await page.goto('/');

    // SRS banner
    await expect(page.getByText('Revisão Espaçada')).toBeVisible();

    // Online banner
    await expect(page.locator('h3').filter({ hasText: /Online/ })).toBeVisible();

    // Supreme section
    await expect(page.locator('h3').filter({ hasText: /Supremos/ })).toBeVisible();

    // Practice link
    await expect(page.getByText('Modos de Prática')).toBeVisible();
  });

  test('should open and close help modal', async ({ page }) => {
    await page.goto('/');

    // Click help button (first header button)
    const helpButton = page.locator('header button').first();
    await helpButton.click();

    // Help modal should be visible — the DOM text is "Como Jogar" with CSS uppercase
    await expect(page.getByText('Como Jogar')).toBeVisible();

    await page.locator('.modal-content button').first().click();

    // Modal should be gone
    await expect(page.getByText('Como Jogar')).not.toBeVisible();
  });

  test('should open and close stats modal', async ({ page }) => {
    await page.goto('/');

    // Click stats button (last header button)
    const statsButton = page.locator('header button').last();
    await statsButton.click();

    // Stats modal should show statistics content
    await expect(page.getByText('Estatísticas')).toBeVisible();

    await page.locator('.modal-content button').first().click();

    // Modal should be gone
    await expect(page.getByText('Estatísticas')).not.toBeVisible();
  });
});
