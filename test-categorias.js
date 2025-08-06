// Ejemplo de cómo usar los endpoints de categorías
// IMPORTANTE: Para obtener un token válido, usa el hook useAuth() en tu frontend:
// const { getToken } = useAuth();
// const token = await getToken();
// 
// O para pruebas, obtén el token de la cookie __session en el navegador
// después de iniciar sesión con Clerk

const BASE_URL = 'http://localhost:3001/api';

// Ejemplo de creación de categoría
const createCategoria = async () => {
  const response = await fetch(`${BASE_URL}/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Comida',
      tipo: 'gasto',
      icono: '🍕',
      color: '#FF6B6B'
    })
  });
  
  const data = await response.json();
  console.log('Categoría creada:', data);
  return data;
};

// Ejemplo de obtención de categorías
const getCategorias = async () => {
  const response = await fetch(`${BASE_URL}/categorias`, {
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  const data = await response.json();
  console.log('Categorías:', data);
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
  console.log(`Categorías de ${tipo}:`, data);
  return data;
};

// Ejemplo de actualización de categoría
const updateCategoria = async (id) => {
  const response = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <CLERK_TOKEN>'
    },
    body: JSON.stringify({
      nombre: 'Comida y Bebidas',
      tipo: 'gasto',
      icono: '🍕',
      color: '#FF6B6B'
    })
  });
  
  const data = await response.json();
  console.log('Categoría actualizada:', data);
  return data;
};

// Ejemplo de eliminación de categoría
const deleteCategoria = async (id) => {
  const response = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer <CLERK_TOKEN>'
    }
  });
  
  if (response.status === 204) {
    console.log('Categoría eliminada exitosamente');
  }
};

// Ejemplo de uso con async/await
const testCategoriasEndpoints = async () => {
  try {
    // Crear categoría
    const nuevaCategoria = await createCategoria();
    
    // Obtener todas las categorías
    await getCategorias();
    
    // Obtener categorías por tipo
    await getCategoriasPorTipo('gasto');
    await getCategoriasPorTipo('ingreso');
    
    // Actualizar categoría
    await updateCategoria(nuevaCategoria.id);
    
    // Eliminar categoría
    await deleteCategoria(nuevaCategoria.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Descomenta la línea siguiente para ejecutar las pruebas
// testCategoriasEndpoints(); 