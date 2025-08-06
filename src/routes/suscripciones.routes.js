import { Router } from "express";
import { 
  getSubscriptionInfo, 
  checkSubscription, 
  handleSubscriptionWebhook,
  getSubscriptionStats
} from '../controllers/suscripciones.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { mapClerkUser } from '../middleware/userMapping.js';

const router = Router();

// Rutas que requieren autenticación
router.use(authenticateToken);
router.use(mapClerkUser);

// Obtener información de suscripción del usuario
router.get('/subscription/info', getSubscriptionInfo);

// Verificar si el usuario tiene suscripción premium
router.get('/subscription/check', checkSubscription);

// Estadísticas de suscripciones (solo para administradores)
router.get('/subscription/stats', getSubscriptionStats);

// Webhook para eventos de suscripción (no requiere autenticación)
router.post('/webhook/subscription', handleSubscriptionWebhook);

export default router; 