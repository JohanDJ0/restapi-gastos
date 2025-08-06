# API de Gastos

API REST para gestión de presupuestos con autenticación usando Clerk.

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_DATABASE=gastosdb
DB_PORT=3306

# Server Configuration
PORT=3000

# Clerk Configuration
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

### Nota sobre Autenticación

Esta API usa la verificación sin red (networkless verification) de Clerk con tokens de sesión de corta duración. Esto es más seguro y eficiente que la verificación basada en red que se usaba anteriormente.

### Base de Datos

1. Ejecuta el script SQL en `db/database.sql` para crear la base de datos y las tablas
2. Asegúrate de que MySQL esté corriendo y las credenciales sean correctas

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

## Endpoints de Presupuestos

Todos los endpoints requieren autenticación con un token Bearer de Clerk.

### Obtener todos los presupuestos del usuario
```
GET /api/presupuestos
Authorization: Bearer <clerk_token>
```

### Obtener presupuesto específico
```
GET /api/presupuestos/:id
Authorization: Bearer <clerk_token>
```

### Obtener presupuesto predeterminado
```
GET /api/presupuestos/predeterminado
Authorization: Bearer <clerk_token>
```

### Obtener presupuestos próximos a expirar
```
GET /api/presupuestos/proximos-expirar
Authorization: Bearer <clerk_token>
```

### Renovar presupuesto
```
POST /api/presupuestos/:id/renovar
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "monto_inicial": 1200.00,
  "saldo_disponible": 1200.00
}
```

### Crear nuevo presupuesto
```
POST /api/presupuestos
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "nombre": "Presupuesto Mensual",
  "descripcion": "Presupuesto para gastos mensuales",
  "tipo": "mensual",
  "monto_inicial": 1000.00,
  "saldo_disponible": 1000.00,
  "es_predeterminado": false,
  "estado": "activo"
}
```

**Valores válidos para `tipo`:**
- `"semanal"` - Se archiva automáticamente al final de la semana actual (domingo 23:59:59)
- `"mensual"` - Se archiva automáticamente al final del mes actual (último día 23:59:59)
- `"personalizado"` - No se archiva automáticamente

**Valores válidos para `estado`:**
- `"activo"`
- `"archivado"`

## Manejo Automático de Estados

### Presupuestos Semanales y Mensuales
- Los presupuestos de tipo `semanal` se archivan automáticamente al final de la semana actual (domingo 23:59:59), independientemente del día en que se creen
- Los presupuestos de tipo `mensual` se archivan automáticamente al final del mes actual (último día 23:59:59), independientemente del día en que se creen
- Los presupuestos de tipo `personalizado` no se archivan automáticamente

### Información de Expiración
Al obtener presupuestos, se incluye información adicional:
- `fecha_expiracion`: Fecha cuando el presupuesto expirará
- `proximo_a_expirar`: Boolean que indica si está próximo a expirar (1 día antes)
- `dias_restantes`: Número de días restantes hasta la expiración (solo en presupuestos próximos a expirar)
- `informacion_periodo`: Información detallada del período del presupuesto
  - `fecha_inicio`: Inicio del período (lunes para semanal, primer día del mes para mensual)
  - `fecha_fin`: Fin del período (domingo para semanal, último día del mes para mensual)
  - `dias_restantes`: Días restantes hasta el final del período
  - `porcentaje_completado`: Porcentaje del período completado
  - `descripcion`: Descripción del período (ej: "Semana del 15/01 al 21/01")
- `nombre_periodo`: Nombre legible del período (ej: "Semana del 15/01 al 21/01", "Enero 2024")

### Renovación de Presupuestos
- Solo se pueden renovar presupuestos semanales y mensuales
- El presupuesto debe estar archivado o próximo a expirar para poder renovarlo
- La renovación crea un nuevo presupuesto con el mismo nombre y configuración
- Se mantiene el estado de predeterminado si el original lo tenía

### Actualizar presupuesto
```
PUT /api/presupuestos/:id
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "nombre": "Presupuesto Actualizado",
  "descripcion": "Nueva descripción",
  "tipo": "semanal",
  "monto_inicial": 500.00,
  "saldo_disponible": 300.00,
  "es_predeterminado": true,
  "estado": "activo"
}
```

### Eliminar presupuesto
```
DELETE /api/presupuestos/:id
Authorization: Bearer <clerk_token>
```

## Estructura de la Base de Datos

### Tabla presupuestos
- `id`: INT (PK, AUTO_INCREMENT)
- `usuario_id`: INT (FK → users(id), NOT NULL)
- `nombre`: VARCHAR(100) (NOT NULL)
- `descripcion`: TEXT (NULLABLE)
- `tipo`: ENUM('semanal', 'mensual', 'personalizado')
- `monto_inicial`: DECIMAL(10,2) (NOT NULL)
- `saldo_disponible`: DECIMAL(10,2) (NOT NULL)
- `es_predeterminado`: BOOLEAN (DEFAULT FALSE)
- `estado`: ENUM('activo', 'archivado')
- `creado_en`: DATETIME (DEFAULT CURRENT_TIMESTAMP)
- `actualizado_en`: DATETIME (DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

## Endpoints de Categorías

Todos los endpoints requieren autenticación con un token Bearer de Clerk.

### Obtener todas las categorías del usuario
```
GET /api/categorias
Authorization: Bearer <clerk_token>
```

**Respuesta incluye:**
- Categorías globales (disponibles para todos los usuarios)
- Categorías personales del usuario autenticado
- Se crean automáticamente las categorías por defecto si no existen

### Obtener categorías por tipo
```
GET /api/categorias/tipo/:tipo
Authorization: Bearer <clerk_token>
```

### Obtener categoría específica
```
GET /api/categorias/:id
Authorization: Bearer <clerk_token>
```

### Crear nueva categoría personalizada
```
POST /api/categorias
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "nombre": "Comida",
  "tipo": "gasto",
  "icono": "🍕",
  "color": "#FF6B6B"
}
```

### Crear categorías por defecto para el usuario
```
POST /api/categorias/crear-defecto
Authorization: Bearer <clerk_token>
```

**Crea categorías personales por defecto:**
- Mi Salario, Proyectos (ingresos)
- Comida, Gasolina, Renta (gastos)

### Actualizar categoría
```
PUT /api/categorias/:id
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "nombre": "Comida y Bebidas",
  "tipo": "gasto",
  "icono": "🍕",
  "color": "#FF6B6B"
}
```

### Eliminar categoría
```
DELETE /api/categorias/:id
Authorization: Bearer <clerk_token>
```

**Nota:** Solo se pueden eliminar categorías personales, no las globales.

**Valores válidos para `tipo`:**
- `"ingreso"`
- `"gasto"`

### Categorías por Defecto

El sistema incluye categorías por defecto que se crean automáticamente:

#### 🌍 Categorías Globales (disponibles para todos)
**Ingresos:** Salario, Regalos, Reembolsos, Otros Ingresos
**Gastos:** Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Otros Gastos

#### 👤 Categorías Personales por Defecto
**Ingresos:** Mi Salario, Proyectos
**Gastos:** Comida, Gasolina, Renta

## Estructura de la Base de Datos

### Tabla categorias
- `id`: INT (PK, AUTO_INCREMENT)
- `usuario_id`: INT (FK → users(id), NULLABLE)
- `nombre`: VARCHAR(100) (NOT NULL)
- `tipo`: ENUM('ingreso', 'gasto')
- `icono`: VARCHAR(100) (NULLABLE)
- `color`: VARCHAR(20) (NULLABLE)

## Endpoints de Transacciones

Todos los endpoints requieren autenticación con un token Bearer de Clerk.

### Obtener todas las transacciones del usuario
```
GET /api/transacciones
Authorization: Bearer <clerk_token>
```

### Obtener resumen de transacciones
```
GET /api/transacciones/resumen?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer <clerk_token>
```

### Obtener transacciones por presupuesto
```
GET /api/transacciones/presupuesto/:presupuesto_id
Authorization: Bearer <clerk_token>
```

### Obtener transacciones por categoría
```
GET /api/transacciones/categoria/:categoria_id
Authorization: Bearer <clerk_token>
```

### Obtener transacción específica
```
GET /api/transacciones/:id
Authorization: Bearer <clerk_token>
```

### Crear nueva transacción
```
POST /api/transacciones
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "presupuesto_id": 1,
  "tipo": "gasto",
  "categoria_id": 2,
  "descripcion": "Compra de comida",
  "monto": 50.00,
  "fecha": "2024-01-15T10:30:00Z"
}
```

### Actualizar transacción
```
PUT /api/transacciones/:id
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "presupuesto_id": 1,
  "tipo": "gasto",
  "categoria_id": 2,
  "descripcion": "Compra de comida actualizada",
  "monto": 55.00,
  "fecha": "2024-01-15T10:30:00Z"
}
```

### Eliminar transacción
```
DELETE /api/transacciones/:id
Authorization: Bearer <clerk_token>
```

**Valores válidos para `tipo`:**
- `"ingreso"`
- `"gasto"`

## Estructura de la Base de Datos

### Tabla transacciones
- `id`: INT (PK, AUTO_INCREMENT)
- `presupuesto_id`: INT (FK → presupuestos(id), NOT NULL)
- `tipo`: ENUM('ingreso', 'gasto')
- `categoria_id`: INT (FK → categorias(id), NULLABLE)
- `descripcion`: TEXT (NULLABLE)
- `monto`: DECIMAL(10,2) (NOT NULL)
- `fecha`: DATETIME (NOT NULL)
- `creado_en`: DATETIME (DEFAULT CURRENT_TIMESTAMP)

## Endpoints de Resumen de Ciclo de Presupuesto

Todos los endpoints requieren autenticación con un token Bearer de Clerk.

### Obtener todos los resúmenes de ciclo del usuario
```
GET /api/resumen-ciclo
Authorization: Bearer <clerk_token>
```

### Obtener estadísticas de ciclos
```
GET /api/resumen-ciclo/estadisticas?presupuesto_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer <clerk_token>
```

### Obtener resúmenes de ciclo por presupuesto
```
GET /api/resumen-ciclo/presupuesto/:presupuesto_id
Authorization: Bearer <clerk_token>
```

### Obtener resumen de ciclo específico
```
GET /api/resumen-ciclo/:id
Authorization: Bearer <clerk_token>
```

### Crear nuevo resumen de ciclo
```
POST /api/resumen-ciclo
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "presupuesto_id": 1,
  "fecha_cierre": "2024-01-31T23:59:59Z",
  "accion_sobrante": "agregar_al_siguiente",
  "monto_accion": 100.00
}
```

### Generar resumen de ciclo automático
```
POST /api/resumen-ciclo/automatico
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "presupuesto_id": 1,
  "fecha_cierre": "2024-01-31T23:59:59Z",
  "accion_sobrante": "enviar_a_ahorro",
  "monto_accion": 50.00
}
```

### Actualizar resumen de ciclo
```
PUT /api/resumen-ciclo/:id
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "fecha_cierre": "2024-01-31T23:59:59Z",
  "accion_sobrante": "ninguna",
  "monto_accion": 0.00
}
```

### Eliminar resumen de ciclo
```
DELETE /api/resumen-ciclo/:id
Authorization: Bearer <clerk_token>
```

**Valores válidos para `accion_sobrante`:**
- `"agregar_al_siguiente"`
- `"enviar_a_ahorro"`
- `"restar_al_siguiente"`
- `"ninguna"`

### Tabla resumen_ciclo_presupuesto
- `id`: INT (PK, AUTO_INCREMENT)
- `presupuesto_id`: INT (FK → presupuestos(id), NOT NULL)
- `fecha_cierre`: DATETIME (NOT NULL)
- `total_ingresos`: DECIMAL(10,2) (NOT NULL)
- `total_gastos`: DECIMAL(10,2) (NOT NULL)
- `saldo_final`: DECIMAL(10,2) (NOT NULL)
- `accion_sobrante`: ENUM('agregar_al_siguiente', 'enviar_a_ahorro', 'restar_al_siguiente', 'ninguna')
- `monto_accion`: DECIMAL(10,2) (NOT NULL DEFAULT 0)
- `creado_en`: DATETIME (DEFAULT CURRENT_TIMESTAMP)