-- Script completo para configurar la base de datos en producción
-- Ejecutar este script en tu base de datos de producción

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gastosdb;
USE gastosdb;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) DEFAULT NULL,
    rol ENUM('free', 'premium') DEFAULT 'free',
    PRIMARY KEY (id)
);

-- Tabla de mapeo de usuarios de Clerk
CREATE TABLE IF NOT EXISTS clerk_users (
    id INT NOT NULL AUTO_INCREMENT,
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo ENUM('semanal', 'mensual', 'personalizado') NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    saldo_disponible DECIMAL(10,2) NOT NULL,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    estado ENUM('activo', 'archivado') DEFAULT 'activo',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('gasto', 'ingreso') NOT NULL,
    icono VARCHAR(50),
    color VARCHAR(7) DEFAULT '#000000',
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    presupuesto_id INT NOT NULL,
    categoria_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    tipo ENUM('gasto', 'ingreso') NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Tabla de resumen de ciclo de presupuesto
CREATE TABLE IF NOT EXISTS resumen_ciclo_presupuesto (
    id INT NOT NULL AUTO_INCREMENT,
    presupuesto_id INT NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    total_gastos DECIMAL(10,2) DEFAULT 0,
    total_ingresos DECIMAL(10,2) DEFAULT 0,
    saldo_final DECIMAL(10,2) NOT NULL,
    porcentaje_utilizado DECIMAL(5,2) DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
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

-- Tabla de eventos de webhook para auditoría
CREATE TABLE IF NOT EXISTS webhook_events (
    id INT NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(100) NOT NULL,
    clerk_user_id VARCHAR(255),
    plan_id VARCHAR(255),
    event_data JSON,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id ON suscripciones(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_status ON suscripciones(status);
CREATE INDEX IF NOT EXISTS idx_suscripciones_plan_key ON suscripciones(plan_key);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user ON webhook_events(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_usuario ON presupuestos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);

-- Insertar categorías por defecto (opcional)
INSERT IGNORE INTO categorias (usuario_id, nombre, tipo, icono, color, es_predeterminada) VALUES
(1, 'Comida', 'gasto', '🍽️', '#FF6B6B', true),
(1, 'Transporte', 'gasto', '🚗', '#4ECDC4', true),
(1, 'Entretenimiento', 'gasto', '🎮', '#45B7D1', true),
(1, 'Salud', 'gasto', '🏥', '#96CEB4', true),
(1, 'Educación', 'gasto', '📚', '#FFEAA7', true),
(1, 'Vivienda', 'gasto', '🏠', '#DDA0DD', true),
(1, 'Salario', 'ingreso', '💰', '#32CD32', true),
(1, 'Freelance', 'ingreso', '💼', '#FFD700', true),
(1, 'Inversiones', 'ingreso', '📈', '#00CED1', true);

-- Verificar la estructura
SHOW TABLES;

-- Mostrar información de las tablas principales
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'clerk_users', COUNT(*) FROM clerk_users
UNION ALL
SELECT 'presupuestos', COUNT(*) FROM presupuestos
UNION ALL
SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL
SELECT 'transacciones', COUNT(*) FROM transacciones
UNION ALL
SELECT 'suscripciones', COUNT(*) FROM suscripciones
UNION ALL
SELECT 'webhook_events', COUNT(*) FROM webhook_events;

-- Mensaje de confirmación
SELECT 'Base de datos configurada correctamente para producción!' as status; 