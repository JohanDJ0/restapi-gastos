-- Script para actualizar las categorías existentes
-- Primero eliminar las categorías globales que ya no queremos

-- Eliminar categorías que ya no están en la lista simplificada
DELETE FROM categorias WHERE usuario_id IS NULL AND nombre IN (
  'Freelance',
  'Inversiones', 
  'Salud',
  'Educación',
  'Ropa',
  'Tecnología',
  'Viajes',
  'Deportes',
  'Mascotas'
);

-- Actualizar los iconos de las categorías que quedan
UPDATE categorias SET icono = '💰' WHERE nombre = 'Salario' AND usuario_id IS NULL;
UPDATE categorias SET icono = '🎁' WHERE nombre = 'Regalos' AND usuario_id IS NULL;
UPDATE categorias SET icono = '↩️' WHERE nombre = 'Reembolsos' AND usuario_id IS NULL;
UPDATE categorias SET icono = '➕' WHERE nombre = 'Otros Ingresos' AND usuario_id IS NULL;

UPDATE categorias SET icono = '🍽️' WHERE nombre = 'Alimentación' AND usuario_id IS NULL;
UPDATE categorias SET icono = '🚗' WHERE nombre = 'Transporte' AND usuario_id IS NULL;
UPDATE categorias SET icono = '🏠' WHERE nombre = 'Vivienda' AND usuario_id IS NULL;
UPDATE categorias SET icono = '⚡' WHERE nombre = 'Servicios' AND usuario_id IS NULL;
UPDATE categorias SET icono = '🎬' WHERE nombre = 'Entretenimiento' AND usuario_id IS NULL;
UPDATE categorias SET icono = '💸' WHERE nombre = 'Otros Gastos' AND usuario_id IS NULL;

-- Verificar el resultado
SELECT * FROM categorias WHERE usuario_id IS NULL ORDER BY tipo, nombre; 