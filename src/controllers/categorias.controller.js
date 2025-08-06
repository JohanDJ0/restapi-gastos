import { pool } from "../db.js";

// Función para crear categorías por defecto
const crearCategoriasPorDefecto = async () => {
  const categoriasPorDefecto = [
    // Categorías de Ingresos
    { nombre: 'Salario', tipo: 'ingreso', icono: '💰', color: '#28a745' },
    { nombre: 'Regalos', tipo: 'ingreso', icono: '🎁', color: '#e83e8c' },
    { nombre: 'Reembolsos', tipo: 'ingreso', icono: '↩️', color: '#6f42c1' },
    { nombre: 'Otros Ingresos', tipo: 'ingreso', icono: '➕', color: '#20c997' },
    
    // Categorías de Gastos
    { nombre: 'Alimentación', tipo: 'gasto', icono: '🍽️', color: '#dc3545' },
    { nombre: 'Transporte', tipo: 'gasto', icono: '🚗', color: '#fd7e14' },
    { nombre: 'Vivienda', tipo: 'gasto', icono: '🏠', color: '#6f42c1' },
    { nombre: 'Servicios', tipo: 'gasto', icono: '⚡', color: '#ffc107' },
    { nombre: 'Entretenimiento', tipo: 'gasto', icono: '🎬', color: '#e83e8c' },
    { nombre: 'Otros Gastos', tipo: 'gasto', icono: '💸', color: '#dc3545' }
  ];

  try {
    for (const categoria of categoriasPorDefecto) {
      await pool.query(
        `INSERT INTO categorias (usuario_id, nombre, tipo, icono, color) 
         VALUES (NULL, ?, ?, ?, ?)`,
        [categoria.nombre, categoria.tipo, categoria.icono, categoria.color]
      );
    }
    console.log('✅ Categorías por defecto creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando categorías por defecto:', error);
  }
};

export const getCategorias = async (req, res) => {
  try {
    // Obtener categorías del usuario autenticado y categorías globales (usuario_id = NULL)
    const [rows] = await pool.query(
      `SELECT * FROM categorias 
       WHERE usuario_id = ? OR usuario_id IS NULL 
       ORDER BY usuario_id ASC, nombre ASC`,
      [req.user.dbUserId]
    );
    
    // Si no hay categorías globales, crearlas automáticamente
    const categoriasGlobales = rows.filter(cat => cat.usuario_id === null);
    if (categoriasGlobales.length === 0) {
      await crearCategoriasPorDefecto();
      // Obtener las categorías nuevamente después de crear las por defecto
      const [newRows] = await pool.query(
        `SELECT * FROM categorias 
         WHERE usuario_id = ? OR usuario_id IS NULL 
         ORDER BY usuario_id ASC, nombre ASC`,
        [req.user.dbUserId]
      );
      return res.json(newRows);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting categorias:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getCategoria = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)",
      [req.params.id, req.user.dbUserId]
    );
    
    if (rows.length <= 0) {
      return res.status(404).json({
        message: "Categoria not found",
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting categoria:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createCategoria = async (req, res) => {
  const { nombre, tipo, icono, color } = req.body;
  
  // Validar que el tipo sea válido
  const tiposValidos = ['ingreso', 'gasto'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
    });
  }

  // Validar que el nombre no esté vacío
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      message: "El nombre de la categoría es requerido"
    });
  }
  
  try {
    // Verificar si ya existe una categoría con el mismo nombre para este usuario
    const [existingCategoria] = await pool.query(
      "SELECT * FROM categorias WHERE nombre = ? AND usuario_id = ?",
      [nombre.trim(), req.user.dbUserId]
    );

    if (existingCategoria.length > 0) {
      return res.status(400).json({
        message: "Ya existe una categoría con este nombre"
      });
    }

    const [rows] = await pool.query(
      `INSERT INTO categorias 
       (usuario_id, nombre, tipo, icono, color) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.dbUserId, nombre.trim(), tipo, icono || null, color || null]
    );
    
    res.status(201).json({
      id: rows.insertId,
      usuario_id: req.user.dbUserId,
      nombre: nombre.trim(),
      tipo,
      icono: icono || null,
      color: color || null
    });
  } catch (error) {
    console.error('Error creating categoria:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deleteCategoria = async (req, res) => {
  try {
    // Solo permitir eliminar categorías propias del usuario (no las globales)
    const [result] = await pool.query(
      "DELETE FROM categorias WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.user.dbUserId]
    );
    
    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Categoria not found or cannot be deleted",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting categoria:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, icono, color } = req.body;

  // Validar que el tipo sea válido si se proporciona
  if (tipo) {
    const tiposValidos = ['ingreso', 'gasto'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
      });
    }
  }

  // Validar que el nombre no esté vacío si se proporciona
  if (nombre && nombre.trim() === '') {
    return res.status(400).json({
      message: "El nombre de la categoría no puede estar vacío"
    });
  }

  try {
    // Solo permitir actualizar categorías propias del usuario (no las globales)
    const [existingCategoria] = await pool.query(
      "SELECT * FROM categorias WHERE id = ? AND usuario_id = ?",
      [id, req.user.dbUserId]
    );

    if (existingCategoria.length === 0) {
      return res.status(404).json({
        message: "Categoria not found or cannot be updated",
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (nombre && nombre.trim() !== existingCategoria[0].nombre) {
      const [duplicateCategoria] = await pool.query(
        "SELECT * FROM categorias WHERE nombre = ? AND usuario_id = ? AND id != ?",
        [nombre.trim(), req.user.dbUserId, id]
      );

      if (duplicateCategoria.length > 0) {
        return res.status(400).json({
          message: "Ya existe una categoría con este nombre"
        });
      }
    }

    const [result] = await pool.query(
      `UPDATE categorias 
       SET nombre = ?, tipo = ?, icono = ?, color = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        nombre ? nombre.trim() : existingCategoria[0].nombre,
        tipo || existingCategoria[0].tipo,
        icono !== undefined ? icono : existingCategoria[0].icono,
        color !== undefined ? color : existingCategoria[0].color,
        id,
        req.user.dbUserId
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Categoria not found",
      });
    }
    
    const [rows] = await pool.query(
      "SELECT * FROM categorias WHERE id = ? AND usuario_id = ?",
      [id, req.user.dbUserId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating categoria:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getCategoriasPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    // Validar que el tipo sea válido
    const tiposValidos = ['ingreso', 'gasto'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM categorias 
       WHERE tipo = ? AND (usuario_id = ? OR usuario_id IS NULL)
       ORDER BY usuario_id ASC, nombre ASC`,
      [tipo, req.user.dbUserId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting categorias por tipo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

// Función para crear categorías por defecto para un usuario específico
export const crearCategoriasUsuario = async (req, res) => {
  try {
    // Verificar si el usuario ya tiene categorías personalizadas
    const [existingCategorias] = await pool.query(
      "SELECT COUNT(*) as count FROM categorias WHERE usuario_id = ?",
      [req.user.dbUserId]
    );

    if (existingCategorias[0].count > 0) {
      return res.status(400).json({
        message: "El usuario ya tiene categorías personalizadas"
      });
    }

    const categoriasUsuario = [
      // Categorías de Ingresos personalizadas
      { nombre: 'Mi Salario', tipo: 'ingreso', icono: '💰', color: '#28a745' },
      { nombre: 'Proyectos', tipo: 'ingreso', icono: '💼', color: '#17a2b8' },
      
      // Categorías de Gastos personalizadas
      { nombre: 'Comida', tipo: 'gasto', icono: '🍽️', color: '#dc3545' },
      { nombre: 'Gasolina', tipo: 'gasto', icono: '⛽', color: '#fd7e14' },
      { nombre: 'Renta', tipo: 'gasto', icono: '🏠', color: '#6f42c1' }
    ];

    for (const categoria of categoriasUsuario) {
      await pool.query(
        `INSERT INTO categorias (usuario_id, nombre, tipo, icono, color) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.dbUserId, categoria.nombre, categoria.tipo, categoria.icono, categoria.color]
      );
    }

    // Obtener todas las categorías del usuario (incluyendo globales)
    const [allCategorias] = await pool.query(
      `SELECT * FROM categorias 
       WHERE usuario_id = ? OR usuario_id IS NULL 
       ORDER BY usuario_id ASC, nombre ASC`,
      [req.user.dbUserId]
    );

    res.status(201).json({
      message: "Categorías por defecto creadas exitosamente",
      categorias: allCategorias
    });
  } catch (error) {
    console.error('Error creating user categories:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
}; 