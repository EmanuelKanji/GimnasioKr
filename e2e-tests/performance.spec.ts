import { test, expect } from '@playwright/test';

test.describe('Performance E2E', () => {
  test('debe cargar la página principal rápidamente', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    
    // Verificar que la página carga en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
    
    // Verificar que el contenido principal es visible
    await expect(page.locator('text=Gimnasio')).toBeVisible();
  });

  test('debe cargar dashboard de admin rápidamente', async ({ page }) => {
    // Login rápido
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page.locator('text=Dashboard Admin')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Verificar que el dashboard carga en menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('debe manejar múltiples pestañas simultáneamente', async ({ browser }) => {
    // Crear múltiples contextos
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();
    
    // Navegar a diferentes páginas simultáneamente
    await Promise.all([
      page1.goto('/login-admin'),
      page2.goto('/login-profesor'),
      page3.goto('/login-alumno')
    ]);
    
    // Verificar que todas las páginas cargan correctamente
    await expect(page1.locator('text=Admin')).toBeVisible();
    await expect(page2.locator('text=Profesor')).toBeVisible();
    await expect(page3.locator('text=Alumno')).toBeVisible();
    
    // Limpiar
    await context1.close();
    await context2.close();
    await context3.close();
  });

  test('debe funcionar correctamente en modo offline', async ({ page, context }) => {
    // Simular modo offline
    await context.setOffline(true);
    
    // Intentar navegar a la página
    await page.goto('/');
    
    // Verificar que se muestra mensaje de offline
    await expect(page.locator('text=Sin conexión')).toBeVisible();
    
    // Restaurar conexión
    await context.setOffline(false);
    
    // Recargar página
    await page.reload();
    
    // Verificar que la página carga normalmente
    await expect(page.locator('text=Gimnasio')).toBeVisible();
  });

  test('debe manejar scroll infinito en listas', async ({ page }) => {
    // Login como admin
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Navegar a lista de alumnos
    await page.click('text=Lista Alumnos');
    
    // Simular scroll infinito
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Verificar que la página no se rompe
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar que no hay errores de JavaScript
    const errors = await page.evaluate(() => {
      return window.console.error;
    });
    expect(errors).toBeUndefined();
  });
});
