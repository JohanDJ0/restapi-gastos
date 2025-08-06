// Ejemplo de cómo usar las nuevas funcionalidades de renovación de presupuestos
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de presupuesto semanal
const createPresupuestoSemanal = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Semanal',
      descripcion: 'Presupuesto semanal de prueba',
      tipo: 'semanal',
      monto_inicial: 1000.00,
      saldo_disponible: 1000.00,
      es_predeterminado: true
    })
  });
  
  const data = await response.json();
  console.log('Presupuesto semanal creado:', data);
  return data;
};

// Ejemplo de creación de presupuesto mensual
const createPresupuestoMensual = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Mensual',
      descripcion: 'Presupuesto mensual de prueba',
      tipo: 'mensual',
      monto_inicial: 5000.00,
      saldo_disponible: 5000.00,
      es_predeterminado: false
    })
  });
  
  const data = await response.json();
  console.log('Presupuesto mensual creado:', data);
  return data;
};

// Ejemplo de obtención de presupuestos con información de expiración
const getPresupuestos = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuestos con información de expiración:', data);
  return data;
};

// Ejemplo de obtención de presupuestos próximos a expirar
const getPresupuestosProximosAExpirar = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos/proximos-expirar`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuestos próximos a expirar:', data);
  return data;
};

// Ejemplo de renovación de presupuesto
const renovarPresupuesto = async (presupuestoId) => {
  const response = await fetch(`${BASE_URL}/presupuestos/${presupuestoId}/renovar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      monto_inicial: 1200.00, // Nuevo monto inicial
      saldo_disponible: 1200.00 // Nuevo saldo disponible
    })
  });
  
  const data = await response.json();
  console.log('Presupuesto renovado:', data);
  return data;
};

// Ejemplo de obtención de presupuesto específico con verificación automática
const getPresupuesto = async (presupuestoId) => {
  const response = await fetch(`${BASE_URL}/presupuestos/${presupuestoId}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuesto específico:', data);
  return data;
};

// Ejemplo de uso con async/await
const testPresupuestosRenovacion = async () => {
  try {
    // Crear presupuestos de prueba
    const presupuestoSemanal = await createPresupuestoSemanal();
    const presupuestoMensual = await createPresupuestoMensual();
    
    // Obtener todos los presupuestos
    await getPresupuestos();
    
    // Obtener presupuestos próximos a expirar
    await getPresupuestosProximosAExpirar();
    
    // Obtener presupuesto específico
    await getPresupuesto(presupuestoSemanal.id);
    
    // Nota: Para probar la renovación, necesitarías esperar a que el presupuesto expire
    // o modificar la fecha de creación en la base de datos para simular expiración
    
    console.log('Para probar la renovación:');
    console.log('1. Espera a que el presupuesto expire (7 días para semanal, 1 mes para mensual)');
    console.log('2. O modifica la fecha de creación en la base de datos');
    console.log('3. Luego ejecuta: renovarPresupuesto(presupuestoSemanal.id)');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Función para simular expiración (solo para pruebas)
const simularExpiracion = async (presupuestoId) => {
  // Esta función modificaría la fecha de creación en la base de datos
  // para simular que el presupuesto ya expiró
  console.log(`Para simular expiración del presupuesto ${presupuestoId}:`);
  console.log('Ejecuta en MySQL:');
  console.log(`UPDATE presupuestos SET creado_en = DATE_SUB(NOW(), INTERVAL 8 DAY) WHERE id = ${presupuestoId};`);
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testPresupuestosRenovacion(); 