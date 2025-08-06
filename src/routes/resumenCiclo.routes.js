import { Router } from "express";
import { 
  getResumenesCiclo, 
  getResumenCiclo, 
  createResumenCiclo, 
  updateResumenCiclo, 
  deleteResumenCiclo,
  getResumenesCicloPorPresupuesto,
  generarResumenCicloAutomatico,
  getEstadisticasCiclos
} from '../controllers/resumenCiclo.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { mapClerkUser } from '../middleware/userMapping.js';

const router = Router();

// Aplicar middleware de autenticación y mapeo de usuarios a todas las rutas
router.use(authenticateToken);
router.use(mapClerkUser);

// Rutas para resumen de ciclo de presupuesto
router.get('/resumen-ciclo', getResumenesCiclo);
router.get('/resumen-ciclo/estadisticas', getEstadisticasCiclos);
router.get('/resumen-ciclo/presupuesto/:presupuesto_id', getResumenesCicloPorPresupuesto);
router.get('/resumen-ciclo/:id', getResumenCiclo);
router.post('/resumen-ciclo', createResumenCiclo);
router.post('/resumen-ciclo/automatico', generarResumenCicloAutomatico);
router.put('/resumen-ciclo/:id', updateResumenCiclo);
router.delete('/resumen-ciclo/:id', deleteResumenCiclo);

export default router; 