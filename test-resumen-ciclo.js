// Ejemplo de cómo usar los endpoints de resumen de ciclo de presupuesto
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de resumen de ciclo
const createResumenCiclo = async () => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      presupuesto_id: 1,
      fecha_cierre: new Date().toISOString(),
      accion_sobrante: 'agregar_al_siguiente',
      monto_accion: 100.00
    })
  });
  
  const data = await response.json();
  console.log('Resumen de ciclo creado:', data);
  return data;
};

// Ejemplo de generación automática de resumen de ciclo
const generarResumenAutomatico = async () => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo/automatico`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      presupuesto_id: 1,
      fecha_cierre: new Date().toISOString(),
      accion_sobrante: 'enviar_a_ahorro',
      monto_accion: 50.00
    })
  });
  
  const data = await response.json();
  console.log('Resumen automático generado:', data);
  return data;
};

// Ejemplo de obtención de resúmenes de ciclo
const getResumenesCiclo = async () => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Resúmenes de ciclo:', data);
  return data;
};

// Ejemplo de obtención de estadísticas
const getEstadisticas = async () => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo/estadisticas`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Estadísticas de ciclos:', data);
  return data;
};

// Ejemplo de obtención de resúmenes por presupuesto
const getResumenesPorPresupuesto = async (presupuestoId) => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo/presupuesto/${presupuestoId}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log(`Resúmenes del presupuesto ${presupuestoId}:`, data);
  return data;
};

// Ejemplo de actualización de resumen de ciclo
const updateResumenCiclo = async (id) => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      fecha_cierre: new Date().toISOString(),
      accion_sobrante: 'ninguna',
      monto_accion: 0.00
    })
  });
  
  const data = await response.json();
  console.log('Resumen de ciclo actualizado:', data);
  return data;
};

// Ejemplo de eliminación de resumen de ciclo
const deleteResumenCiclo = async (id) => {
  const response = await fetch(`${BASE_URL}/resumen-ciclo/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  if (response.status === 204) {
    console.log('Resumen de ciclo eliminado exitosamente');
  }
};

// Ejemplo de uso con async/await
const testResumenCicloEndpoints = async () => {
  try {
    // Crear resumen de ciclo
    const nuevoResumen = await createResumenCiclo();
    
    // Generar resumen automático
    const resumenAutomatico = await generarResumenAutomatico();
    
    // Obtener todos los resúmenes
    await getResumenesCiclo();
    
    // Obtener estadísticas
    await getEstadisticas();
    
    // Obtener resúmenes por presupuesto
    await getResumenesPorPresupuesto(1);
    
    // Actualizar resumen
    await updateResumenCiclo(nuevoResumen.id);
    
    // Eliminar resumen
    await deleteResumenCiclo(nuevoResumen.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testResumenCicloEndpoints(); 