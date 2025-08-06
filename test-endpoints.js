// Ejemplo de cómo usar los endpoints de presupuestos
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de presupuesto
const createPresupuesto = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Mensual',
      descripcion: 'Presupuesto para gastos mensuales',
      tipo: 'mensual',
      monto_inicial: 1000.00,
      saldo_disponible: 1000.00,
      es_predeterminado: true,
      estado: 'activo'
    })
  });
  
  const data = await response.json();
  console.log('Presupuesto creado:', data);
  return data;
};

// Ejemplo de obtención de presupuestos
const getPresupuestos = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuestos:', data);
  return data;
};

// Ejemplo de actualización de presupuesto
const updatePresupuesto = async (id) => {
  const response = await fetch(`${BASE_URL}/presupuestos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Actualizado',
      descripcion: 'Nueva descripción del presupuesto',
      tipo: 'semanal',
      monto_inicial: 500.00,
      saldo_disponible: 300.00,
      es_predeterminado: false,
      estado: 'activo'
    })
  });
  
  const data = await response.json();
  console.log('Presupuesto actualizado:', data);
  return data;
};

// Ejemplo de eliminación de presupuesto
const deletePresupuesto = async (id) => {
  const response = await fetch(`${BASE_URL}/presupuestos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  if (response.status === 204) {
    console.log('Presupuesto eliminado exitosamente');
  }
};

// Ejemplo de uso con async/await
const testEndpoints = async () => {
  try {
    // Crear presupuesto
    const nuevoPresupuesto = await createPresupuesto();
    
    // Obtener todos los presupuestos
    await getPresupuestos();
    
    // Actualizar presupuesto
    await updatePresupuesto(nuevoPresupuesto.id);
    
    // Eliminar presupuesto
    await deletePresupuesto(nuevoPresupuesto.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testEndpoints(); 