import { Router } from "express";
import { 
  getPresupuestos, 
  getPresupuesto, 
  createPresupuesto, 
  updatePresupuesto, 
  deletePresupuesto,
  getPresupuestoPredeterminado,
  renovarPresupuesto,
  getPresupuestosProximosAExpirar
} from '../controllers/presupuestos.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { mapClerkUser } from '../middleware/userMapping.js';
import { checkFreeLimits, PREMIUM_FEATURES } from '../middleware/subscription.js';

const router = Router();

// Aplicar middleware de autenticación y mapeo de usuarios a todas las rutas
router.use(authenticateToken);
router.use(mapClerkUser);

// Rutas para presupuestos
router.get('/presupuestos', getPresupuestos);
router.get('/presupuestos/predeterminado', getPresupuestoPredeterminado);
router.get('/presupuestos/proximos-expirar', getPresupuestosProximosAExpirar);
router.get('/presupuestos/:id', getPresupuesto);

// Rutas que requieren verificación de límites para usuarios free
router.post('/presupuestos', checkFreeLimits(PREMIUM_FEATURES.MULTIPLE_BUDGETS), createPresupuesto);
router.put('/presupuestos/:id', updatePresupuesto);
router.delete('/presupuestos/:id', deletePresupuesto);
router.post('/presupuestos/:id/renovar', renovarPresupuesto);

export default router; 