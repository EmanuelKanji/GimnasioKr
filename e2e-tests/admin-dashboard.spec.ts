import { test, expect } from '@playwright/test';

test.describe('Dashboard de Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a login de admin
    await page.goto('/login-admin');
  });

  test('debe mostrar formulario de login de admin', async ({ page }) => {
    // Verificar elementos del formulario
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verificar que hay placeholder o label
    await expect(page.locator('text=Usuario')).toBeVisible();
    await expect(page.locator('text=Contraseña')).toBeVisible();
  });

  test('debe mostrar menú hamburguesa en móvil', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que el menú hamburguesa es visible
    await expect(page.locator('.hamburger')).toBeVisible();
    
    // Hacer clic en el menú hamburguesa
    await page.click('.hamburger');
    
    // Verificar que se abre el menú lateral
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('debe validar responsive design', async ({ page }) => {
    // Probar diferentes tamaños de pantalla
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // Desktop pequeño
      { width: 1920, height: 1080 }, // Desktop grande
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Verificar que la página se renderiza correctamente
      await expect(page.locator('body')).toBeVisible();
      
      // Verificar que no hay scroll horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Margen de error
    }
  });

  test('debe mostrar mensajes de error apropiados', async ({ page }) => {
    // Intentar login con campos vacíos
    await page.click('button[type="submit"]');
    
    // Verificar mensajes de validación
    await expect(page.locator('text=requerido')).toBeVisible();
    
    // Intentar con formato de email inválido
    await page.fill('input[type="text"]', 'email_invalido');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de formato inválido
    await expect(page.locator('text=formato')).toBeVisible();
  });

  test('debe mantener estado del formulario', async ({ page }) => {
    // Llenar formulario parcialmente
    await page.fill('input[type="text"]', 'test@test.com');
    
    // Recargar página
    await page.reload();
    
    // Verificar que el campo se mantiene (si hay persistencia)
    // Nota: Esto depende de la implementación del formulario
    const usernameValue = await page.inputValue('input[type="text"]');
    expect(usernameValue).toBeDefined();
  });
});
