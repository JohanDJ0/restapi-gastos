import { pool } from "../db.js";

export const getTransacciones = async (req, res) => {
  try {
    // Obtener transacciones del usuario autenticado
    const [rows] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE p.usuario_id = ?
       ORDER BY t.fecha DESC, t.creado_en DESC`,
      [req.user.dbUserId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting transacciones:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getTransaccion = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.user.dbUserId]
    );
    
    if (rows.length <= 0) {
      return res.status(404).json({
        message: "Transaccion not found",
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting transaccion:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createTransaccion = async (req, res) => {
  const { presupuesto_id, tipo, categoria_id, descripcion, monto, fecha } = req.body;
  
  // Validar que el tipo sea válido
  const tiposValidos = ['ingreso', 'gasto'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
    });
  }

  // Validar que el monto sea positivo
  if (!monto || parseFloat(monto) <= 0) {
    return res.status(400).json({
      message: "El monto debe ser mayor a 0"
    });
  }

  // Validar que la fecha sea válida
  const fechaTransaccion = fecha ? new Date(fecha) : new Date();
  if (isNaN(fechaTransaccion.getTime())) {
    return res.status(400).json({
      message: "Fecha inválida"
    });
  }
  
  try {
    // Verificar que el presupuesto pertenece al usuario
    const [presupuesto] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [presupuesto_id, req.user.dbUserId]
    );

    if (presupuesto.length === 0) {
      return res.status(404).json({
        message: "Presupuesto not found"
      });
    }

    // Verificar que la categoría existe si se proporciona
    if (categoria_id) {
      const [categoria] = await pool.query(
        "SELECT * FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)",
        [categoria_id, req.user.dbUserId]
      );

      if (categoria.length === 0) {
        return res.status(404).json({
          message: "Categoria not found"
        });
      }
    }

    // Crear la transacción
    const [result] = await pool.query(
      `INSERT INTO transacciones 
       (presupuesto_id, tipo, categoria_id, descripcion, monto, fecha) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [presupuesto_id, tipo, categoria_id || null, descripcion || null, monto, fechaTransaccion]
    );

    // Actualizar el saldo del presupuesto
    const montoAjuste = tipo === 'ingreso' ? parseFloat(monto) : -parseFloat(monto);
    await pool.query(
      "UPDATE presupuestos SET saldo_disponible = saldo_disponible + ? WHERE id = ?",
      [montoAjuste, presupuesto_id]
    );
    
    // Obtener la transacción creada con información adicional
    const [transaccionCreada] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(transaccionCreada[0]);
  } catch (error) {
    console.error('Error creating transaccion:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updateTransaccion = async (req, res) => {
  const { id } = req.params;
  const { presupuesto_id, tipo, categoria_id, descripcion, monto, fecha } = req.body;

  // Validar que el tipo sea válido si se proporciona
  if (tipo) {
    const tiposValidos = ['ingreso', 'gasto'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
      });
    }
  }

  // Validar que el monto sea positivo si se proporciona
  if (monto && parseFloat(monto) <= 0) {
    return res.status(400).json({
      message: "El monto debe ser mayor a 0"
    });
  }

  try {
    // Verificar que la transacción existe y pertenece al usuario
    const [transaccionExistente] = await pool.query(
      `SELECT t.*, p.usuario_id 
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       WHERE t.id = ? AND p.usuario_id = ?`,
      [id, req.user.dbUserId]
    );

    if (transaccionExistente.length === 0) {
      return res.status(404).json({
        message: "Transaccion not found"
      });
    }

    const transaccion = transaccionExistente[0];

    // Si se está cambiando el presupuesto, verificar que el nuevo presupuesto pertenece al usuario
    if (presupuesto_id && presupuesto_id !== transaccion.presupuesto_id) {
      const [nuevoPresupuesto] = await pool.query(
        "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
        [presupuesto_id, req.user.dbUserId]
      );

      if (nuevoPresupuesto.length === 0) {
        return res.status(404).json({
          message: "Presupuesto not found"
        });
      }
    }

    // Si se está cambiando la categoría, verificar que existe
    if (categoria_id && categoria_id !== transaccion.categoria_id) {
      const [categoria] = await pool.query(
        "SELECT * FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)",
        [categoria_id, req.user.dbUserId]
      );

      if (categoria.length === 0) {
        return res.status(404).json({
          message: "Categoria not found"
        });
      }
    }

    // Revertir el saldo anterior
    const montoAnterior = transaccion.tipo === 'ingreso' ? -parseFloat(transaccion.monto) : parseFloat(transaccion.monto);
    await pool.query(
      "UPDATE presupuestos SET saldo_disponible = saldo_disponible + ? WHERE id = ?",
      [montoAnterior, transaccion.presupuesto_id]
    );

    // Actualizar la transacción
    const [result] = await pool.query(
      `UPDATE transacciones 
       SET presupuesto_id = ?, tipo = ?, categoria_id = ?, descripcion = ?, monto = ?, fecha = ?
       WHERE id = ?`,
      [
        presupuesto_id || transaccion.presupuesto_id,
        tipo || transaccion.tipo,
        categoria_id !== undefined ? categoria_id : transaccion.categoria_id,
        descripcion !== undefined ? descripcion : transaccion.descripcion,
        monto || transaccion.monto,
        fecha ? new Date(fecha) : transaccion.fecha,
        id
      ]
    );

    // Aplicar el nuevo saldo
    const nuevoMonto = monto || transaccion.monto;
    const nuevoTipo = tipo || transaccion.tipo;
    const nuevoPresupuestoId = presupuesto_id || transaccion.presupuesto_id;
    const montoAjuste = nuevoTipo === 'ingreso' ? parseFloat(nuevoMonto) : -parseFloat(nuevoMonto);
    
    await pool.query(
      "UPDATE presupuestos SET saldo_disponible = saldo_disponible + ? WHERE id = ?",
      [montoAjuste, nuevoPresupuestoId]
    );

    // Obtener la transacción actualizada
    const [transaccionActualizada] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    res.json(transaccionActualizada[0]);
  } catch (error) {
    console.error('Error updating transaccion:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deleteTransaccion = async (req, res) => {
  try {
    // Verificar que la transacción existe y pertenece al usuario
    const [transaccion] = await pool.query(
      `SELECT t.*, p.usuario_id 
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       WHERE t.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.user.dbUserId]
    );

    if (transaccion.length === 0) {
      return res.status(404).json({
        message: "Transaccion not found",
      });
    }

    // Revertir el saldo del presupuesto
    const montoAjuste = transaccion[0].tipo === 'ingreso' ? -parseFloat(transaccion[0].monto) : parseFloat(transaccion[0].monto);
    await pool.query(
      "UPDATE presupuestos SET saldo_disponible = saldo_disponible + ? WHERE id = ?",
      [montoAjuste, transaccion[0].presupuesto_id]
    );

    // Eliminar la transacción
    const [result] = await pool.query(
      "DELETE FROM transacciones WHERE id = ?",
      [req.params.id]
    );
    
    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Transaccion not found",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting transaccion:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getTransaccionesPorPresupuesto = async (req, res) => {
  try {
    const { presupuesto_id } = req.params;
    
    // Verificar que el presupuesto pertenece al usuario
    const [presupuesto] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [presupuesto_id, req.user.dbUserId]
    );

    if (presupuesto.length === 0) {
      return res.status(404).json({
        message: "Presupuesto not found"
      });
    }

    const [rows] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.presupuesto_id = ? AND p.usuario_id = ?
       ORDER BY t.fecha DESC, t.creado_en DESC`,
      [presupuesto_id, req.user.dbUserId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting transacciones por presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getTransaccionesPorCategoria = async (req, res) => {
  try {
    const { categoria_id } = req.params;
    
    // Verificar que la categoría existe y es accesible para el usuario
    const [categoria] = await pool.query(
      "SELECT * FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)",
      [categoria_id, req.user.dbUserId]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        message: "Categoria not found"
      });
    }

    const [rows] = await pool.query(
      `SELECT t.*, p.nombre as presupuesto_nombre, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.categoria_id = ? AND p.usuario_id = ?
       ORDER BY t.fecha DESC, t.creado_en DESC`,
      [categoria_id, req.user.dbUserId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting transacciones por categoria:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getResumenTransacciones = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let whereClause = "WHERE p.usuario_id = ?";
    let params = [req.user.dbUserId];

    if (fecha_inicio && fecha_fin) {
      whereClause += " AND t.fecha BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    }

    // Obtener resumen de ingresos y gastos
    const [resumen] = await pool.query(
      `SELECT 
         SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END) as total_ingresos,
         SUM(CASE WHEN t.tipo = 'gasto' THEN t.monto ELSE 0 END) as total_gastos,
         COUNT(*) as total_transacciones
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       ${whereClause}`,
      params
    );

    // Obtener transacciones por categoría
    const [porCategoria] = await pool.query(
      `SELECT 
         c.nombre as categoria_nombre,
         c.icono as categoria_icono,
         c.color as categoria_color,
         t.tipo,
         SUM(t.monto) as total
       FROM transacciones t
       INNER JOIN presupuestos p ON t.presupuesto_id = p.id
       LEFT JOIN categorias c ON t.categoria_id = c.id
       ${whereClause}
       GROUP BY c.id, t.tipo
       ORDER BY total DESC`,
      params
    );

    res.json({
      resumen: resumen[0],
      por_categoria: porCategoria
    });
  } catch (error) {
    console.error('Error getting resumen transacciones:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
}; 