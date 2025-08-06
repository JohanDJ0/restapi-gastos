import { Router } from "express";
import { 
  getTransacciones, 
  getTransaccion, 
  createTransaccion, 
  updateTransaccion, 
  deleteTransaccion,
  getTransaccionesPorPresupuesto,
  getTransaccionesPorCategoria,
  getResumenTransacciones
} from '../controllers/transacciones.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { mapClerkUser } from '../middleware/userMapping.js';

const router = Router();

// Aplicar middleware de autenticación y mapeo de usuarios a todas las rutas
router.use(authenticateToken);
router.use(mapClerkUser);

// Rutas para transacciones
router.get('/transacciones', getTransacciones);
router.get('/transacciones/resumen', getResumenTransacciones);
router.get('/transacciones/presupuesto/:presupuesto_id', getTransaccionesPorPresupuesto);
router.get('/transacciones/categoria/:categoria_id', getTransaccionesPorCategoria);
router.get('/transacciones/:id', getTransaccion);
router.post('/transacciones', createTransaccion);
router.put('/transacciones/:id', updateTransaccion);
router.delete('/transacciones/:id', deleteTransaccion);

export default router; 