import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate from home to daily challenge and back', async ({ page }) => {
    await page.goto('/');

    // Click on "Bandeiras" daily challenge card
    await page.locator('button.game-card', { hasText: 'Bandeiras' }).click();

    // Should be on the daily challenge page — the header says "Desafio Diário" (DOM text)
    await expect(page.getByText('Desafio Diário')).toBeVisible();

    await page.locator('main button').first().click();

    // Wait for navigation back to home
    await expect(page.getByText('Bem-vindo')).toBeVisible();
  });

  test('should navigate from home to practice modes', async ({ page }) => {
    await page.goto('/');

    // Click on "Modos de Prática"
    await page.getByText('Modos de Prática').click();

    // Should see the practice mode selection screen
    await expect(page.getByText('Escolha o Modo')).toBeVisible();

    // All practice modes should be listed
    const modes = ['CLÁSSICO', 'REVERSO', 'BANDEIRAS', 'MORTE SÚBITA', 'ESCRITA', 'SOBREVIVÊNCIA', 'ANAGRAMA'];
    for (const mode of modes) {
      await expect(page.getByText(mode)).toBeVisible();
    }
  });

  test('should navigate through practice flow: mode → continent → playing', async ({ page }) => {
    await page.goto('/practice');

    // Select classic mode
    await page.getByText('CLÁSSICO').click();

    // Should see continent selection
    await expect(page.getByText('Selecione a Região')).toBeVisible();

    // All continents should be listed
    const continents = ['América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania', 'Todos'];
    for (const continent of continents) {
      await expect(page.getByText(continent, { exact: true })).toBeVisible();
    }

    // Select a continent
    await page.getByText('América do Sul', { exact: true }).click();

    // Should be on the playing screen with quiz elements
    await expect(page.getByText('PTS')).toBeVisible();
    await expect(page.getByText('Sair')).toBeVisible();
  });

  test('should navigate to Supreme Menu and see challenge options', async ({ page }) => {
    await page.goto('/');

    // Click on Supreme section
    await page.locator('button').filter({ hasText: /Supremos/ }).click();

    // Should navigate to supreme menu — wait for the lazy-loaded page
    await expect(page.locator('text=/Capitais|Países|Supremo/i').first()).toBeVisible();
  });

  test('should navigate to SRS section', async ({ page }) => {
    await page.goto('/');

    // Click on SRS banner
    await page.getByText('Revisão Espaçada').click();

    // Should navigate to SRS menu
    await expect(page.locator('text=/Repetição Espaçada|Flashcard|Estudar|Revisar/i').first()).toBeVisible();
  });

  test('should navigate to Online section', async ({ page }) => {
    await page.goto('/');

    // Click on Online banner
    await page.locator('button').filter({ hasText: /Online/ }).click();

    // Should navigate to online lobby
    await expect(page.locator('text=/Online|Sala|Criar|Entrar/i').first()).toBeVisible();
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/route-that-does-not-exist');

    // Should see the 404 page
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/território desconhecido/i)).toBeVisible();

    // Click "VOLTAR AO INÍCIO"
    await page.getByRole('button', { name: /VOLTAR AO INÍCIO/i }).click();

    // Should be back on home
    await expect(page.getByText('Bem-vindo')).toBeVisible();
  });
});
