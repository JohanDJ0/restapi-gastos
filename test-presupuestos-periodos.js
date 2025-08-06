// Ejemplo de cómo usar las nuevas funcionalidades de períodos de presupuestos
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de presupuesto semanal (se creará para la semana actual)
const createPresupuestoSemanal = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Semanal Actual',
      descripcion: 'Presupuesto semanal que termina al final de esta semana',
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

// Ejemplo de creación de presupuesto mensual (se creará para el mes actual)
const createPresupuestoMensual = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Presupuesto Mensual Actual',
      descripcion: 'Presupuesto mensual que termina al final de este mes',
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

// Ejemplo de obtención de presupuestos con información de período
const getPresupuestos = async () => {
  const response = await fetch(`${BASE_URL}/presupuestos`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuestos con información de período:', data);
  
  // Mostrar información específica de cada presupuesto
  data.forEach(presupuesto => {
    if (presupuesto.informacion_periodo) {
      console.log(`📅 ${presupuesto.nombre}:`);
      console.log(`   Período: ${presupuesto.nombre_periodo}`);
      console.log(`   Inicio: ${presupuesto.informacion_periodo.fecha_inicio.toLocaleDateString()}`);
      console.log(`   Fin: ${presupuesto.informacion_periodo.fecha_fin.toLocaleDateString()}`);
      console.log(`   Días restantes: ${presupuesto.informacion_periodo.dias_restantes}`);
      console.log(`   Progreso: ${presupuesto.informacion_periodo.porcentaje_completado.toFixed(1)}%`);
      console.log(`   Próximo a expirar: ${presupuesto.proximo_a_expirar ? 'Sí' : 'No'}`);
      console.log('---');
    }
  });
  
  return data;
};

// Ejemplo de obtención de presupuesto específico
const getPresupuesto = async (presupuestoId) => {
  const response = await fetch(`${BASE_URL}/presupuestos/${presupuestoId}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Presupuesto específico:', data);
  
  if (data.informacion_periodo) {
    console.log(`📊 Información detallada del período:`);
    console.log(`   ${data.nombre_periodo}`);
    console.log(`   Descripción: ${data.informacion_periodo.descripcion}`);
    console.log(`   Progreso: ${data.informacion_periodo.porcentaje_completado.toFixed(1)}%`);
    console.log(`   Días restantes: ${data.informacion_periodo.dias_restantes}`);
  }
  
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
  
  data.forEach(presupuesto => {
    console.log(`⚠️  ${presupuesto.nombre} expira en ${presupuesto.dias_restantes} días`);
    console.log(`   Período: ${presupuesto.nombre_periodo}`);
  });
  
  return data;
};

// Función para mostrar información del período actual
const mostrarInformacionPeriodoActual = () => {
  const ahora = new Date();
  console.log('📅 Información del período actual:');
  console.log(`   Fecha actual: ${ahora.toLocaleDateString()}`);
  console.log(`   Día de la semana: ${ahora.toLocaleDateString('es-ES', { weekday: 'long' })}`);
  console.log(`   Semana del año: ${getWeekNumber(ahora)}`);
  console.log(`   Mes: ${ahora.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`);
  
  // Calcular final de la semana actual
  const diaSemana = ahora.getDay();
  const diasHastaDomingo = 7 - diaSemana;
  const finalSemana = new Date(ahora);
  finalSemana.setDate(ahora.getDate() + diasHastaDomingo);
  finalSemana.setHours(23, 59, 59, 999);
  
  // Calcular final del mes actual
  const finalMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  finalMes.setHours(23, 59, 59, 999);
  
  console.log(`   Final de la semana: ${finalSemana.toLocaleDateString()}`);
  console.log(`   Final del mes: ${finalMes.toLocaleDateString()}`);
};

// Función auxiliar para obtener el número de semana
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Ejemplo de uso con async/await
const testPresupuestosPeriodos = async () => {
  try {
    console.log('🚀 Iniciando pruebas de períodos de presupuestos...\n');
    
    // Mostrar información del período actual
    mostrarInformacionPeriodoActual();
    console.log('\n');
    
    // Crear presupuestos de prueba
    console.log('📝 Creando presupuestos de prueba...');
    const presupuestoSemanal = await createPresupuestoSemanal();
    const presupuestoMensual = await createPresupuestoMensual();
    console.log('\n');
    
    // Obtener todos los presupuestos con información de período
    console.log('📊 Obteniendo presupuestos con información de período...');
    await getPresupuestos();
    console.log('\n');
    
    // Obtener presupuesto específico
    console.log('🔍 Obteniendo presupuesto específico...');
    await getPresupuesto(presupuestoSemanal.id);
    console.log('\n');
    
    // Obtener presupuestos próximos a expirar
    console.log('⚠️  Verificando presupuestos próximos a expirar...');
    await getPresupuestosProximosAExpirar();
    console.log('\n');
    
    console.log('✅ Pruebas completadas exitosamente!');
    console.log('\n💡 Notas importantes:');
    console.log('   - Los presupuestos semanales terminan al final de la semana actual (domingo)');
    console.log('   - Los presupuestos mensuales terminan al final del mes actual');
    console.log('   - La información del período se calcula automáticamente');
    console.log('   - El progreso se actualiza en tiempo real');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testPresupuestosPeriodos(); 