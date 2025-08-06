import { pool } from "../db.js";
import { verificarPresupuestoEspecifico, obtenerFechaExpiracion, verificarProximaExpiracion, obtenerInformacionPeriodo, obtenerNombrePeriodo } from "../middleware/presupuestoStatus.js";

export const getPresupuestos = async (req, res) => {
  try {
    // Obtener presupuestos del usuario autenticado
    const [rows] = await pool.query(
      "SELECT * FROM presupuestos WHERE usuario_id = ? ORDER BY creado_en DESC",
      [req.user.dbUserId]
    );

    // Agregar información de expiración a cada presupuesto
    const presupuestosConInfo = rows.map(presupuesto => {
      const presupuestoInfo = { ...presupuesto };
      
      if (presupuesto.tipo === 'semanal' || presupuesto.tipo === 'mensual') {
        presupuestoInfo.fecha_expiracion = obtenerFechaExpiracion(presupuesto.tipo, presupuesto.creado_en);
        presupuestoInfo.proximo_a_expirar = verificarProximaExpiracion(presupuesto.tipo, presupuesto.creado_en);
        presupuestoInfo.informacion_periodo = obtenerInformacionPeriodo(presupuesto.tipo, presupuesto.creado_en);
        presupuestoInfo.nombre_periodo = obtenerNombrePeriodo(presupuesto.tipo, presupuesto.creado_en);
        
        // Verificar si debe archivarse automáticamente
        verificarPresupuestoEspecifico(presupuesto.id, req.user.dbUserId).then(archivado => {
          if (archivado) {
            presupuestoInfo.estado = 'archivado';
          }
        });
      }
      
      return presupuestoInfo;
    });

    res.json(presupuestosConInfo);
  } catch (error) {
    console.error('Error getting presupuestos:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getPresupuesto = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.user.dbUserId]
    );
    
    if (rows.length <= 0) {
      return res.status(404).json({
        message: "Presupuesto not found",
      });
    }

    const presupuesto = rows[0];
    const presupuestoInfo = { ...presupuesto };

    // Verificar si debe archivarse automáticamente
    const archivado = await verificarPresupuestoEspecifico(presupuesto.id, req.user.dbUserId);
    if (archivado) {
      presupuestoInfo.estado = 'archivado';
    }

    // Agregar información de expiración si es semanal o mensual
    if (presupuesto.tipo === 'semanal' || presupuesto.tipo === 'mensual') {
      presupuestoInfo.fecha_expiracion = obtenerFechaExpiracion(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.proximo_a_expirar = verificarProximaExpiracion(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.informacion_periodo = obtenerInformacionPeriodo(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.nombre_periodo = obtenerNombrePeriodo(presupuesto.tipo, presupuesto.creado_en);
    }

    res.json(presupuestoInfo);
  } catch (error) {
    console.error('Error getting presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createPresupuesto = async (req, res) => {
  const { nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado, estado } = req.body;
  
  // Validar que el tipo sea válido
  const tiposValidos = ['semanal', 'mensual', 'personalizado'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
    });
  }

  // Validar que el estado sea válido
  const estadosValidos = ['activo', 'archivado'];
  const estadoFinal = estado || 'activo';
  if (!estadosValidos.includes(estadoFinal)) {
    return res.status(400).json({
      message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(', ')}`
    });
  }
  
  try {
    // Si es_predeterminado es true, desactivar otros presupuestos predeterminados del usuario
    if (es_predeterminado) {
      await pool.query(
        "UPDATE presupuestos SET es_predeterminado = FALSE WHERE usuario_id = ?",
        [req.user.dbUserId]
      );
    }

    const [rows] = await pool.query(
      `INSERT INTO presupuestos 
       (usuario_id, nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.dbUserId, nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado || false, estadoFinal]
    );
    
    res.status(201).json({
      id: rows.insertId,
      usuario_id: req.user.dbUserId,
      nombre,
      descripcion,
      tipo,
      monto_inicial,
      saldo_disponible,
      es_predeterminado: es_predeterminado || false,
      estado: estadoFinal
    });
  } catch (error) {
    console.error('Error creating presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deletePresupuesto = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.user.dbUserId]
    );
    
    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Presupuesto not found",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updatePresupuesto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado, estado } = req.body;

  // Validar que el tipo sea válido si se proporciona
  if (tipo) {
    const tiposValidos = ['semanal', 'mensual', 'personalizado'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo inválido. Los tipos válidos son: ${tiposValidos.join(', ')}`
      });
    }
  }

  // Validar que el estado sea válido si se proporciona
  if (estado) {
    const estadosValidos = ['activo', 'archivado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(', ')}`
      });
    }
  }

  try {
    // Si es_predeterminado es true, desactivar otros presupuestos predeterminados del usuario
    if (es_predeterminado) {
      await pool.query(
        "UPDATE presupuestos SET es_predeterminado = FALSE WHERE usuario_id = ? AND id != ?",
        [req.user.dbUserId, id]
      );
    }

    const [result] = await pool.query(
      `UPDATE presupuestos 
       SET nombre = ?, descripcion = ?, tipo = ?, monto_inicial = ?, 
           saldo_disponible = ?, es_predeterminado = ?, estado = ?
       WHERE id = ? AND usuario_id = ?`,
      [nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado, estado, id, req.user.dbUserId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Presupuesto not found",
      });
    }
    
    const [rows] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [id, req.user.dbUserId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getPresupuestoPredeterminado = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM presupuestos WHERE usuario_id = ? AND es_predeterminado = TRUE LIMIT 1",
      [req.user.dbUserId]
    );
    
    if (rows.length <= 0) {
      return res.status(404).json({
        message: "No presupuesto predeterminado found",
      });
    }

    const presupuesto = rows[0];
    const presupuestoInfo = { ...presupuesto };

    // Verificar si debe archivarse automáticamente
    const archivado = await verificarPresupuestoEspecifico(presupuesto.id, req.user.dbUserId);
    if (archivado) {
      presupuestoInfo.estado = 'archivado';
    }

    // Agregar información de expiración si es semanal o mensual
    if (presupuesto.tipo === 'semanal' || presupuesto.tipo === 'mensual') {
      presupuestoInfo.fecha_expiracion = obtenerFechaExpiracion(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.proximo_a_expirar = verificarProximaExpiracion(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.informacion_periodo = obtenerInformacionPeriodo(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.nombre_periodo = obtenerNombrePeriodo(presupuesto.tipo, presupuesto.creado_en);
    }

    res.json(presupuestoInfo);
  } catch (error) {
    console.error('Error getting presupuesto predeterminado:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const renovarPresupuesto = async (req, res) => {
  const { id } = req.params;
  const { monto_inicial, saldo_disponible } = req.body;

  try {
    // Verificar que el presupuesto existe y pertenece al usuario
    const [presupuesto] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [id, req.user.dbUserId]
    );

    if (presupuesto.length === 0) {
      return res.status(404).json({
        message: "Presupuesto not found"
      });
    }

    const presupuestoData = presupuesto[0];

    // Solo permitir renovar presupuestos semanales y mensuales
    if (presupuestoData.tipo === 'personalizado') {
      return res.status(400).json({
        message: "No se puede renovar un presupuesto personalizado"
      });
    }

    // Verificar si el presupuesto está archivado o próximo a expirar
    const fechaExpiracion = obtenerFechaExpiracion(presupuestoData.tipo, presupuestoData.creado_en);
    const ahora = new Date();
    const haExpirado = ahora >= fechaExpiracion;

    if (!haExpirado && presupuestoData.estado === 'activo') {
      return res.status(400).json({
        message: "El presupuesto aún no ha expirado"
      });
    }

    // Crear un nuevo presupuesto basado en el anterior
    const nuevoMontoInicial = monto_inicial || presupuestoData.monto_inicial;
    const nuevoSaldoDisponible = saldo_disponible || nuevoMontoInicial;

    const [result] = await pool.query(
      `INSERT INTO presupuestos 
       (usuario_id, nombre, descripcion, tipo, monto_inicial, saldo_disponible, es_predeterminado, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.dbUserId,
        presupuestoData.nombre,
        presupuestoData.descripcion,
        presupuestoData.tipo,
        nuevoMontoInicial,
        nuevoSaldoDisponible,
        presupuestoData.es_predeterminado,
        'activo'
      ]
    );

    // Si el presupuesto original era predeterminado, mantener el nuevo como predeterminado
    if (presupuestoData.es_predeterminado) {
      await pool.query(
        "UPDATE presupuestos SET es_predeterminado = FALSE WHERE usuario_id = ? AND id != ?",
        [req.user.dbUserId, result.insertId]
      );
    }

    // Obtener el presupuesto renovado
    const [presupuestoRenovado] = await pool.query(
      "SELECT * FROM presupuestos WHERE id = ?",
      [result.insertId]
    );

    const presupuestoInfo = { ...presupuestoRenovado[0] };

    // Agregar información de expiración
    if (presupuestoData.tipo === 'semanal' || presupuestoData.tipo === 'mensual') {
      presupuestoInfo.fecha_expiracion = obtenerFechaExpiracion(presupuestoData.tipo, presupuestoInfo.creado_en);
      presupuestoInfo.proximo_a_expirar = verificarProximaExpiracion(presupuestoData.tipo, presupuestoInfo.creado_en);
      presupuestoInfo.informacion_periodo = obtenerInformacionPeriodo(presupuestoData.tipo, presupuestoInfo.creado_en);
      presupuestoInfo.nombre_periodo = obtenerNombrePeriodo(presupuestoData.tipo, presupuestoInfo.creado_en);
    }

    res.status(201).json({
      message: "Presupuesto renovado exitosamente",
      presupuesto: presupuestoInfo
    });
  } catch (error) {
    console.error('Error renovando presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getPresupuestosProximosAExpirar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM presupuestos WHERE usuario_id = ? AND estado = 'activo' AND tipo IN ('semanal', 'mensual')",
      [req.user.dbUserId]
    );

    const presupuestosProximos = rows.filter(presupuesto => {
      return verificarProximaExpiracion(presupuesto.tipo, presupuesto.creado_en, 3); // 3 días de anticipación
    }).map(presupuesto => {
      const presupuestoInfo = { ...presupuesto };
      presupuestoInfo.fecha_expiracion = obtenerFechaExpiracion(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.informacion_periodo = obtenerInformacionPeriodo(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.nombre_periodo = obtenerNombrePeriodo(presupuesto.tipo, presupuesto.creado_en);
      presupuestoInfo.dias_restantes = Math.ceil(
        (obtenerFechaExpiracion(presupuesto.tipo, presupuesto.creado_en).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
      );
      return presupuestoInfo;
    });

    res.json(presupuestosProximos);
  } catch (error) {
    console.error('Error getting presupuestos próximos a expirar:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
}; 