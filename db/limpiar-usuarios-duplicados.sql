-- Script para limpiar usuarios duplicados
USE gastosdb;

-- Mostrar usuarios duplicados antes de limpiar
SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM users 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Crear tabla temporal con los IDs a mantener (el más antiguo de cada nombre)
CREATE TEMPORARY TABLE users_to_keep AS
SELECT MIN(id) as id_to_keep
FROM users 
GROUP BY name;

-- Mostrar qué usuarios se van a mantener
SELECT u.* 
FROM users u 
INNER JOIN users_to_keep utk ON u.id = utk.id_to_keep
ORDER BY u.name;

-- Eliminar usuarios duplicados (mantener solo el más antiguo de cada nombre)
DELETE u FROM users u
WHERE u.id NOT IN (SELECT id_to_keep FROM users_to_keep);

-- Verificar que no hay duplicados después de la limpieza
SELECT name, COUNT(*) as count
FROM users 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Mostrar usuarios finales
SELECT * FROM users ORDER BY name;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE users_to_keep; 