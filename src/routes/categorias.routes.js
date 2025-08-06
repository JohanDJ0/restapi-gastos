import { Router } from "express";
import { 
  getCategorias, 
  getCategoria, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria,
  getCategoriasPorTipo,
  crearCategoriasUsuario
} from '../controllers/categorias.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { mapClerkUser } from '../middleware/userMapping.js';
import { checkFreeLimits, PREMIUM_FEATURES } from '../middleware/subscription.js';

const router = Router();

// Aplicar middleware de autenticación y mapeo de usuarios a todas las rutas
router.use(authenticateToken);
router.use(mapClerkUser);

// Rutas para categorías
router.get('/categorias', getCategorias);
router.get('/categorias/tipo/:tipo', getCategoriasPorTipo);
router.get('/categorias/:id', getCategoria);

// Rutas que requieren verificación de límites para usuarios free
router.post('/categorias', checkFreeLimits(PREMIUM_FEATURES.UNLIMITED_CATEGORIES), createCategoria);
router.post('/categorias/crear-defecto', checkFreeLimits(PREMIUM_FEATURES.UNLIMITED_CATEGORIES), crearCategoriasUsuario);
router.put('/categorias/:id', updateCategoria);
router.delete('/categorias/:id', deleteCategoria);

export default router; 