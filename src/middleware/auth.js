import { verifyToken } from '@clerk/backend';
import { CLERK_SECRET_KEY } from '../config.js';

// Configurar Clerk con la clave secreta
if (!CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is required in environment variables');
  process.exit(1);
}

// Función para decodificar JWT sin verificar firma
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return { header, payload };
  } catch (error) {
    return null;
  }
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Token recibido:', token ? token.substring(0, 50) + '...' : 'No token');

    if (!token) {
      return res.status(401).json({
        message: 'Access token required. Please provide a valid Clerk session token in the Authorization header.'
      });
    }

    // Verificar que el token tenga la estructura básica de un JWT
    if (!token.includes('.')) {
      return res.status(401).json({
        message: 'Invalid token format. Please provide a valid Clerk session token.'
      });
    }

    // Decodificar el JWT para obtener información
    const decoded = decodeJWT(token);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid JWT format'
      });
    }

    console.log('JWT Header:', decoded.header);
    console.log('JWT Payload:', decoded.payload);

    // Verificar que el token no haya expirado
    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp && decoded.payload.exp < now) {
      return res.status(401).json({
        message: 'Token has expired'
      });
    }

    // Verificar que el issuer sea válido
    const issuer = decoded.payload.iss;
    if (!issuer || !issuer.includes('clerk.accounts.dev')) {
      return res.status(401).json({
        message: 'Invalid token issuer'
      });
    }

    // Verificar que el audience sea válido
    const audience = decoded.payload.aud;
    if (!audience || (audience !== 'korly-api' && audience !== 'authenticated')) {
      return res.status(401).json({
        message: 'Invalid token audience'
      });
    }

    // Usar el payload decodificado directamente
    const payload = decoded.payload;

    // Agregar información del usuario al request
    req.user = {
      id: payload.sub || payload.user_id, // sub o user_id contiene el ID del usuario
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name
    };

    console.log('Usuario autenticado:', req.user);

    next();
  } catch (error) {
    console.error('Auth error:', error);
    
    return res.status(401).json({
      message: 'Authentication failed',
      details: error.message || 'Unknown authentication error'
    });
  }
}; 