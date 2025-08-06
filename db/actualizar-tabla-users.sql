-- Script para actualizar la tabla users existente
USE gastosdb;

-- Agregar el campo rol a la tabla users
ALTER TABLE users ADD COLUMN rol ENUM('free', 'premium') DEFAULT 'free' AFTER name;

-- Actualizar usuarios existentes para que tengan rol 'free' por defecto
UPDATE users SET rol = 'free' WHERE rol IS NULL;

-- Verificar la estructura actualizada
DESCRIBE users;

-- Mostrar los usuarios actualizados
SELECT * FROM users; 