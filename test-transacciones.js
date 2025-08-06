// Ejemplo de cómo usar los endpoints de transacciones
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de transacción
const createTransaccion = async () => {
  const response = await fetch(`${BASE_URL}/transacciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      presupuesto_id: 1,
      tipo: 'gasto',
      categoria_id: 1,
      descripcion: 'Compra de comida',
      monto: 50.00,
      fecha: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  console.log('Transacción creada:', data);
  return data;
};

// Ejemplo de obtención de transacciones
const getTransacciones = async () => {
  const response = await fetch(`${BASE_URL}/transacciones`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Transacciones:', data);
  return data;
};

// Ejemplo de obtención de resumen
const getResumen = async () => {
  const response = await fetch(`${BASE_URL}/transacciones/resumen`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Resumen de transacciones:', data);
  return data;
};

// Ejemplo de obtención de transacciones por presupuesto
const getTransaccionesPorPresupuesto = async (presupuestoId) => {
  const response = await fetch(`${BASE_URL}/transacciones/presupuesto/${presupuestoId}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log(`Transacciones del presupuesto ${presupuestoId}:`, data);
  return data;
};

// Ejemplo de obtención de transacciones por categoría
const getTransaccionesPorCategoria = async (categoriaId) => {
  const response = await fetch(`${BASE_URL}/transacciones/categoria/${categoriaId}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log(`Transacciones de la categoría ${categoriaId}:`, data);
  return data;
};

// Ejemplo de actualización de transacción
const updateTransaccion = async (id) => {
  const response = await fetch(`${BASE_URL}/transacciones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      presupuesto_id: 1,
      tipo: 'gasto',
      categoria_id: 1,
      descripcion: 'Compra de comida actualizada',
      monto: 55.00,
      fecha: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  console.log('Transacción actualizada:', data);
  return data;
};

// Ejemplo de eliminación de transacción
const deleteTransaccion = async (id) => {
  const response = await fetch(`${BASE_URL}/transacciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  if (response.status === 204) {
    console.log('Transacción eliminada exitosamente');
  }
};

// Ejemplo de uso con async/await
const testTransaccionesEndpoints = async () => {
  try {
    // Crear transacción
    const nuevaTransaccion = await createTransaccion();
    
    // Obtener todas las transacciones
    await getTransacciones();
    
    // Obtener resumen
    await getResumen();
    
    // Obtener transacciones por presupuesto
    await getTransaccionesPorPresupuesto(1);
    
    // Obtener transacciones por categoría
    await getTransaccionesPorCategoria(1);
    
    // Actualizar transacción
    await updateTransaccion(nuevaTransaccion.id);
    
    // Eliminar transacción
    await deleteTransaccion(nuevaTransaccion.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testTransaccionesEndpoints(); 