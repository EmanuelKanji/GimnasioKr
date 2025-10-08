import { test, expect } from '@playwright/test';

test.describe('Integración API E2E', () => {
  test('debe conectar correctamente con el backend', async ({ page }) => {
    // Interceptar llamadas a la API
    const apiCalls: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    // Navegar a login
    await page.goto('/login-admin');
    
    // Intentar login
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verificar que se hizo la llamada a la API
    await page.waitForTimeout(2000);
    
    const loginCall = apiCalls.find(call => 
      call.url.includes('/api/auth/login') && call.method === 'POST'
    );
    
    expect(loginCall).toBeDefined();
  });

  test('debe manejar errores de API correctamente', async ({ page }) => {
    // Interceptar respuestas de API
    await page.route('**/api/**', route => {
      // Simular error 500
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error interno del servidor' })
      });
    });
    
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra el error
    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('debe mostrar loading states durante llamadas API', async ({ page }) => {
    // Interceptar llamadas API para simular delay
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Hacer clic en submit
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra loading
    await expect(page.locator('text=Cargando')).toBeVisible();
  });

  test('debe sincronizar datos entre frontend y backend', async ({ page }) => {
    // Login como admin
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await page.waitForURL('**/dashboard-admin**', { timeout: 10000 });
    await expect(page.locator('text=Dashboard Admin')).toBeVisible();
    
    // Verificar que hay botones de navegación
    await expect(page.locator('text=Crear Usuario')).toBeVisible({ timeout: 10000 });
    
    // Navegar a crear usuario
    await page.click('text=Crear Usuario');
    
    // Llenar formulario
    await page.fill('input[name="nombre"]', 'Test User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="rut"]', '11111111-1');
    await page.fill('input[name="telefono"]', '123456789');
    await page.fill('input[name="direccion"]', 'Test Address');
    await page.fill('input[name="fechaNacimiento"]', '1990-01-01');
    await page.selectOption('select[name="plan"]', 'mensual');
    await page.fill('input[name="fechaInicioPlan"]', '2024-01-01');
    await page.selectOption('select[name="duracion"]', 'mensual');
    await page.fill('input[name="monto"]', '50000');
    await page.fill('input[name="password"]', 'password123');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se creó el usuario
    await expect(page.locator('text=Usuario creado exitosamente')).toBeVisible();
    
    // Navegar a lista de usuarios
    await page.click('text=Lista Alumnos');
    
    // Verificar que el usuario aparece en la lista
    await expect(page.locator('text=Test User')).toBeVisible();
  });
});
