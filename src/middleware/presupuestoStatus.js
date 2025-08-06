import { pool } from "../db.js";

export const verificarEstadoPresupuestos = async (req, res, next) => {
  try {
    // Verificar presupuestos semanales y mensuales que deben archivarse
    const [presupuestosParaArchivar] = await pool.query(
      `SELECT id, tipo, creado_en 
       FROM presupuestos 
       WHERE usuario_id = ? 
       AND estado = 'activo' 
       AND tipo IN ('semanal', 'mensual')`,
      [req.user.dbUserId]
    );

    const ahora = new Date();
    const presupuestosArchivados = [];

         for (const presupuesto of presupuestosParaArchivar) {
       let debeArchivar = false;
       const fechaCreacion = new Date(presupuesto.creado_en);

       if (presupuesto.tipo === 'semanal') {
         // Verificar si ya pasó el final de la semana actual
         const fechaExpiracion = obtenerFechaExpiracion('semanal', fechaCreacion);
         debeArchivar = ahora >= fechaExpiracion;
       } else if (presupuesto.tipo === 'mensual') {
         // Verificar si ya pasó el final del mes actual
         const fechaExpiracion = obtenerFechaExpiracion('mensual', fechaCreacion);
         debeArchivar = ahora >= fechaExpiracion;
       }

      if (debeArchivar) {
        await pool.query(
          "UPDATE presupuestos SET estado = 'archivado' WHERE id = ?",
          [presupuesto.id]
        );
        presupuestosArchivados.push(presupuesto.id);
      }
    }

    // Agregar información al request para que los controladores sepan si hubo cambios
    req.presupuestosArchivados = presupuestosArchivados;

    next();
  } catch (error) {
    console.error('Error verificando estado de presupuestos:', error);
    // Continuar sin interrumpir el flujo
    next();
  }
};

// Función para verificar un presupuesto específico
export const verificarPresupuestoEspecifico = async (presupuestoId, usuarioId) => {
  try {
    const [presupuesto] = await pool.query(
      "SELECT id, tipo, creado_en, estado FROM presupuestos WHERE id = ? AND usuario_id = ?",
      [presupuestoId, usuarioId]
    );

    if (presupuesto.length === 0) return false;

    const presupuestoData = presupuesto[0];
    if (presupuestoData.estado === 'archivado') return false;

         const ahora = new Date();
     const fechaCreacion = new Date(presupuestoData.creado_en);
     let debeArchivar = false;

     if (presupuestoData.tipo === 'semanal') {
       // Verificar si ya pasó el final de la semana actual
       const fechaExpiracion = obtenerFechaExpiracion('semanal', fechaCreacion);
       debeArchivar = ahora >= fechaExpiracion;
     } else if (presupuestoData.tipo === 'mensual') {
       // Verificar si ya pasó el final del mes actual
       const fechaExpiracion = obtenerFechaExpiracion('mensual', fechaCreacion);
       debeArchivar = ahora >= fechaExpiracion;
     }

    if (debeArchivar) {
      await pool.query(
        "UPDATE presupuestos SET estado = 'archivado' WHERE id = ?",
        [presupuestoId]
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verificando presupuesto específico:', error);
    return false;
  }
};

// Función para obtener la fecha de expiración de un presupuesto
export const obtenerFechaExpiracion = (tipo, fechaCreacion) => {
  const fecha = new Date(fechaCreacion);
  
  if (tipo === 'semanal') {
    // Calcular el final de la semana actual (domingo a las 23:59:59)
    const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const diasHastaDomingo = 7 - diaSemana; // Días restantes hasta el domingo
    fecha.setDate(fecha.getDate() + diasHastaDomingo);
    fecha.setHours(23, 59, 59, 999); // Final del domingo
  } else if (tipo === 'mensual') {
    // Calcular el final del mes actual (último día del mes a las 23:59:59)
    fecha.setMonth(fecha.getMonth() + 1, 0); // 0 = último día del mes anterior
    fecha.setHours(23, 59, 59, 999); // Final del último día del mes
  }
  
  return fecha;
};

// Función para verificar si un presupuesto está próximo a expirar
export const verificarProximaExpiracion = (tipo, fechaCreacion, diasAnticipacion = 1) => {
  const fechaExpiracion = obtenerFechaExpiracion(tipo, fechaCreacion);
  const ahora = new Date();
  const tiempoRestante = fechaExpiracion.getTime() - ahora.getTime();
  const diasRestantes = tiempoRestante / (24 * 60 * 60 * 1000);
  
  return diasRestantes <= diasAnticipacion && diasRestantes > 0;
};

// Función para obtener información detallada del período del presupuesto
export const obtenerInformacionPeriodo = (tipo, fechaCreacion) => {
  const fecha = new Date(fechaCreacion);
  const fechaExpiracion = obtenerFechaExpiracion(tipo, fechaCreacion);
  const ahora = new Date();
  
  let periodoInfo = {
    fecha_inicio: fecha,
    fecha_fin: fechaExpiracion,
    dias_restantes: Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000)),
    porcentaje_completado: 0
  };

  if (tipo === 'semanal') {
    // Calcular el inicio de la semana (lunes)
    const diaSemana = fecha.getDay();
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, son 6 días desde lunes
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - diasDesdeLunes);
    inicioSemana.setHours(0, 0, 0, 0);
    
    periodoInfo.fecha_inicio = inicioSemana;
    periodoInfo.descripcion = `Semana del ${inicioSemana.toLocaleDateString()} al ${fechaExpiracion.toLocaleDateString()}`;
  } else if (tipo === 'mensual') {
    // Calcular el inicio del mes
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    periodoInfo.fecha_inicio = inicioMes;
    periodoInfo.descripcion = `Mes de ${inicioMes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  }

  // Calcular porcentaje completado
  const tiempoTotal = fechaExpiracion.getTime() - periodoInfo.fecha_inicio.getTime();
  const tiempoTranscurrido = ahora.getTime() - periodoInfo.fecha_inicio.getTime();
  periodoInfo.porcentaje_completado = Math.min(Math.max((tiempoTranscurrido / tiempoTotal) * 100, 0), 100);

  return periodoInfo;
};

// Función para obtener el nombre del período actual
export const obtenerNombrePeriodo = (tipo, fechaCreacion) => {
  const fecha = new Date(fechaCreacion);
  
  if (tipo === 'semanal') {
    const diaSemana = fecha.getDay();
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - diasDesdeLunes);
    
    return `Semana del ${inicioSemana.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} al ${obtenerFechaExpiracion('semanal', fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
  } else if (tipo === 'mensual') {
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
  
  return 'Período personalizado';
}; 