import { test as base } from '@playwright/test';

// Configuración base para tests E2E
export const test = base.extend({
  // Configuración de página base
  page: async ({ page }, use) => {
    // Configurar timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    // Configurar viewport por defecto
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Interceptar errores de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
    
    // Interceptar errores de red
    page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`Network error: ${response.status()} ${response.url()}`);
      }
    });
    
    await use(page);
  },
});

// Datos de prueba
export const testData = {
  admin: {
    username: 'admin@test.com',
    password: 'admin123'
  },
  profesor: {
    username: 'profesor@test.com',
    password: 'profesor123'
  },
  alumno: {
    username: 'alumno@test.com',
    password: 'alumno123'
  }
};

// Utilidades para tests
export const testUtils = {
  // Login rápido
  async loginAs(page: any, role: 'admin' | 'profesor' | 'alumno') {
    const credentials = testData[role];
    const loginUrl = `/login-${role}`;
    
    await page.goto(loginUrl);
    await page.fill('input[type="text"]', credentials.username);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    // Esperar a que navegue al dashboard
    await page.waitForURL(`**/dashboard-${role}**`);
  },
  
  // Esperar a que cargue el contenido
  async waitForContent(page: any, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
  },
  
  // Limpiar localStorage
  async clearStorage(page: any) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
};
