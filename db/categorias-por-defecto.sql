-- Script para insertar categorías por defecto (globales)
-- Estas categorías estarán disponibles para todos los usuarios

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

-- Verificar que se insertaron correctamente
SELECT * FROM categorias WHERE usuario_id IS NULL ORDER BY tipo, nombre; 