-- Script para eliminar todas las categorías y recrearlas desde cero
-- ⚠️ ADVERTENCIA: Esto eliminará TODAS las categorías existentes

-- Eliminar todas las categorías
DELETE FROM categorias;

-- Resetear el auto-increment
ALTER TABLE categorias AUTO_INCREMENT = 1;

-- Insertar las nuevas categorías simplificadas
-- Categorías de Ingresos
INSERT INTO categorias (usuario_id, nombre, tipo, icono, color) VALUES
(NULL, 'Salario', 'ingreso', '💰', '#28a745'),
(NULL, 'Regalos', 'ingreso', '🎁', '#e83e8c'),
(NULL, 'Reembolsos', 'ingreso', '↩️', '#6f42c1'),
(NULL, 'Otros Ingresos', 'ingreso', '➕', '#20c997');

-- Categorías de Gastos
INSERT INTO categorias (usuario_id, nombre, tipo, icono, color) VALUES
(NULL, 'Alimentación', 'gasto', '🍽️', '#dc3545'),
(NULL, 'Transporte', 'gasto', '🚗', '#fd7e14'),
(NULL, 'Vivienda', 'gasto', '🏠', '#6f42c1'),
(NULL, 'Servicios', 'gasto', '⚡', '#ffc107'),
(NULL, 'Entretenimiento', 'gasto', '🎬', '#e83e8c'),
(NULL, 'Otros Gastos', 'gasto', '💸', '#dc3545');

-- Verificar el resultado
SELECT * FROM categorias ORDER BY tipo, nombre; 