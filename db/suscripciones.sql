-- Script para crear la tabla de suscripciones
USE gastosdb;

-- Tabla de suscripciones
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

-- Tabla de eventos de webhook para auditoría
CREATE TABLE webhook_events (
    id INT NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(100) NOT NULL,
    clerk_user_id VARCHAR(255),
    plan_id VARCHAR(255),
    event_data JSON,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_suscripciones_user_id ON suscripciones(clerk_user_id);
CREATE INDEX idx_suscripciones_status ON suscripciones(status);
CREATE INDEX idx_suscripciones_plan_key ON suscripciones(plan_key);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_user ON webhook_events(clerk_user_id);

-- Verificar la estructura
DESCRIBE suscripciones;
DESCRIBE webhook_events; 