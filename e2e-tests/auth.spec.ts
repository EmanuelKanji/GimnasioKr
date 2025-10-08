import { test, expect } from '@playwright/test';

test.describe('Autenticación E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/');
  });

  test('debe mostrar la página de inicio correctamente', async ({ page }) => {
    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/Gimnasio/);
    
    // Verificar que hay botones de login
    await expect(page.locator('text=Admin')).toBeVisible();
    await expect(page.locator('text=Profesor')).toBeVisible();
    await expect(page.locator('text=Alumno')).toBeVisible();
  });

  test('debe navegar a login de admin', async ({ page }) => {
    // Hacer clic en el botón de Admin
    await page.click('text=Admin');
    
    // Verificar que navega a la página de login de admin
    await expect(page).toHaveURL(/.*login-admin/);
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe navegar a login de profesor', async ({ page }) => {
    // Hacer clic en el botón de Profesor
    await page.click('text=Profesor');
    
    // Verificar que navega a la página de login de profesor
    await expect(page).toHaveURL(/.*login-profesor/);
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe navegar a login de alumno', async ({ page }) => {
    // Hacer clic en el botón de Alumno
    await page.click('text=Alumno');
    
    // Verificar que navega a la página de login de alumno
    await expect(page).toHaveURL(/.*login-alumno/);
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Navegar a login de admin
    await page.click('text=Admin');
    await expect(page).toHaveURL(/.*login-admin/);
    
    // Intentar login con credenciales inválidas
    await page.fill('input[type="text"]', 'usuario_inexistente');
    await page.fill('input[type="password"]', 'password_incorrecto');
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra un error
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Navegar a login de admin
    await page.click('text=Admin');
    await expect(page).toHaveURL(/.*login-admin/);
    
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores de validación
    await expect(page.locator('text=requerido')).toBeVisible();
  });
});
