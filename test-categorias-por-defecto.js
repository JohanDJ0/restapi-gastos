// Ejemplo de cómo usar las nuevas funcionalidades de categorías por defecto
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de obtención de categorías (incluye globales y personales)
const getCategorias = async () => {
  const response = await fetch(`${BASE_URL}/categorias`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('📂 Todas las categorías:', data);
  
  // Separar categorías globales y personales
  const categoriasGlobales = data.filter(cat => cat.usuario_id === null);
  const categoriasPersonales = data.filter(cat => cat.usuario_id !== null);
  
  console.log('🌍 Categorías globales:', categoriasGlobales.length);
  console.log('👤 Categorías personales:', categoriasPersonales.length);
  
  return data;
};

// Ejemplo de obtención de categorías por tipo
const getCategoriasPorTipo = async (tipo) => {
  const response = await fetch(`${BASE_URL}/categorias/tipo/${tipo}`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log(`📂 Categorías de ${tipo}:`, data);
  
  return data;
};

// Ejemplo de creación de categorías por defecto para el usuario
const crearCategoriasUsuario = async () => {
  const response = await fetch(`${BASE_URL}/categorias/crear-defecto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('✅ Categorías por defecto creadas:', data);
  
  return data;
};

// Ejemplo de creación de categoría personalizada
const crearCategoriaPersonalizada = async () => {
  const response = await fetch(`${BASE_URL}/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Mi Categoría Personalizada',
      tipo: 'gasto',
      icono: '🎯',
      color: '#ff6b6b'
    })
  });
  
  const data = await response.json();
  console.log('✅ Categoría personalizada creada:', data);
  
  return data;
};

// Ejemplo de uso con async/await
const testCategoriasPorDefecto = async () => {
  try {
    console.log('🚀 Iniciando pruebas de categorías por defecto...\n');
    
    // Obtener todas las categorías (se crearán automáticamente si no existen)
    console.log('📂 Obteniendo categorías...');
    await getCategorias();
    console.log('\n');
    
    // Obtener categorías por tipo
    console.log('💰 Obteniendo categorías de ingresos...');
    await getCategoriasPorTipo('ingreso');
    console.log('\n');
    
    console.log('💸 Obteniendo categorías de gastos...');
    await getCategoriasPorTipo('gasto');
    console.log('\n');
    
    // Crear categorías por defecto para el usuario (solo si no tiene categorías personales)
    console.log('👤 Creando categorías por defecto para el usuario...');
    try {
      await crearCategoriasUsuario();
    } catch (error) {
      console.log('ℹ️  El usuario ya tiene categorías personales o ya se crearon las por defecto');
    }
    console.log('\n');
    
    // Crear una categoría personalizada
    console.log('🎯 Creando categoría personalizada...');
    await crearCategoriaPersonalizada();
    console.log('\n');
    
    // Obtener categorías nuevamente para ver los cambios
    console.log('📂 Obteniendo categorías actualizadas...');
    await getCategorias();
    console.log('\n');
    
    console.log('✅ Pruebas completadas exitosamente!');
    console.log('\n💡 Notas importantes:');
    console.log('   - Las categorías globales se crean automáticamente la primera vez');
    console.log('   - Las categorías globales están disponibles para todos los usuarios');
    console.log('   - Los usuarios pueden crear categorías personales adicionales');
    console.log('   - Las categorías personales tienen prioridad sobre las globales');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Función para mostrar información sobre las categorías
const mostrarInformacionCategorias = () => {
  console.log('📋 Información sobre categorías por defecto:');
  console.log('\n🌍 Categorías Globales (usuario_id = NULL):');
  console.log('   - Disponibles para todos los usuarios');
  console.log('   - Se crean automáticamente la primera vez');
  console.log('   - No se pueden eliminar ni modificar por usuarios individuales');
  console.log('   - Incluyen categorías básicas como: Salario, Alimentación, Transporte, etc.');
  
  console.log('\n👤 Categorías Personales (usuario_id = ID del usuario):');
  console.log('   - Creadas por cada usuario individualmente');
  console.log('   - Se pueden eliminar y modificar');
  console.log('   - Tienen prioridad sobre las globales');
  console.log('   - Permiten personalización completa');
  
  console.log('\n🎨 Características de las categorías:');
  console.log('   - Nombre: Identificador único');
  console.log('   - Tipo: "ingreso" o "gasto"');
  console.log('   - Icono: Emoji para representación visual');
  console.log('   - Color: Código hexadecimal para personalización');
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testCategoriasPorDefecto();

// Descomenta la línea siguiente para mostrar información
// mostrarInformacionCategorias(); 