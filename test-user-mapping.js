// Script de prueba para el middleware de mapeo de usuarios
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testUserMapping() {
  console.log('=== Testing User Mapping Middleware ===\n');

  try {
    // Simular múltiples llamadas autenticadas para verificar que no se crean duplicados
    console.log('1. Testing authenticated endpoints to check for duplicate prevention...');
    
    // Nota: Estos tests requieren un token válido de Clerk
    // Para pruebas reales, necesitarías un token válido
    
    // Test presupuestos (usa mapClerkUser)
    console.log('Testing presupuestos endpoint...');
    try {
      const presupuestos = await fetch(`${BASE_URL}/presupuestos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_CLERK_TOKEN_HERE' // Reemplazar con token válido
        }
      });
      
      console.log('Presupuestos Status:', presupuestos.status);
      if (presupuestos.status === 401) {
        console.log('(Expected: No valid token provided)');
      }
    } catch (error) {
      console.log('Error testing presupuestos:', error.message);
    }

    // Test categorías (usa mapClerkUser)
    console.log('Testing categorias endpoint...');
    try {
      const categorias = await fetch(`${BASE_URL}/categorias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_CLERK_TOKEN_HERE' // Reemplazar con token válido
        }
      });
      
      console.log('Categorias Status:', categorias.status);
      if (categorias.status === 401) {
        console.log('(Expected: No valid token provided)');
      }
    } catch (error) {
      console.log('Error testing categorias:', error.message);
    }

    console.log('\n2. Checking current users in database...');
    const users = await fetch(`${BASE_URL}/users`);
    const usersData = await users.json();
    console.log('Current users:', usersData);

    // Verificar duplicados
    const names = usersData.map(user => user.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  WARNING: Found duplicate names:', [...new Set(duplicates)]);
    } else {
      console.log('\n✅ No duplicate names found!');
    }

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  console.log('\n=== Database Structure Check ===\n');
  
  try {
    // Verificar que la tabla users tiene el campo rol
    const users = await fetch(`${BASE_URL}/users`);
    const usersData = await users.json();
    
    if (usersData.length > 0) {
      const firstUser = usersData[0];
      if (firstUser.hasOwnProperty('rol')) {
        console.log('✅ Users table has "rol" field');
        console.log('Sample user:', firstUser);
      } else {
        console.log('❌ Users table missing "rol" field');
      }
    }
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}

// Ejecutar las pruebas
async function runTests() {
  await checkDatabaseStructure();
  await testUserMapping();
}

runTests(); 