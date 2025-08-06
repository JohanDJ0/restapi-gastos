import { pool } from "../db.js";

export const getResumenesCiclo = async (req, res) => {
  try {
    // Obtener resúmenes de ciclo del usuario autenticado
    const [rows] = await pool.query(
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE p.usuario_id = ?
       ORDER BY r.fecha_cierre DESC, r.creado_en DESC`,
      [req.user.dbUserId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting resumenes ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getResumenCiclo = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.user.dbUserId]
    );
    
    if (rows.length <= 0) {
      return res.status(404).json({
        message: "Resumen ciclo not found",
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting resumen ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getResumenesCicloPorPresupuesto = async (req, res) => {
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
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.presupuesto_id = ? AND p.usuario_id = ?
       ORDER BY r.fecha_cierre DESC, r.creado_en DESC`,
      [presupuesto_id, req.user.dbUserId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting resumenes ciclo por presupuesto:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createResumenCiclo = async (req, res) => {
  const { presupuesto_id, fecha_cierre, accion_sobrante, monto_accion } = req.body;
  
  // Validar que la acción sobrante sea válida
  const accionesValidas = ['agregar_al_siguiente', 'enviar_a_ahorro', 'restar_al_siguiente', 'ninguna'];
  if (!accionesValidas.includes(accion_sobrante)) {
    return res.status(400).json({
      message: `Acción sobrante inválida. Las acciones válidas son: ${accionesValidas.join(', ')}`
    });
  }

  // Validar que la fecha de cierre sea válida
  const fechaCierre = fecha_cierre ? new Date(fecha_cierre) : new Date();
  if (isNaN(fechaCierre.getTime())) {
    return res.status(400).json({
      message: "Fecha de cierre inválida"
    });
  }

  // Validar que el monto de acción sea válido
  const montoAccion = monto_accion || 0;
  if (montoAccion < 0) {
    return res.status(400).json({
      message: "El monto de acción no puede ser negativo"
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

    // Calcular totales de ingresos y gastos del ciclo
    const [totales] = await pool.query(
      `SELECT 
         SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
         SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos
       FROM transacciones 
       WHERE presupuesto_id = ? AND fecha <= ?`,
      [presupuesto_id, fechaCierre]
    );

    const totalIngresos = parseFloat(totales[0].total_ingresos || 0);
    const totalGastos = parseFloat(totales[0].total_gastos || 0);
    const saldoFinal = totalIngresos - totalGastos;

    // Crear el resumen de ciclo
    const [result] = await pool.query(
      `INSERT INTO resumen_ciclo_presupuesto 
       (presupuesto_id, fecha_cierre, total_ingresos, total_gastos, saldo_final, accion_sobrante, monto_accion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [presupuesto_id, fechaCierre, totalIngresos, totalGastos, saldoFinal, accion_sobrante, montoAccion]
    );
    
    // Obtener el resumen creado con información adicional
    const [resumenCreado] = await pool.query(
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(resumenCreado[0]);
  } catch (error) {
    console.error('Error creating resumen ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updateResumenCiclo = async (req, res) => {
  const { id } = req.params;
  const { fecha_cierre, accion_sobrante, monto_accion } = req.body;

  // Validar que la acción sobrante sea válida si se proporciona
  if (accion_sobrante) {
    const accionesValidas = ['agregar_al_siguiente', 'enviar_a_ahorro', 'restar_al_siguiente', 'ninguna'];
    if (!accionesValidas.includes(accion_sobrante)) {
      return res.status(400).json({
        message: `Acción sobrante inválida. Las acciones válidas son: ${accionesValidas.join(', ')}`
      });
    }
  }

  // Validar que el monto de acción sea válido si se proporciona
  if (monto_accion !== undefined && monto_accion < 0) {
    return res.status(400).json({
      message: "El monto de acción no puede ser negativo"
    });
  }

  try {
    // Verificar que el resumen existe y pertenece al usuario
    const [resumenExistente] = await pool.query(
      `SELECT r.*, p.usuario_id 
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ? AND p.usuario_id = ?`,
      [id, req.user.dbUserId]
    );

    if (resumenExistente.length === 0) {
      return res.status(404).json({
        message: "Resumen ciclo not found"
      });
    }

    const resumen = resumenExistente[0];

    // Si se está cambiando la fecha de cierre, recalcular los totales
    let totalIngresos = resumen.total_ingresos;
    let totalGastos = resumen.total_gastos;
    let saldoFinal = resumen.saldo_final;

    if (fecha_cierre && new Date(fecha_cierre).getTime() !== new Date(resumen.fecha_cierre).getTime()) {
      const fechaCierre = new Date(fecha_cierre);
      if (isNaN(fechaCierre.getTime())) {
        return res.status(400).json({
          message: "Fecha de cierre inválida"
        });
      }

      // Recalcular totales con la nueva fecha
      const [totales] = await pool.query(
        `SELECT 
           SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
           SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos
         FROM transacciones 
         WHERE presupuesto_id = ? AND fecha <= ?`,
        [resumen.presupuesto_id, fechaCierre]
      );

      totalIngresos = parseFloat(totales[0].total_ingresos || 0);
      totalGastos = parseFloat(totales[0].total_gastos || 0);
      saldoFinal = totalIngresos - totalGastos;
    }

    // Actualizar el resumen
    const [result] = await pool.query(
      `UPDATE resumen_ciclo_presupuesto 
       SET fecha_cierre = ?, total_ingresos = ?, total_gastos = ?, saldo_final = ?, accion_sobrante = ?, monto_accion = ?
       WHERE id = ?`,
      [
        fecha_cierre || resumen.fecha_cierre,
        totalIngresos,
        totalGastos,
        saldoFinal,
        accion_sobrante || resumen.accion_sobrante,
        monto_accion !== undefined ? monto_accion : resumen.monto_accion,
        id
      ]
    );

    // Obtener el resumen actualizado
    const [resumenActualizado] = await pool.query(
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ?`,
      [id]
    );

    res.json(resumenActualizado[0]);
  } catch (error) {
    console.error('Error updating resumen ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deleteResumenCiclo = async (req, res) => {
  try {
    // Verificar que el resumen existe y pertenece al usuario
    const [resumen] = await pool.query(
      `SELECT r.*, p.usuario_id 
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.user.dbUserId]
    );

    if (resumen.length === 0) {
      return res.status(404).json({
        message: "Resumen ciclo not found",
      });
    }

    // Eliminar el resumen
    const [result] = await pool.query(
      "DELETE FROM resumen_ciclo_presupuesto WHERE id = ?",
      [req.params.id]
    );
    
    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Resumen ciclo not found",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting resumen ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const generarResumenCicloAutomatico = async (req, res) => {
  const { presupuesto_id, fecha_cierre, accion_sobrante, monto_accion } = req.body;
  
  // Validar que la acción sobrante sea válida
  const accionesValidas = ['agregar_al_siguiente', 'enviar_a_ahorro', 'restar_al_siguiente', 'ninguna'];
  if (!accionesValidas.includes(accion_sobrante)) {
    return res.status(400).json({
      message: `Acción sobrante inválida. Las acciones válidas son: ${accionesValidas.join(', ')}`
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

    const presupuestoData = presupuesto[0];
    const fechaCierre = fecha_cierre ? new Date(fecha_cierre) : new Date();

    // Determinar el período del ciclo basado en el tipo de presupuesto
    let fechaInicio;
    const ahora = new Date();
    
    switch (presupuestoData.tipo) {
      case 'semanal':
        // Obtener el inicio de la semana actual
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        fechaInicio = inicioSemana;
        break;
      case 'mensual':
        // Obtener el inicio del mes actual
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'personalizado':
        // Para personalizado, usar el último resumen o fecha de creación del presupuesto
        const [ultimoResumen] = await pool.query(
          "SELECT fecha_cierre FROM resumen_ciclo_presupuesto WHERE presupuesto_id = ? ORDER BY fecha_cierre DESC LIMIT 1",
          [presupuesto_id]
        );
        fechaInicio = ultimoResumen.length > 0 ? new Date(ultimoResumen[0].fecha_cierre) : new Date(presupuestoData.creado_en);
        break;
      default:
        fechaInicio = new Date(presupuestoData.creado_en);
    }

    // Calcular totales del ciclo
    const [totales] = await pool.query(
      `SELECT 
         SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
         SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos
       FROM transacciones 
       WHERE presupuesto_id = ? AND fecha BETWEEN ? AND ?`,
      [presupuesto_id, fechaInicio, fechaCierre]
    );

    const totalIngresos = parseFloat(totales[0].total_ingresos || 0);
    const totalGastos = parseFloat(totales[0].total_gastos || 0);
    const saldoFinal = totalIngresos - totalGastos;
    const montoAccion = monto_accion || 0;

    // Crear el resumen de ciclo
    const [result] = await pool.query(
      `INSERT INTO resumen_ciclo_presupuesto 
       (presupuesto_id, fecha_cierre, total_ingresos, total_gastos, saldo_final, accion_sobrante, monto_accion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [presupuesto_id, fechaCierre, totalIngresos, totalGastos, saldoFinal, accion_sobrante, montoAccion]
    );
    
    // Obtener el resumen creado con información adicional
    const [resumenCreado] = await pool.query(
      `SELECT r.*, p.nombre as presupuesto_nombre, p.tipo as presupuesto_tipo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      ...resumenCreado[0],
      fecha_inicio: fechaInicio,
      periodo_ciclo: {
        inicio: fechaInicio,
        fin: fechaCierre
      }
    });
  } catch (error) {
    console.error('Error generating automatic resumen ciclo:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getEstadisticasCiclos = async (req, res) => {
  try {
    const { presupuesto_id, fecha_inicio, fecha_fin } = req.query;
    
    let whereClause = "WHERE p.usuario_id = ?";
    let params = [req.user.dbUserId];

    if (presupuesto_id) {
      whereClause += " AND r.presupuesto_id = ?";
      params.push(presupuesto_id);
    }

    if (fecha_inicio && fecha_fin) {
      whereClause += " AND r.fecha_cierre BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    }

    // Obtener estadísticas generales
    const [estadisticas] = await pool.query(
      `SELECT 
         COUNT(*) as total_ciclos,
         AVG(r.total_ingresos) as promedio_ingresos,
         AVG(r.total_gastos) as promedio_gastos,
         AVG(r.saldo_final) as promedio_saldo,
         SUM(CASE WHEN r.saldo_final > 0 THEN 1 ELSE 0 END) as ciclos_positivos,
         SUM(CASE WHEN r.saldo_final < 0 THEN 1 ELSE 0 END) as ciclos_negativos
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       ${whereClause}`,
      params
    );

    // Obtener resúmenes por presupuesto
    const [porPresupuesto] = await pool.query(
      `SELECT 
         p.nombre as presupuesto_nombre,
         p.tipo as presupuesto_tipo,
         COUNT(r.id) as total_ciclos,
         AVG(r.total_ingresos) as promedio_ingresos,
         AVG(r.total_gastos) as promedio_gastos,
         AVG(r.saldo_final) as promedio_saldo
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       ${whereClause}
       GROUP BY p.id
       ORDER BY promedio_saldo DESC`,
      params
    );

    // Obtener acciones sobrantes más comunes
    const [accionesSobrantes] = await pool.query(
      `SELECT 
         r.accion_sobrante,
         COUNT(*) as frecuencia,
         AVG(r.monto_accion) as monto_promedio
       FROM resumen_ciclo_presupuesto r
       INNER JOIN presupuestos p ON r.presupuesto_id = p.id
       ${whereClause}
       GROUP BY r.accion_sobrante
       ORDER BY frecuencia DESC`,
      params
    );

    res.json({
      estadisticas: estadisticas[0],
      por_presupuesto: porPresupuesto,
      acciones_sobrantes: accionesSobrantes
    });
  } catch (error) {
    console.error('Error getting estadisticas ciclos:', error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
}; 