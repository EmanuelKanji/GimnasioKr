# Tests E2E (End-to-End) - Gimnasio KR

## 📋 Descripción

Este directorio contiene los tests E2E (End-to-End) para el sistema de gestión de gimnasio. Los tests E2E simulan el comportamiento de un usuario real navegando por la aplicación.

## 🚀 Comandos Disponibles

### Ejecutar Tests
```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests con interfaz gráfica
npm run test:e2e:ui

# Ejecutar tests en modo headed (ver navegador)
npm run test:e2e:headed

# Ejecutar tests en modo debug
npm run test:e2e:debug

# Ver reporte de tests
npm run test:e2e:report
```

### Ejecutar Tests Específicos
```bash
# Solo tests de autenticación
npx playwright test auth.spec.ts

# Solo tests de performance
npx playwright test performance.spec.ts

# Solo tests de accesibilidad
npx playwright test accessibility.spec.ts
```

## 📁 Estructura de Archivos

```
e2e-tests/
├── README.md                    # Este archivo
├── test-setup.ts               # Configuración base y utilidades
├── auth.spec.ts                # Tests de autenticación
├── admin-dashboard.spec.ts     # Tests del dashboard de admin
├── user-flow.spec.ts           # Tests de flujos completos de usuario
├── performance.spec.ts         # Tests de performance
├── accessibility.spec.ts       # Tests de accesibilidad
└── api-integration.spec.ts     # Tests de integración con API
```

## 🧪 Tipos de Tests

### 1. Tests de Autenticación (`auth.spec.ts`)
- Navegación entre páginas de login
- Validación de formularios
- Manejo de errores de autenticación

### 2. Tests de Dashboard (`admin-dashboard.spec.ts`)
- Funcionalidad del dashboard de admin
- Responsive design
- Menú hamburguesa en móvil

### 3. Tests de Flujo de Usuario (`user-flow.spec.ts`)
- Flujos completos de admin, profesor y alumno
- Navegación entre secciones
- Creación de usuarios y planes

### 4. Tests de Performance (`performance.spec.ts`)
- Tiempos de carga
- Manejo de múltiples pestañas
- Modo offline
- Scroll infinito

### 5. Tests de Accesibilidad (`accessibility.spec.ts`)
- Navegación con teclado
- Contraste de colores
- Textos alternativos
- Estructura semántica

### 6. Tests de Integración API (`api-integration.spec.ts`)
- Conexión con backend
- Manejo de errores de API
- Estados de loading
- Sincronización de datos

## ⚙️ Configuración

### Navegadores Soportados
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Chrome Mobile
- Safari Mobile

### Viewports de Prueba
- iPhone SE (320x568)
- iPhone 8 (375x667)
- iPhone 11 (414x896)
- iPad (768x1024)
- Desktop pequeño (1024x768)
- Desktop grande (1920x1080)

## 🔧 Configuración de Entorno

### Variables de Entorno
```bash
# URL base de la aplicación
BASE_URL=http://localhost:3000

# URL del backend
API_URL=http://localhost:5000

# Modo de test
NODE_ENV=test
```

### Datos de Prueba
Los tests utilizan datos de prueba predefinidos en `test-setup.ts`:
- Admin: admin@test.com / admin123
- Profesor: profesor@test.com / profesor123
- Alumno: alumno@test.com / alumno123

## 📊 Reportes

### Reporte HTML
Después de ejecutar los tests, se genera un reporte HTML en `playwright-report/` que incluye:
- Resumen de resultados
- Screenshots de fallos
- Videos de ejecución
- Trazas de red

### Reporte JSON
Los resultados también se pueden exportar en formato JSON para integración con CI/CD.

## 🐛 Debugging

### Modo Debug
```bash
npm run test:e2e:debug
```
Abre el navegador en modo debug donde puedes:
- Pausar la ejecución
- Inspeccionar elementos
- Ver el estado de la aplicación

### Screenshots y Videos
Los tests automáticamente capturan:
- Screenshots en caso de fallo
- Videos de la ejecución completa
- Trazas de red para debugging

## 🚀 CI/CD

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
```

### Docker
```dockerfile
FROM mcr.microsoft.com/playwright:v1.56.0
COPY . .
RUN npm install
RUN npx playwright install
CMD ["npm", "run", "test:e2e"]
```

## 📝 Mejores Prácticas

1. **Tests Independientes**: Cada test debe ser independiente y no depender de otros
2. **Datos de Prueba**: Usar datos de prueba consistentes y predecibles
3. **Timeouts**: Configurar timeouts apropiados para cada operación
4. **Cleanup**: Limpiar el estado después de cada test
5. **Assertions**: Usar assertions específicas y descriptivas

## 🔍 Troubleshooting

### Problemas Comunes

1. **Tests fallan por timeout**
   - Aumentar timeout en `playwright.config.ts`
   - Verificar que la aplicación esté corriendo

2. **Elementos no encontrados**
   - Verificar selectores CSS
   - Añadir waits explícitos

3. **Tests inconsistentes**
   - Verificar que no hay dependencias entre tests
   - Limpiar estado entre tests

### Logs y Debugging
```bash
# Ver logs detallados
DEBUG=pw:api npm run test:e2e

# Ejecutar un test específico con logs
npx playwright test auth.spec.ts --debug
```
