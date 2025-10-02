# 📚 Documentación de APIs Estandarizadas - Sistema de Gimnasio

## 🎯 **Estructura General**

Todas las APIs siguen el patrón RESTful y están organizadas por recursos:

- **Base URL**: `http://localhost:4000/api`
- **Autenticación**: Bearer Token (JWT)
- **Formato**: JSON

## 🔐 **Autenticación**

### **POST** `/api/auth/login`
Login unificado que detecta automáticamente el rol del usuario.

**Request:**
```json
{
  "username": "usuario@email.com",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "username": "usuario@email.com",
    "role": "alumno|admin|profesor"
  }
}
```

### **POST** `/api/auth/login/admin`
Login específico para administradores.

### **POST** `/api/auth/login/alumno`
Login específico para alumnos.

### **POST** `/api/auth/login/profesor`
Login específico para profesores.

## 👥 **Gestión de Alumnos**

### **POST** `/api/alumnos` (Admin only)
Crear un nuevo alumno.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "rut": "12.345.678-9",
  "direccion": "Av. Siempre Viva 742",
  "fechaNacimiento": "2000-01-01",
  "email": "juan@email.com",
  "telefono": "+56912345678",
  "plan": "mensual",
  "fechaInicioPlan": "2025-01-01",
  "duracion": "mensual",
  "monto": 35000,
  "password": "contraseña123"
}
```

### **GET** `/api/alumnos` (Admin only)
Obtener lista de todos los alumnos.

## 👤 **Datos del Alumno Autenticado**

### **GET** `/api/alumnos/me/perfil`
Obtener perfil del alumno autenticado.

**Response:**
```json
{
  "perfil": {
    "nombre": "Juan Pérez",
    "rut": "12.345.678-9",
    "email": "juan@email.com",
    "telefono": "+56912345678",
    "direccion": "Av. Siempre Viva 742",
    "fechaNacimiento": "2000-01-01"
  }
}
```

### **GET** `/api/alumnos/me/plan`
Obtener plan del alumno autenticado.

**Response:**
```json
{
  "plan": {
    "nombre": "Plan Mensual",
    "descripcion": "Acceso ilimitado a clases grupales y uso de gimnasio.",
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-01-31",
    "estadoPago": "pagado",
    "monto": 35000
  }
}
```

### **GET** `/api/alumnos/me/asistencias`
Obtener asistencias del alumno autenticado.

**Response:**
```json
{
  "diasAsistidos": ["2025-01-15", "2025-01-16", "2025-01-18"]
}
```

### **GET** `/api/alumnos/me/avisos`
Obtener avisos del alumno autenticado.

**Response:**
```json
{
  "avisos": [
    {
      "titulo": "Recordatorio de pago",
      "mensaje": "Recuerda pagar tu mensualidad antes del 5 de cada mes.",
      "fecha": "2025-01-20",
      "leido": false
    }
  ]
}
```

## 👨‍💼 **Gestión de Usuarios** (Admin only)

### **POST** `/api/usuarios`
Crear un nuevo usuario del sistema.

## 📋 **Gestión de Planes** (Admin only)

### **GET** `/api/planes`
Obtener lista de planes disponibles.

### **POST** `/api/planes`
Crear un nuevo plan.

## 📊 **Gestión de Asistencias**

### **GET** `/api/asistencias`
Obtener asistencias (según rol).

### **POST** `/api/asistencias`
Registrar asistencia.

## 🔒 **Códigos de Estado HTTP**

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos de entrada inválidos
- **401**: Unauthorized - Token inválido o faltante
- **403**: Forbidden - Sin permisos para la operación
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Recurso ya existe
- **500**: Internal Server Error - Error del servidor

## 📝 **Headers Requeridos**

Para todas las rutas protegidas:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🚀 **Ejemplos de Uso**

### Crear un alumno (Admin):
```bash
curl -X POST http://localhost:4000/api/alumnos \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María González",
    "rut": "98.765.432-1",
    "email": "maria@email.com",
    "password": "password123",
    "plan": "trimestral",
    "fechaInicioPlan": "2025-01-01",
    "duracion": "trimestral",
    "monto": 90000
  }'
```

### Obtener perfil del alumno:
```bash
curl -X GET http://localhost:4000/api/alumnos/me/perfil \
  -H "Authorization: Bearer <alumno_token>"
```

## ✅ **Beneficios de la Estandarización**

1. **Consistencia**: Todas las rutas siguen el mismo patrón
2. **Claridad**: `/me/` indica datos del usuario autenticado
3. **Escalabilidad**: Fácil agregar nuevos endpoints
4. **Mantenibilidad**: Código más limpio y organizado
5. **Documentación**: APIs bien documentadas y fáciles de entender





