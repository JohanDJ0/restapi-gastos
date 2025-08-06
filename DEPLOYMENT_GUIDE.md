# 🚀 Guía de Despliegue - API de Gastos

## 📋 **Resumen del Sistema**

### ✅ **Funcionalidades Implementadas:**
- ✅ Sistema de autenticación con Clerk
- ✅ Gestión de presupuestos y categorías
- ✅ Sistema de suscripciones premium
- ✅ Límites para usuarios free/premium
- ✅ Webhooks para actualización de suscripciones
- ✅ Base de datos MySQL

### 🔧 **Tecnologías:**
- **Backend**: Node.js + Express
- **Base de Datos**: MySQL
- **Autenticación**: Clerk
- **Pagos**: Clerk Billing (configurado)

## 🌐 **Opciones de Despliegue**

### **1. Render (Recomendado - Gratuito)**

#### **Pasos:**
1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio de GitHub**
3. **Configurar servicio web**
4. **Configurar base de datos MySQL**

#### **Configuración:**
```bash
# Build Command
npm install

# Start Command
npm start

# Environment Variables
PORT=10000
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_HOST=tu_host_db
DB_DATABASE=gastosdb
DB_PORT=3306
CLERK_SECRET_KEY=sk_test_...
```

### **2. Railway (Alternativa - Gratuito)**

#### **Pasos:**
1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio**
3. **Agregar servicio MySQL**
4. **Configurar variables de entorno**

### **3. Vercel (Para APIs - Gratuito)**

#### **Pasos:**
1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Desplegar**:
```bash
vercel
```

3. **Configurar variables de entorno en dashboard**

## 🗄️ **Base de Datos en Producción**

### **Opción A: Render MySQL (Gratuito)**
- Crear servicio MySQL en Render
- Usar la URL de conexión proporcionada

### **Opción B: PlanetScale (Recomendado)**
- Base de datos MySQL serverless
- Muy fácil de configurar
- Generoso plan gratuito

### **Opción C: Railway MySQL**
- Incluido con Railway
- Configuración automática

## 🔧 **Configuración de Variables de Entorno**

### **Variables Requeridas:**
```env
# Puerto (lo asigna el proveedor automáticamente)
PORT=10000

# Base de Datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host
DB_DATABASE=gastosdb
DB_PORT=3306

# Clerk
CLERK_SECRET_KEY=sk_test_...
```

### **Variables Opcionales:**
```env
# CORS (para producción)
CORS_ORIGIN=https://tu-frontend.com
```

## 📊 **Scripts de Base de Datos**

### **1. Crear Tablas:**
```sql
-- Ejecutar en orden:
-- 1. database.sql (tablas principales)
-- 2. suscripciones.sql (sistema de suscripciones)
```

### **2. Datos Iniciales:**
```sql
-- Categorías por defecto
-- Usuarios de prueba (opcional)
```

## 🔄 **Flujo de Despliegue**

### **Paso 1: Preparar Repositorio**
```bash
# Asegurar que todo esté committeado
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### **Paso 2: Crear Base de Datos**
1. Crear servicio MySQL en tu proveedor
2. Obtener credenciales de conexión
3. Ejecutar scripts SQL

### **Paso 3: Desplegar API**
1. Conectar repositorio
2. Configurar variables de entorno
3. Desplegar

### **Paso 4: Configurar Webhooks**
1. Obtener URL de producción
2. Configurar webhooks en Clerk Dashboard
3. Probar endpoints

## 🧪 **Pruebas Post-Despliegue**

### **1. Verificar Endpoints:**
```bash
# Health check
curl https://tu-api.com/api

# Verificar autenticación
curl https://tu-api.com/api/users
```

### **2. Probar Sistema de Suscripciones:**
```bash
# Webhook de prueba
curl -X POST "https://tu-api.com/api/webhook/subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription.created",
    "data": {
      "user_id": "user_test123",
      "subscription": {
        "plan_id": "cplan_30v…6q2aV8Hxb",
        "plan_key": "plan_korly_premium",
        "status": "active"
      }
    }
  }'
```

### **3. Verificar Base de Datos:**
```sql
-- Verificar tablas creadas
SHOW TABLES;

-- Verificar datos
SELECT * FROM users;
SELECT * FROM suscripciones;
```

## 🔒 **Seguridad en Producción**

### **1. Variables de Entorno:**
- ✅ Nunca committear `.env`
- ✅ Usar variables del proveedor
- ✅ Rotar claves regularmente

### **2. CORS:**
- ✅ Configurar dominios permitidos
- ✅ No usar `*` en producción

### **3. Base de Datos:**
- ✅ Usar conexiones SSL
- ✅ Configurar firewall
- ✅ Backups regulares

## 📈 **Monitoreo**

### **1. Logs:**
- Revisar logs del servidor
- Monitorear errores
- Verificar webhooks

### **2. Métricas:**
- Uso de CPU/Memoria
- Tiempo de respuesta
- Errores 4xx/5xx

### **3. Base de Datos:**
- Conexiones activas
- Consultas lentas
- Uso de espacio

## 🚀 **URLs de Producción**

### **API:**
```
https://tu-api.onrender.com
https://tu-api.railway.app
https://tu-api.vercel.app
```

### **Webhook:**
```
https://tu-api.onrender.com/api/webhook/subscription
https://tu-api.railway.app/api/webhook/subscription
https://tu-api.vercel.app/api/webhook/subscription
```

## 🔧 **Troubleshooting**

### **Problemas Comunes:**

#### **1. Error de Conexión a Base de Datos:**
- Verificar credenciales
- Verificar host y puerto
- Verificar firewall

#### **2. Error de CORS:**
- Configurar dominios permitidos
- Verificar headers

#### **3. Webhooks No Llegan:**
- Verificar URL del webhook
- Verificar logs del servidor
- Probar endpoint manualmente

## 📞 **Soporte**

### **Documentación:**
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

### **Comunidad:**
- Stack Overflow
- GitHub Issues
- Discord de proveedores

¡Tu API estará lista para producción! 🎉 