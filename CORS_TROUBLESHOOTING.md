# 🔧 Solución de Problemas CORS

## 🚨 Error Reportado
```
Access to fetch at 'https://gimnasiokr.onrender.com/api/auth/login' from origin 'https://kraccess.netlify.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución Implementada

### 1. **Configuración CORS Mejorada**
- ✅ `https://kraccess.netlify.app` ya está en la lista de orígenes permitidos
- ✅ Mejorado el manejo de peticiones preflight (OPTIONS)
- ✅ Agregado logging detallado para debugging
- ✅ Headers CORS completos y correctos

### 2. **Orígenes Permitidos**
```javascript
const allowedOrigins = [
  'https://kraccess.netlify.app',        // ✅ Tu dominio de Netlify
  'https://gimnasiokr.onrender.com',     // ✅ Backend en Render
  // Se pueden agregar más desde variables de entorno
];
```

### 3. **Headers CORS Configurados**
```javascript
// Headers permitidos
'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 
'Access-Control-Request-Method', 'Access-Control-Request-Headers'

// Headers expuestos
'Authorization'

// Métodos permitidos
'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'
```

## 🔍 Pasos para Verificar

### 1. **Verificar que el Backend esté Desplegado**
```bash
# Verificar que el servidor esté corriendo
curl -X OPTIONS https://gimnasiokr.onrender.com/api/auth/login \
  -H "Origin: https://kraccess.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

### 2. **Verificar Logs del Backend**
El backend ahora muestra logs detallados:
- `🌐 Petición OPTIONS desde: https://kraccess.netlify.app a /api/auth/login`
- `✅ Preflight permitido para: https://kraccess.netlify.app`

### 3. **Verificar en el Navegador**
1. Abrir DevTools (F12)
2. Ir a la pestaña Network
3. Intentar hacer login
4. Verificar que la petición OPTIONS devuelva status 200

## 🚀 Despliegue del Backend

### Opción 1: Despliegue Automático (Recomendado)
Si tienes GitHub conectado a Render:
1. Hacer commit y push de los cambios
2. Render detectará los cambios automáticamente
3. El backend se redesplegará con la nueva configuración

### Opción 2: Despliegue Manual
```bash
# En el directorio del backend
cd backend
npm run build
# Luego desplegar manualmente en Render
```

## 🔧 Configuración Adicional

### Variables de Entorno en Render
Agregar en el dashboard de Render:
```
NODE_ENV=production
CORS_ORIGIN=https://kraccess.netlify.app,https://gimnasiokr.onrender.com
```

### Verificar Configuración
```javascript
// El backend ahora muestra en consola:
console.log(`📋 Orígenes permitidos: ${allowedOrigins.join(', ')}`);
console.log(`✅ CORS permitido para origen: ${origin}`);
```

## 🐛 Debugging Adicional

### Si el problema persiste:

1. **Verificar DNS**
   ```bash
   nslookup gimnasiokr.onrender.com
   ```

2. **Verificar SSL**
   ```bash
   curl -I https://gimnasiokr.onrender.com
   ```

3. **Verificar Headers de Respuesta**
   ```bash
   curl -X OPTIONS https://gimnasiokr.onrender.com/api/auth/login \
     -H "Origin: https://kraccess.netlify.app" \
     -I
   ```

## 📞 Contacto
Si el problema persiste después de estos pasos, revisar:
1. Logs del servidor en Render
2. Configuración de red/firewall
3. Cache del navegador (limpiar cache)

---
**Última actualización**: $(date)
**Estado**: ✅ Configuración CORS corregida y mejorada
