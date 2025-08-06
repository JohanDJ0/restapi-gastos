// Script de prueba para el controlador de usuarios
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testUsers() {
  console.log('=== Testing Users Controller ===\n');

  try {
    // Test 1: Crear usuario con rol por defecto (free)
    console.log('1. Creating user with default role (free)...');
    const user1 = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TestUser1'
      })
    });
    
    const user1Data = await user1.json();
    console.log('Response:', user1Data);
    console.log('Status:', user1.status);
    console.log('');

    // Test 2: Crear usuario con rol premium
    console.log('2. Creating user with premium role...');
    const user2 = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TestUser2',
        rol: 'premium'
      })
    });
    
    const user2Data = await user2.json();
    console.log('Response:', user2Data);
    console.log('Status:', user2.status);
    console.log('');

    // Test 3: Intentar crear usuario duplicado
    console.log('3. Trying to create duplicate user...');
    const user3 = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TestUser1'
      })
    });
    
    const user3Data = await user3.json();
    console.log('Response:', user3Data);
    console.log('Status:', user3.status);
    console.log('');

    // Test 4: Obtener todos los usuarios
    console.log('4. Getting all users...');
    const users = await fetch(`${BASE_URL}/users`);
    const usersData = await users.json();
    console.log('Response:', usersData);
    console.log('Status:', users.status);
    console.log('');

    // Test 5: Actualizar usuario
    if (user1Data.id) {
      console.log('5. Updating user...');
      const updateUser = await fetch(`${BASE_URL}/users/${user1Data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'TestUser1Updated',
          rol: 'premium'
        })
      });
      
      const updateData = await updateUser.json();
      console.log('Response:', updateData);
      console.log('Status:', updateUser.status);
      console.log('');
    }

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Ejecutar las pruebas
testUsers(); 