# GimnasioKr
Sistema de Gestión de Gimnasio — Plataforma web para control de asistencia, administración de usuarios, planes y avisos. Incluye registro de asistencia por QR y RUT, paneles para administrador, profesor y alumno, y calendario de asistencias. Desarrollado con Next.js, Node.js, Express y MongoDB.

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 con TypeScript y Tailwind CSS
- **Backend**: Node.js con Express y TypeScript
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Helmet, CORS, Rate Limiting, Validación de datos

## 🚀 Características

### ✅ Implementadas
- [x] Autenticación JWT segura
- [x] Registro de usuarios con validación de RUT chileno
- [x] Sistema de roles (Admin, Profesor, Alumno)
- [x] Registro de asistencia por QR y RUT
- [x] Generación automática de códigos QR para usuarios
- [x] API REST con validación y manejo de errores
- [x] Interfaz responsive con Tailwind CSS
- [x] Configuración de seguridad (Helmet, CORS, Rate Limiting)

### 🔄 En desarrollo
- [ ] Panel de administración completo
- [ ] Panel de profesor para gestión de asistencias
- [ ] Panel de alumno con calendario personalizado
- [ ] Gestión de planes y suscripciones
- [ ] Sistema de avisos y notificaciones
- [ ] Reportes y estadísticas de asistencia
- [ ] Integración con lectores QR físicos

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- MongoDB (local o Atlas)

### Configuración del Backend

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp ../.env.example .env
```

Editar `.env` con tus configuraciones:
```env
MONGODB_URI=mongodb://localhost:27017/gimnasio-kr
JWT_SECRET=tu-clave-super-secreta-aqui
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Compilar y ejecutar:**
```bash
npm run build
npm start

# O para desarrollo:
npm run dev
```

### Configuración del Frontend

1. **Instalar dependencias:**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

4. **Compilar para producción:**
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/auth/profile` - Actualizar perfil (requiere auth)

### Asistencia
- `POST /api/attendance/qr` - Registrar asistencia por QR
- `POST /api/attendance/rut` - Registrar asistencia por RUT
- `GET /api/attendance/history/:userId?` - Historial de asistencias
- `GET /api/attendance/stats/:userId?` - Estadísticas de asistencia

### Planes
- `GET /api/plans` - Listar planes
- `GET /api/plans/:id` - Obtener plan específico
- `POST /api/plans` - Crear plan (solo admin)
- `PUT /api/plans/:id` - Actualizar plan (solo admin)
- `DELETE /api/plans/:id` - Desactivar plan (solo admin)

## 🔐 Seguridad

- **Autenticación JWT** con tokens seguros
- **Validación de datos** con express-validator
- **Rate limiting** para prevenir ataques de fuerza bruta
- **CORS configurado** para el frontend
- **Helmet.js** para headers de seguridad
- **Hash de contraseñas** con bcrypt (salt rounds: 12)
- **Validación de RUT chileno**

## 👥 Roles y Permisos

### Administrador
- Gestión completa de usuarios
- Creación y edición de planes
- Acceso a todas las estadísticas
- Gestión de avisos globales

### Profesor
- Visualización de asistencias
- Registro manual de asistencias
- Acceso a estadísticas de sus clases

### Alumno
- Visualización de su historial de asistencias
- Acceso a su código QR personal
- Visualización de avisos dirigidos a alumnos

## 🎨 Interfaz de Usuario

- **Diseño responsive** adaptado a móviles y desktop
- **Tema moderno** con gradientes y sombras
- **Navegación intuitiva** con rutas protegidas
- **Feedback visual** para todas las acciones
- **Componentes reutilizables** con Tailwind CSS

## 📱 Funcionalidades de Asistencia

### Registro por QR
- Código QR único por usuario
- Validación de integridad del código
- Registro automático de entrada/salida

### Registro por RUT
- Validación de formato de RUT chileno
- Búsqueda rápida de usuarios
- Registro manual para casos especiales

## 📊 Base de Datos

### Modelos implementados:
- **User**: Usuarios del sistema (admin, profesor, alumno)
- **Plan**: Planes de suscripción
- **Attendance**: Registros de asistencia
- **Announcement**: Avisos y notificaciones

## 🚦 Estado del Proyecto

Este proyecto está en **desarrollo activo**. La funcionalidad básica está implementada y funcionando:

- ✅ **Backend API** completamente funcional
- ✅ **Sistema de autenticación** implementado
- ✅ **Registro de asistencia** por QR y RUT funcionando
- ✅ **Frontend básico** con páginas principales
- 🔄 **Paneles de usuario** en desarrollo
- 🔄 **Características avanzadas** planificadas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Emanuel Aguilera** - [GitHub](https://github.com/EmanuelKanji)
