// Script para probar el manejo de peticiones concurrentes
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testConcurrentRequests() {
  console.log('=== Testing Concurrent User Creation ===\n');

  try {
    // Simular múltiples peticiones simultáneas
    console.log('1. Simulating concurrent requests...');
    
    const promises = [];
    const numRequests = 5;
    
    for (let i = 0; i < numRequests; i++) {
      promises.push(
        fetch(`${BASE_URL}/presupuestos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_CLERK_TOKEN_HERE' // Reemplazar con token válido
          }
        }).catch(error => ({
          status: 'error',
          message: error.message
        }))
      );
    }
    
    const results = await Promise.all(promises);
    
    console.log(`Sent ${numRequests} concurrent requests`);
    console.log('Results:', results.map((r, i) => `Request ${i + 1}: ${r.status}`));
    
    // Verificar usuarios después de las peticiones
    console.log('\n2. Checking users after concurrent requests...');
    const usersResponse = await fetch(`${BASE_URL}/users`);
    const users = await usersResponse.json();
    
    console.log('Current users:', users);
    
    // Verificar duplicados
    const names = users.map(user => user.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  WARNING: Found duplicate names:', [...new Set(duplicates)]);
    } else {
      console.log('\n✅ No duplicate names found!');
    }
    
    // Verificar clerk_users
    console.log('\n3. Checking clerk_users table...');
    const clerkUsersResponse = await fetch(`${BASE_URL}/clerk-users`);
    if (clerkUsersResponse.ok) {
      const clerkUsers = await clerkUsersResponse.json();
      console.log('Clerk users:', clerkUsers);
    } else {
      console.log('Clerk users endpoint not available');
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Función para verificar el estado actual
async function checkCurrentState() {
  console.log('\n=== Current Database State ===\n');
  
  try {
    const usersResponse = await fetch(`${BASE_URL}/users`);
    const users = await usersResponse.json();
    
    console.log('Users table:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.name}, Rol: ${user.rol}`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
    // Verificar duplicados
    const names = users.map(user => user.name);
    const uniqueNames = [...new Set(names)];
    
    if (names.length !== uniqueNames.length) {
      console.log('\n⚠️  Duplicates found!');
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      console.log('Duplicate names:', [...new Set(duplicates)]);
    } else {
      console.log('\n✅ No duplicates found');
    }
    
  } catch (error) {
    console.error('Error checking current state:', error);
  }
}

// Ejecutar las pruebas
async function runTests() {
  await checkCurrentState();
  await testConcurrentRequests();
}

runTests(); 