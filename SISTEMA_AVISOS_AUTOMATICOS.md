# Sistema de Avisos Automáticos

## 📋 Descripción

Sistema completamente automático para enviar avisos a alumnos cuando sus planes están próximos a vencer. El sistema verifica diariamente los planes y envía notificaciones automáticas sin intervención manual.

## 🚀 Características

- **Verificación automática**: Se ejecuta diariamente a las 9:00 AM y 6:00 PM
- **Prevención de duplicados**: Evita enviar avisos duplicados en 24 horas
- **Filtrado inteligente**: Solo notifica planes que vencen en 7 días o menos
- **Mensajes personalizados**: Diferentes mensajes según días restantes
- **Logs detallados**: Registro completo de todas las operaciones
- **Verificación manual**: Endpoint para ejecutar verificación manual

## 📁 Archivos Creados

### Backend
- `backend/src/services/avisoService.ts` - Servicio principal de avisos
- `backend/src/scripts/verificarAvisosDiarios.ts` - Script de verificación diaria
- `backend/src/controllers/avisoController.ts` - Endpoint de verificación manual
- `backend/src/routes/avisoRoutes.ts` - Ruta para verificación manual

### Dependencias
- `node-cron` - Para tareas programadas
- `@types/node-cron` - Tipos de TypeScript

## 🛠️ Uso

### 1. Ejecutar una sola vez (Testing)
```bash
cd backend
npm run avisos:once
```

### 2. Iniciar servicio automático
```bash
cd backend
npm run avisos:schedule
```

### 3. Verificación manual (API)
```bash
curl -X POST http://localhost:3000/api/avisos/verificar-planes \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## ⏰ Programación

### Horarios de Ejecución
- **9:00 AM**: Verificación matutina
- **6:00 PM**: Verificación vespertina
- **Zona horaria**: America/Santiago

### Criterios de Notificación
- Planes que vencen en **7 días o menos**
- Solo planes activos (fechaTerminoPlan válida)
- Prevención de duplicados por 24 horas

## 📊 Tipos de Avisos

### 1. Plan vence mañana
```
Título: "Tu plan vence mañana"
Mensaje: "Hola [NOMBRE], tu plan [PLAN] vence mañana. Te recomendamos renovar para evitar interrupciones en tu entrenamiento."
Motivo: vencimiento_plan_1_dia
```

### 2. Plan vence en 2-3 días
```
Título: "Tu plan vence en [X] días"
Mensaje: "Hola [NOMBRE], tu plan [PLAN] vence en [X] días. Te recomendamos renovar pronto para continuar con tu entrenamiento."
Motivo: vencimiento_plan_[X]_dias
```

### 3. Plan vence en 4-7 días
```
Título: "Tu plan vence en [X] días"
Mensaje: "Hola [NOMBRE], tu plan [PLAN] vence en [X] días. Considera renovar para mantener tu rutina de entrenamiento."
Motivo: vencimiento_plan_[X]_dias
```

## 🔧 Configuración

### Variables de Entorno
Asegúrate de tener configuradas las variables de entorno en `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/gimnasio
JWT_SECRET=tu_jwt_secret
```

### Base de Datos
El sistema requiere las siguientes colecciones:
- `alumnos` - Con campo `fechaTerminoPlan`
- `avisos` - Con campos `tipo` y `motivoAutomatico`

## 📈 Monitoreo

### Logs del Sistema
El sistema genera logs detallados:
```
🔔 Iniciando verificación automática de planes próximos a vencer...
📊 Verificando 150 alumnos con planes activos
🔔 Encontrados 5 alumnos con planes próximos a vencer
✅ Aviso automático enviado a Juan Pérez (3 días restantes)
🎉 Verificación completada: 5 avisos enviados, 0 errores
```

### Métricas
- Avisos enviados por día
- Errores en el envío
- Planes vencidos detectados
- Tiempo de ejecución

## 🚨 Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verificar que MongoDB esté ejecutándose
- Revisar la cadena de conexión en `.env`

### Error: "No se envían avisos"
- Verificar que hay alumnos con planes próximos a vencer
- Revisar logs para errores específicos
- Verificar que el campo `fechaTerminoPlan` esté correctamente formateado

### Avisos duplicados
- El sistema previene duplicados automáticamente
- Si persiste, verificar la lógica de `verificarAvisoDuplicado`

## 🔄 Despliegue en Producción

### 1. Compilar el proyecto
```bash
npm run build
```

### 2. Ejecutar con PM2 (recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Ejecutar servicio de avisos
pm2 start "npm run avisos:build" --name "avisos-automaticos"

# Ver logs
pm2 logs avisos-automaticos

# Reiniciar servicio
pm2 restart avisos-automaticos
```

### 3. Configurar inicio automático
```bash
# Guardar configuración actual
pm2 save

# Configurar para que se inicie automáticamente
pm2 startup
```

## 📝 Notas Importantes

- El sistema es **completamente automático** una vez configurado
- No requiere intervención manual para funcionar
- Los avisos se envían a la plataforma (no por email)
- Los alumnos pueden ver los avisos en su dashboard
- El sistema es escalable y puede manejar miles de alumnos

## 🎯 Beneficios

1. **Automatización completa**: No requiere intervención manual
2. **Prevención de duplicados**: Evita spam a los alumnos
3. **Mensajes personalizados**: Diferentes según días restantes
4. **Monitoreo detallado**: Logs completos para debugging
5. **Escalabilidad**: Funciona con cualquier cantidad de alumnos
6. **Confiabilidad**: Sistema robusto con manejo de errores
