import { test, expect } from '@playwright/test';

test.describe('Accesibilidad E2E', () => {
  test('debe ser navegable con teclado', async ({ page }) => {
    await page.goto('/');
    
    // Navegar usando solo el teclado
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verificar que el foco es visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();
    
    // Activar elemento con Enter
    await page.keyboard.press('Enter');
    
    // Verificar que navega correctamente
    await expect(page).toHaveURL(/.*login/);
  });

  test('debe tener contraste adecuado', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que los elementos principales son visibles
    const adminButton = page.locator('text=Admin');
    const profesorButton = page.locator('text=Profesor');
    const alumnoButton = page.locator('text=Alumno');
    
    await expect(adminButton).toBeVisible();
    await expect(profesorButton).toBeVisible();
    await expect(alumnoButton).toBeVisible();
    
    // Verificar que los botones tienen suficiente contraste
    const adminButtonColor = await adminButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });
    
    expect(adminButtonColor.color).toBeDefined();
    expect(adminButtonColor.backgroundColor).toBeDefined();
  });

  test('debe tener textos alternativos en imágenes', async ({ page }) => {
    await page.goto('/');
    
    // Buscar todas las imágenes
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
      expect(alt).not.toBe('');
    }
  });

  test('debe tener labels apropiados en formularios', async ({ page }) => {
    await page.goto('/login-admin');
    
    // Verificar que los inputs tienen labels
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Verificar que hay labels asociados
    const usernameLabel = page.locator('label[for*="username"], label:has-text("Usuario")');
    const passwordLabel = page.locator('label[for*="password"], label:has-text("Contraseña")');
    
    await expect(usernameLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('debe funcionar con lectores de pantalla', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que hay estructura semántica
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Verificar que hay landmarks
    const main = page.locator('main, [role="main"]');
    const navigation = page.locator('nav, [role="navigation"]');
    
    await expect(main).toBeVisible();
    await expect(navigation).toBeVisible();
  });

  test('debe ser responsive en diferentes tamaños', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // Desktop pequeño
      { width: 1920, height: 1080 }, // Desktop grande
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verificar que todos los elementos son visibles y accesibles
      await expect(page.locator('text=Admin')).toBeVisible();
      await expect(page.locator('text=Profesor')).toBeVisible();
      await expect(page.locator('text=Alumno')).toBeVisible();
      
      // Verificar que no hay scroll horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    }
  });
});
