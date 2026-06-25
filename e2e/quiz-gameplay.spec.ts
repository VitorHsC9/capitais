import { test, expect } from '@playwright/test';

test.describe('Quiz Gameplay', () => {
  test('should play a full classic quiz round', async ({ page }) => {
    // Navigate to practice → classic → América do Sul
    await page.goto('/practice');
    await page.getByText('CLÁSSICO').click();
    await page.getByText('América do Sul', { exact: true }).click();

    // Should be on the playing screen
    await expect(page.getByText('PTS')).toBeVisible();
    await expect(page.getByText('Sair')).toBeVisible();

    // A country name should be displayed as the question
    const questionEl = page.locator('h2').first();
    await expect(questionEl).toBeVisible();
    const questionText = await questionEl.textContent();
    expect(questionText?.trim().length).toBeGreaterThan(0);

    // Multiple choice buttons should be visible — they contain capital names
    // The option buttons are inside the main content, after the question area
    const optionButtons = page.getByRole('button', { name: /^[1-5]\s+/ });
    await expect(optionButtons.first()).toBeVisible();

    // Click the first option to answer
    await optionButtons.first().click();

    // After answering, either "PRÓXIMA PERGUNTA" appears (correct/classic) or game continues
    // In classic mode, we always get the next question button
    const nextButton = page.getByText('PRÓXIMA PERGUNTA');
    await expect(nextButton).toBeVisible({ timeout: 5000 });

    // Click next question
    await nextButton.click();

    // Score should still be visible (game continues)
    await expect(page.getByText('PTS')).toBeVisible();
  });

  test('should allow exiting quiz mid-game', async ({ page }) => {
    await page.goto('/practice');
    await page.getByText('CLÁSSICO').click();
    await page.getByText('Todos', { exact: true }).click();

    // Should be playing
    await expect(page.getByText('PTS')).toBeVisible();

    // Click Sair button
    await page.getByText('Sair').click();

    // Should return to practice modes
    await expect(page.getByText('Escolha o Modo')).toBeVisible();
  });

  test('should start a survival mode game', async ({ page }) => {
    await page.goto('/practice');
    await page.getByText('SOBREVIVÊNCIA').click();
    await page.getByText('Todos', { exact: true }).click();

    // Should be in playing mode
    await expect(page.getByText('PTS')).toBeVisible();
    await expect(page.getByText('Sair')).toBeVisible();
  });

  test('should navigate back from continent selection to practice modes', async ({ page }) => {
    await page.goto('/practice');
    await page.getByText('REVERSO').click();

    // Should see continents
    await expect(page.getByText('Selecione a Região')).toBeVisible();

    // Click back button — first button with a chevron-left icon
    await page.locator('main button').first().click();

    // Should be back at practice modes (wait for lazy loading)
    await expect(page.getByText('Escolha o Modo')).toBeVisible({ timeout: 10000 });
  });
});
