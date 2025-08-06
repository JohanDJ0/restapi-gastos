# 🔧 Configuración de Variables de Entorno - Producción

## 📋 **Variables Requeridas**

Basándome en tu `src/config.js`, necesitas configurar estas variables en tu proveedor de despliegue:

### **1. Variables de Base de Datos**
```env
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_HOST=tu_host_db
DB_DATABASE=gastosdb
DB_PORT=3306
```

### **2. Variables de Clerk (Completas)**
```env
CLERK_SECRET_KEY=sk_test_tu_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_tu_clerk_publishable_key
CLERK_JWT_KEY=tu_clerk_jwt_key
CLERK_FRONTEND_URL=https://tu-frontend.com
```

### **3. Variables del Servidor**
```env
PORT=10000
```

## 🌐 **Configuración por Proveedor**

### **Render (Recomendado)**

#### **Paso 1: Ir a tu servicio web**
1. Dashboard de Render → Tu servicio web
2. **Environment** → **Environment Variables**

#### **Paso 2: Agregar variables**
```
Key: DB_USER
Value: tu_usuario_db

Key: DB_PASSWORD  
Value: tu_password_db

Key: DB_HOST
Value: tu_host_db

Key: DB_DATABASE
Value: gastosdb

Key: DB_PORT
Value: 3306

Key: CLERK_SECRET_KEY
Value: sk_test_tu_clerk_secret_key

Key: CLERK_PUBLISHABLE_KEY
Value: pk_test_tu_clerk_publishable_key

Key: CLERK_JWT_KEY
Value: tu_clerk_jwt_key

Key: CLERK_FRONTEND_URL
Value: https://tu-frontend.com

Key: PORT
Value: 10000
```

### **Railway**

#### **Paso 1: Ir a tu proyecto**
1. Dashboard de Railway → Tu proyecto
2. **Variables** tab

#### **Paso 2: Agregar variables**
```
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_HOST=tu_host_db
DB_DATABASE=gastosdb
DB_PORT=3306
CLERK_SECRET_KEY=sk_test_tu_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_tu_clerk_publishable_key
CLERK_JWT_KEY=tu_clerk_jwt_key
CLERK_FRONTEND_URL=https://tu-frontend.com
PORT=10000
```

### **Vercel**

#### **Paso 1: Ir a tu proyecto**
1. Dashboard de Vercel → Tu proyecto
2. **Settings** → **Environment Variables**

#### **Paso 2: Agregar variables**
```
Name: DB_USER
Value: tu_usuario_db
Environment: Production

Name: DB_PASSWORD
Value: tu_password_db
Environment: Production

Name: DB_HOST
Value: tu_host_db
Environment: Production

Name: DB_DATABASE
Value: gastosdb
Environment: Production

Name: DB_PORT
Value: 3306
Environment: Production

Name: CLERK_SECRET_KEY
Value: sk_test_tu_clerk_secret_key
Environment: Production

Name: CLERK_PUBLISHABLE_KEY
Value: pk_test_tu_clerk_publishable_key
Environment: Production

Name: CLERK_JWT_KEY
Value: tu_clerk_jwt_key
Environment: Production

Name: CLERK_FRONTEND_URL
Value: https://tu-frontend.com
Environment: Production

Name: PORT
Value: 10000
Environment: Production
```

## 🗄️ **Obtener Credenciales de Base de Datos**

### **Render MySQL**
1. Crear servicio MySQL en Render
2. Ir a **Connect** → **External Database**
3. Copiar las credenciales:
```
Host: tu-host.onrender.com
Port: 5432
Database: gastosdb
Username: tu_usuario
Password: tu_password
```

### **PlanetScale**
1. Crear base de datos en PlanetScale
2. Ir a **Connect** → **Connect with MySQL**
3. Copiar las credenciales:
```
Host: tu-host.aws.connect.psdb.cloud
Port: 3306
Database: gastosdb
Username: tu_usuario
Password: tu_password
```

### **Railway MySQL**
1. Agregar servicio MySQL en Railway
2. Ir a **Connect** → **Variables**
3. Las variables se configuran automáticamente

## 🔑 **Obtener Todas las Claves de Clerk**

### **Paso 1: Ir a Clerk Dashboard**
1. https://dashboard.clerk.com
2. Seleccionar tu aplicación

### **Paso 2: Obtener API Keys**
1. **API Keys** → **Secret Keys**
   - Copiar la clave que empiece con `sk_test_` o `sk_live_`
2. **API Keys** → **Publishable Keys**
   - Copiar la clave que empiece con `pk_test_` o `pk_live_`

### **Paso 3: Obtener JWT Key**
1. **JWT Templates** → **Default**
2. Copiar la **Signing Key** (empieza con `-----BEGIN PUBLIC KEY-----`)

### **Paso 4: Configurar URLs**
1. **User & Authentication** → **Paths**
2. Configurar las URLs de tu aplicación:
   - **Home URL**: `https://tu-frontend.com`
   - **Sign-in URL**: `https://tu-frontend.com/sign-in`
   - **Sign-up URL**: `https://tu-frontend.com/sign-up`

## ✅ **Verificación de Configuración**

### **1. Verificar en el Dashboard**
- Todas las variables deben estar configuradas
- No debe haber valores vacíos
- Las claves deben coincidir exactamente

### **2. Verificar en Logs**
Después del despliegue, revisar los logs para confirmar:
```
✅ Database connected successfully
✅ Server running on port 10000
✅ Clerk configuration loaded
✅ All Clerk keys configured
```

### **3. Probar Endpoints**
```bash
# Health check
curl https://tu-api.com/api

# Debe retornar error de autenticación (esperado)
curl https://tu-api.com/api/users
```

## 🔒 **Seguridad**

### **Variables Sensibles**
- ✅ **DB_PASSWORD**: Nunca compartir
- ✅ **CLERK_SECRET_KEY**: Nunca compartir
- ✅ **CLERK_JWT_KEY**: Nunca compartir
- ✅ **CLERK_PUBLISHABLE_KEY**: Puede ser pública
- ✅ **DB_HOST**: Puede ser pública

### **Buenas Prácticas**
- ✅ Usar claves de producción para producción
- ✅ Rotar claves regularmente
- ✅ No committear `.env` al repositorio
- ✅ Usar variables del proveedor, no archivos `.env`

## 🚨 **Problemas Comunes**

### **Error: "Cannot connect to database"**
- Verificar `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Verificar que la base de datos esté activa
- Verificar firewall/red

### **Error: "Clerk configuration missing"**
- Verificar `CLERK_SECRET_KEY`
- Verificar `CLERK_PUBLISHABLE_KEY`
- Verificar `CLERK_JWT_KEY`
- Verificar que las claves sean válidas
- Verificar que la aplicación esté activa en Clerk

### **Error: "Port already in use"**
- El proveedor asigna el puerto automáticamente
- No configurar `PORT` manualmente
- Usar `process.env.PORT` sin valor por defecto

## 📝 **Ejemplo Completo (Render)**

### **Variables Configuradas:**
```
DB_USER=admin_123456
DB_PASSWORD=my_secure_password_2024
DB_HOST=mysql-123456.onrender.com
DB_DATABASE=gastosdb
DB_PORT=3306
CLERK_SECRET_KEY=sk_test_abc123def456ghi789
CLERK_PUBLISHABLE_KEY=pk_test_xyz789uvw456rst123
CLERK_JWT_KEY=-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
CLERK_FRONTEND_URL=https://mi-app.vercel.app
PORT=10000
```

### **Resultado Esperado:**
```
✅ Database connected: mysql-123456.onrender.com
✅ Server running on port 10000
✅ Clerk configured successfully
✅ All Clerk keys loaded
✅ Frontend URL configured
✅ All environment variables loaded
```

## 🔧 **Script de Verificación**

Puedes usar el script incluido para verificar tu configuración:

```bash
npm run check-env
```

Este script verificará que todas las variables requeridas estén configuradas correctamente.

¡Con estas variables configuradas, tu API estará lista para funcionar en producción! 🚀 