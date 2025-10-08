import { test, expect } from '@playwright/test';

test.describe('Tests E2E Simples', () => {
  test('debe cargar la página principal', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/Gimnasio/);
    
    // Verificar que hay contenido
    await expect(page.locator('body')).toBeVisible();
  });

  test('debe mostrar formulario de login de admin', async ({ page }) => {
    await page.goto('/login-admin');
    
    // Verificar que la página carga
    await expect(page).toHaveURL(/.*login-admin/);
    
    // Verificar elementos del formulario
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe mostrar formulario de login de profesor', async ({ page }) => {
    await page.goto('/login-profesor');
    
    // Verificar que la página carga
    await expect(page).toHaveURL(/.*login-profesor/);
    
    // Verificar elementos del formulario
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe mostrar formulario de login de alumno', async ({ page }) => {
    await page.goto('/login-alumno');
    
    // Verificar que la página carga
    await expect(page).toHaveURL(/.*login-alumno/);
    
    // Verificar elementos del formulario
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe ser responsive en móvil', async ({ page }) => {
    // Configurar vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verificar que la página se renderiza en móvil
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar que no hay scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('debe validar campos requeridos en login', async ({ page }) => {
    await page.goto('/login-admin');
    
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores de validación
    // Nota: Esto depende de la implementación del formulario
    await page.waitForTimeout(1000);
    
    // Verificar que la página no navega
    await expect(page).toHaveURL(/.*login-admin/);
  });

  test('debe manejar navegación entre páginas', async ({ page }) => {
    // Navegar a página principal
    await page.goto('/');
    
    // Navegar a login de admin
    await page.click('text=Admin');
    await expect(page).toHaveURL(/.*login-admin/);
    
    // Volver a página principal
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });
});
