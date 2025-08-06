# Guía de Autenticación con Clerk

## Problema Común: Token Inválido

Si estás recibiendo el error:
```
Unable to find a signing key in JWKS that matches the kid='undefined' of the provided session token
```

Esto significa que el token que estás enviando no es un token de sesión válido de Clerk.

## Cómo Obtener el Token Correcto

### 1. En el Frontend (React/Next.js)

```javascript
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { getToken } = useAuth();
  
  const callAPI = async () => {
    try {
      // Obtener el token de sesión
      const token = await getToken();
      
      // Llamar a la API
      const response = await fetch('http://localhost:3001/api/presupuestos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <button onClick={callAPI}>
      Obtener Presupuestos
    </button>
  );
}
```

### 2. En el Frontend (Vanilla JavaScript)

```javascript
// Si estás usando Clerk en vanilla JS
async function callAPI() {
  try {
    // Obtener el token de la sesión actual
    const token = await window.Clerk.session.getToken();
    
    const response = await fetch('http://localhost:3001/api/presupuestos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 3. Para Pruebas (Postman/Thunder Client)

1. **Obtén el token del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Application/Storage
   - Busca la cookie `__session`
   - Copia el valor del token

2. **Usa el token en Postman:**
   - En el header `Authorization`: `Bearer <token>`

## Verificación del Token

### Token Válido (Ejemplo)
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imluc18zMG41UmJMSVhsM2UzblN1YzR5WlBxYVFiT1AifQ...
```

### Token Inválido (Ejemplos)
```
undefined
null
"test-token"
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Token sin kid válido
```

## Configuración Requerida

### 1. Variables de Entorno
```env
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

### 2. Frontend Configuration
```javascript
// En tu app de Clerk
const clerkConfig = {
  publishableKey: 'pk_test_your_publishable_key_here'
};
```

## Solución de Problemas

### Error: "kid='undefined'"
- **Causa**: Token no es un token de sesión válido de Clerk
- **Solución**: Usar `getToken()` del hook `useAuth()` o `Clerk.session.getToken()`

### Error: "Invalid JWT format"
- **Causa**: Token no tiene el formato JWT correcto
- **Solución**: Verificar que el token tenga 3 partes separadas por puntos

### Error: "Token expired"
- **Causa**: El token ha expirado
- **Solución**: Obtener un nuevo token con `getToken()`

## Ejemplo Completo de Uso

```javascript
// Frontend
import { useAuth } from '@clerk/nextjs';

export default function PresupuestosPage() {
  const { getToken, isSignedIn } = useAuth();
  
  const [presupuestos, setPresupuestos] = useState([]);
  
  const fetchPresupuestos = async () => {
    if (!isSignedIn) return;
    
    try {
      const token = await getToken();
      
      const response = await fetch('http://localhost:3001/api/presupuestos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPresupuestos(data);
      } else {
        console.error('Error fetching presupuestos');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  useEffect(() => {
    fetchPresupuestos();
  }, [isSignedIn]);
  
  return (
    <div>
      <h1>Mis Presupuestos</h1>
      {presupuestos.map(presupuesto => (
        <div key={presupuesto.id}>
          <h3>{presupuesto.nombre}</h3>
          <p>Saldo: ${presupuesto.saldo_disponible}</p>
        </div>
      ))}
    </div>
  );
}
```

## Notas Importantes

1. **Siempre usa `getToken()`**: No uses tokens hardcodeados o de otras fuentes
2. **Verifica la sesión**: Asegúrate de que el usuario esté autenticado antes de hacer llamadas
3. **Maneja errores**: Implementa manejo de errores para tokens expirados
4. **Variables de entorno**: Asegúrate de que `CLERK_SECRET_KEY` esté configurada correctamente 