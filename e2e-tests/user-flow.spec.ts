import { test, expect } from '@playwright/test';

test.describe('Flujo Completo de Usuario E2E', () => {
  test('flujo completo de admin - crear usuario y gestionar planes', async ({ page }) => {
    // 1. Login como admin
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verificar que llega al dashboard
    await expect(page).toHaveURL(/.*dashboard-admin/);
    await expect(page.locator('text=Dashboard Admin')).toBeVisible();
    
    // 2. Navegar a crear usuario
    await page.click('text=Crear Usuario');
    await expect(page.locator('text=Crear Nuevo Usuario')).toBeVisible();
    
    // 3. Llenar formulario de crear usuario
    await page.fill('input[name="nombre"]', 'Juan Pérez');
    await page.fill('input[name="email"]', 'juan@test.com');
    await page.fill('input[name="rut"]', '12345678-9');
    await page.fill('input[name="telefono"]', '123456789');
    await page.fill('input[name="direccion"]', 'Calle 123, Santiago');
    await page.fill('input[name="fechaNacimiento"]', '1990-01-01');
    await page.selectOption('select[name="plan"]', 'mensual');
    await page.fill('input[name="fechaInicioPlan"]', '2024-01-01');
    await page.selectOption('select[name="duracion"]', 'mensual');
    await page.fill('input[name="monto"]', '50000');
    await page.fill('input[name="password"]', 'password123');
    
    // 4. Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se creó el usuario
    await expect(page.locator('text=Usuario creado exitosamente')).toBeVisible();
    
    // 5. Navegar a gestionar planes
    await page.click('text=Gestionar Planes');
    await expect(page.locator('text=Gestionar Planes')).toBeVisible();
    
    // 6. Crear nuevo plan
    await page.click('text=Crear Plan');
    await page.fill('input[name="nombre"]', 'Plan Premium');
    await page.fill('textarea[name="descripcion"]', 'Plan premium con acceso ilimitado');
    await page.fill('input[name="precio"]', '75000');
    await page.selectOption('select[name="clases"]', 'todos_los_dias');
    await page.fill('input[name="matricula"]', '15000');
    await page.selectOption('select[name="duracion"]', 'mensual');
    
    // 7. Enviar formulario de plan
    await page.click('button[type="submit"]');
    
    // Verificar que se creó el plan
    await expect(page.locator('text=Plan creado exitosamente')).toBeVisible();
  });

  test('flujo completo de profesor - pasar asistencia y ver resumen', async ({ page }) => {
    // 1. Login como profesor
    await page.goto('/login-profesor');
    await page.fill('input[type="text"]', 'profesor@test.com');
    await page.fill('input[type="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    
    // Verificar que llega al dashboard
    await expect(page).toHaveURL(/.*dashboard-profesor/);
    await expect(page.locator('text=Dashboard Profesor')).toBeVisible();
    
    // 2. Navegar a pasar asistencia
    await page.click('text=Pasar Asistencia');
    await expect(page.locator('text=Pasar Asistencia')).toBeVisible();
    
    // 3. Verificar que hay QR scanner
    await expect(page.locator('text=Escanea el código QR')).toBeVisible();
    
    // 4. Navegar a resumen
    await page.click('text=Resumen');
    await expect(page.locator('text=Resumen Profesor')).toBeVisible();
    
    // 5. Verificar estadísticas
    await expect(page.locator('text=Estadísticas')).toBeVisible();
    await expect(page.locator('text=Alumnos')).toBeVisible();
    await expect(page.locator('text=Asistencias')).toBeVisible();
  });

  test('flujo completo de alumno - ver perfil y asistencia', async ({ page }) => {
    // 1. Login como alumno
    await page.goto('/login-alumno');
    await page.fill('input[type="text"]', 'alumno@test.com');
    await page.fill('input[type="password"]', 'alumno123');
    await page.click('button[type="submit"]');
    
    // Verificar que llega al dashboard
    await expect(page).toHaveURL(/.*dashboard-alumno/);
    await expect(page.locator('text=Dashboard Alumno')).toBeVisible();
    
    // 2. Navegar a perfil
    await page.click('text=Perfil');
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
    
    // 3. Verificar información del perfil
    await expect(page.locator('text=Juan Pérez')).toBeVisible();
    await expect(page.locator('text=juan@test.com')).toBeVisible();
    await expect(page.locator('text=12345678-9')).toBeVisible();
    
    // 4. Navegar a asistencia
    await page.click('text=Asistencia');
    await expect(page.locator('text=Mi Asistencia')).toBeVisible();
    
    // 5. Verificar calendario
    await expect(page.locator('.calendar')).toBeVisible();
    await expect(page.locator('text=Clases disponibles')).toBeVisible();
  });

  test('navegación entre secciones en móvil', async ({ page }) => {
    // Configurar vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login como admin
    await page.goto('/login-admin');
    await page.fill('input[type="text"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verificar que el menú hamburguesa funciona
    await page.click('.hamburger');
    await expect(page.locator('.sidebar')).toBeVisible();
    
    // Navegar a diferentes secciones
    await page.click('text=Crear Usuario');
    await expect(page.locator('text=Crear Nuevo Usuario')).toBeVisible();
    
    await page.click('.hamburger');
    await page.click('text=Gestionar Planes');
    await expect(page.locator('text=Gestionar Planes')).toBeVisible();
    
    await page.click('.hamburger');
    await page.click('text=Historial Asistencia');
    await expect(page.locator('text=Historial de Asistencia')).toBeVisible();
  });
});
