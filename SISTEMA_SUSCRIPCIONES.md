# Sistema de Suscripciones - Backend Implementation

## 🎯 **Resumen de Implementación**

### ✅ **Frontend (React) - Ya Implementado**
- ✅ `PricingTable.tsx` - Tabla de precios con Clerk
- ✅ `UpgradeBanner.tsx` - Banner para funcionalidades premium
- ✅ `useSubscription.ts` - Hook para verificar suscripción
- ✅ Ruta `/pricing` - Página de planes
- ✅ Sidebar actualizado con enlace a Premium

### 🔧 **Backend (Node.js/Express) - Implementado**
- ✅ Tabla de suscripciones en base de datos
- ✅ Middleware para verificar suscripciones
- ✅ Webhook handler para actualizar suscripciones
- ✅ Validación de funcionalidades premium
- ✅ Límites para usuarios free

### ⚙️ **Configuración en Clerk Dashboard - Ya Configurado**
- ✅ Plan: "Plan Korly Premium"
- ✅ Key: `plan_korly_premium`
- ✅ Precio: $5.00 mensual
- ✅ Plan ID: `cplan_30v…6q2aV8Hxb`

## 📋 **Estructura de Base de Datos**

### Tabla `suscripciones`
```sql
CREATE TABLE suscripciones (
    id INT NOT NULL AUTO_INCREMENT,
    clerk_user_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    plan_key VARCHAR(100) NOT NULL,
    status ENUM('active', 'canceled', 'past_due', 'unpaid', 'incomplete') NOT NULL,
    current_period_start DATETIME,
    current_period_end DATETIME,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_plan (clerk_user_id, plan_id),
    FOREIGN KEY (clerk_user_id) REFERENCES clerk_users(clerk_user_id) ON DELETE CASCADE
);
```

### Tabla `webhook_events`
```sql
CREATE TABLE webhook_events (
    id INT NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(100) NOT NULL,
    clerk_user_id VARCHAR(255),
    plan_id VARCHAR(255),
    event_data JSON,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

## 🔧 **Componentes del Backend**

### 1. Middleware de Suscripciones (`src/middleware/subscription.js`)

#### Funcionalidades Principales:
- **`requirePremium`**: Middleware para rutas que requieren suscripción premium
- **`checkFreeLimits`**: Middleware para verificar límites de usuarios free
- **`checkUserSubscription`**: Verificar si usuario tiene suscripción activa
- **`getUserSubscriptionInfo`**: Obtener información completa de suscripción
- **`updateUserRole`**: Actualizar rol del usuario basado en suscripción

#### Límites para Usuarios Free:
```javascript
export const FREE_LIMITS = {
  MAX_CATEGORIES: 10,
  MAX_BUDGETS: 3,
  MAX_TRANSACTIONS_PER_MONTH: 100
};
```

#### Funcionalidades Premium:
```javascript
export const PREMIUM_FEATURES = {
  UNLIMITED_CATEGORIES: 'unlimited_categories',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_DATA: 'export_data',
  CUSTOM_REPORTS: 'custom_reports',
  MULTIPLE_BUDGETS: 'multiple_budgets'
};
```

### 2. Controlador de Suscripciones (`src/controllers/suscripciones.controller.js`)

#### Endpoints Principales:
- **`getSubscriptionInfo`**: Obtener información de suscripción del usuario
- **`checkSubscription`**: Verificar estado de suscripción
- **`handleSubscriptionWebhook`**: Procesar webhooks de Clerk
- **`getSubscriptionStats`**: Estadísticas para administradores

#### Eventos de Webhook Soportados:
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `subscription.payment_failed`
- `subscription.payment_succeeded`

### 3. Rutas de Suscripciones (`src/routes/suscripciones.routes.js`)

#### Endpoints Disponibles:
```
GET  /api/subscription/info          - Información de suscripción
GET  /api/subscription/check         - Verificar suscripción
GET  /api/subscription/stats         - Estadísticas (admin)
POST /api/webhook/subscription       - Webhook de Clerk
```

## 🚀 **Instalación y Configuración**

### 1. Crear Tablas en Base de Datos
```bash
mysql -u root -phachepassword < db/suscripciones.sql
```

### 2. Configurar Webhooks en Clerk Dashboard

#### Pasos:
1. Ir a **Clerk Dashboard** → **Webhooks**
2. Crear nuevo webhook
3. **Endpoint URL**: `https://tu-dominio.com/api/webhook/subscription`
4. **Eventos a suscribir**:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.payment_failed`
   - `subscription.payment_succeeded`

### 3. Reiniciar el Servidor
```bash
npm run dev
```

### 4. Probar el Sistema
```bash
node test-suscripciones.js
```

## 📊 **Límites y Funcionalidades**

### Usuarios Free
- **Categorías**: Máximo 10
- **Presupuestos**: Máximo 3 activos
- **Transacciones**: Máximo 100 por mes
- **Analíticas**: Básicas
- **Exportación**: No disponible
- **Reportes**: No disponibles

### Usuarios Premium
- **Categorías**: Ilimitadas
- **Presupuestos**: Ilimitados
- **Transacciones**: Ilimitadas
- **Analíticas**: Avanzadas
- **Exportación**: Disponible
- **Reportes**: Personalizados

## 🔄 **Flujo de Suscripción**

### 1. Usuario se Registra
- Se crea usuario con rol `'free'` por defecto
- Se mapea con Clerk en tabla `clerk_users`

### 2. Usuario Actualiza a Premium
- Frontend redirige a Clerk Pricing
- Usuario selecciona plan y paga
- Clerk envía webhook `subscription.created`
- Backend actualiza tabla `suscripciones`
- Rol del usuario cambia a `'premium'`

### 3. Verificación de Límites
- Middleware `checkFreeLimits` verifica límites
- Si se excede, retorna error 403 con mensaje
- Frontend muestra banner de upgrade

### 4. Cancelación de Suscripción
- Usuario cancela en Clerk Dashboard
- Clerk envía webhook `subscription.cancelled`
- Backend actualiza estado de suscripción
- Rol del usuario vuelve a `'free'`

## 🧪 **Pruebas del Sistema**

### Script de Pruebas (`test-suscripciones.js`)
```bash
node test-suscripciones.js
```

#### Pruebas Incluidas:
1. **Información de suscripción**
2. **Verificación de estado**
3. **Límites de categorías**
4. **Límites de presupuestos**
5. **Webhook de suscripción**

### Pruebas Manuales

#### 1. Verificar Suscripción
```bash
curl -X GET "http://localhost:3001/api/subscription/info" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

#### 2. Crear Categoría (Probar Límites)
```bash
curl -X POST "http://localhost:3001/api/categorias" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Category",
    "tipo": "gasto",
    "icono": "test-icon",
    "color": "#FF0000"
  }'
```

#### 3. Simular Webhook
```bash
curl -X POST "http://localhost:3001/api/webhook/subscription" \
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

## 🔒 **Seguridad y Validación**

### Validación de Webhooks
- Los webhooks se registran en `webhook_events` para auditoría
- Manejo de errores robusto con rollback de transacciones
- Logs detallados para debugging

### Verificación de Límites
- Verificación en tiempo real antes de cada operación
- Mensajes de error claros con información de límites
- URLs de upgrade incluidas en respuestas de error

### Actualización de Roles
- Roles se actualizan automáticamente con webhooks
- Verificación de suscripción activa en cada petición
- Sincronización entre tablas `users` y `suscripciones`

## 📈 **Monitoreo y Estadísticas**

### Endpoint de Estadísticas
```
GET /api/subscription/stats
```

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "totalActiveSubscriptions": 25,
    "premiumUsers": 25,
    "freeUsers": 150,
    "recentSubscriptions": [...]
  }
}
```

### Logs de Debug
- Creación/actualización de suscripciones
- Cambios de rol de usuario
- Eventos de webhook procesados
- Errores de límites excedidos

## 🚀 **Próximos Pasos**

### 1. Configurar Webhooks en Clerk
- [ ] Ir a Clerk Dashboard → Webhooks
- [ ] Crear webhook con endpoint correcto
- [ ] Suscribir eventos de suscripción

### 2. Probar Sistema Completo
- [ ] Ejecutar script de pruebas
- [ ] Verificar límites de usuarios free
- [ ] Probar actualización a premium
- [ ] Verificar cancelación de suscripción

### 3. Implementar Funcionalidades Premium
- [ ] Analíticas avanzadas
- [ ] Exportación de datos
- [ ] Reportes personalizados
- [ ] Dashboard premium

### 4. Monitoreo y Optimización
- [ ] Configurar alertas de webhooks
- [ ] Optimizar consultas de base de datos
- [ ] Implementar cache para verificaciones
- [ ] Métricas de conversión

## 📞 **Soporte y Troubleshooting**

### Problemas Comunes

#### 1. Webhooks No Llegan
- Verificar URL del webhook en Clerk Dashboard
- Revisar logs del servidor
- Verificar firewall/red

#### 2. Límites No Se Aplican
- Verificar middleware en rutas
- Revisar configuración de límites
- Verificar rol del usuario

#### 3. Roles No Se Actualizan
- Verificar webhook handler
- Revisar logs de actualización
- Verificar conexión a base de datos

### Logs de Debug
```bash
# Ver logs del servidor
npm run dev

# Verificar tablas
mysql -u root -phachepassword -e "USE gastosdb; SELECT * FROM suscripciones;"
mysql -u root -phachepassword -e "USE gastosdb; SELECT * FROM webhook_events;"
```

¡El sistema de suscripciones está completamente implementado y listo para usar! 🎉 