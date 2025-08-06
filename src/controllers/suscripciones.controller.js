import { pool } from "../db.js";
import { 
  getUserSubscriptionInfo, 
  updateUserRole, 
  checkUserSubscription,
  PLANS,
  CLERK_PLAN_KEYS
} from "../middleware/subscription.js";

/**
 * Obtener información de suscripción del usuario actual
 */
export const getSubscriptionInfo = async (req, res) => {
  try {
    const subscriptionInfo = await getUserSubscriptionInfo(req.user.id);
    
    res.json({
      success: true,
      data: subscriptionInfo
    });
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return res.status(500).json({
      success: false,
      message: "Error getting subscription information"
    });
  }
};

/**
 * Verificar si el usuario tiene suscripción premium
 */
export const checkSubscription = async (req, res) => {
  try {
    const hasPremium = await checkUserSubscription(req.user.id);
    
    res.json({
      success: true,
      data: {
        hasPremium,
        plan: hasPremium ? PLANS.PREMIUM : PLANS.FREE
      }
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return res.status(500).json({
      success: false,
      message: "Error checking subscription status"
    });
  }
};

/**
 * Webhook handler para eventos de suscripción de Clerk
 */
export const handleSubscriptionWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log(`Received webhook: ${type}`, data);
    
    // Registrar el evento en la base de datos
    await pool.query(
      "INSERT INTO webhook_events (event_type, clerk_user_id, plan_id, event_data) VALUES (?, ?, ?, ?)",
      [
        type,
        data?.user_id || data?.subscription?.user_id,
        data?.subscription?.plan_id,
        JSON.stringify(data)
      ]
    );
    
    // Procesar según el tipo de evento
    switch (type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data);
        break;
        
      case 'subscription.payment_failed':
        await handlePaymentFailed(data);
        break;
        
      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(data);
        break;
        
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook"
    });
  }
};

/**
 * Manejar creación de suscripción
 */
const handleSubscriptionCreated = async (data) => {
  try {
    const { subscription, user_id } = data;
    
    if (!subscription || !user_id) {
      console.log('Missing subscription or user_id in webhook data');
      return;
    }
    
    // Verificar si es el plan premium
    if (subscription.plan_key !== CLERK_PLAN_KEYS.PREMIUM) {
      console.log(`Ignoring non-premium plan: ${subscription.plan_key}`);
      return;
    }
    
    // Insertar o actualizar la suscripción
    await pool.query(
      `INSERT INTO suscripciones 
       (clerk_user_id, plan_id, plan_key, status, current_period_start, current_period_end, cancel_at_period_end)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       current_period_start = VALUES(current_period_start),
       current_period_end = VALUES(current_period_end),
       cancel_at_period_end = VALUES(cancel_at_period_end),
       updated_at = CURRENT_TIMESTAMP`,
      [
        user_id,
        subscription.plan_id,
        subscription.plan_key,
        subscription.status,
        subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
        subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        subscription.cancel_at_period_end || false
      ]
    );
    
    // Actualizar el rol del usuario
    await updateUserRole(user_id);
    
    console.log(`Subscription created for user ${user_id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
};

/**
 * Manejar actualización de suscripción
 */
const handleSubscriptionUpdated = async (data) => {
  try {
    const { subscription, user_id } = data;
    
    if (!subscription || !user_id) {
      console.log('Missing subscription or user_id in webhook data');
      return;
    }
    
    // Actualizar la suscripción
    await pool.query(
      `UPDATE suscripciones SET
       status = ?,
       current_period_start = ?,
       current_period_end = ?,
       cancel_at_period_end = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE clerk_user_id = ? AND plan_id = ?`,
      [
        subscription.status,
        subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
        subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        subscription.cancel_at_period_end || false,
        user_id,
        subscription.plan_id
      ]
    );
    
    // Actualizar el rol del usuario
    await updateUserRole(user_id);
    
    console.log(`Subscription updated for user ${user_id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};

/**
 * Manejar cancelación de suscripción
 */
const handleSubscriptionCancelled = async (data) => {
  try {
    const { subscription, user_id } = data;
    
    if (!subscription || !user_id) {
      console.log('Missing subscription or user_id in webhook data');
      return;
    }
    
    // Actualizar el estado de la suscripción
    await pool.query(
      `UPDATE suscripciones SET
       status = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE clerk_user_id = ? AND plan_id = ?`,
      [subscription.status, user_id, subscription.plan_id]
    );
    
    // Actualizar el rol del usuario
    await updateUserRole(user_id);
    
    console.log(`Subscription cancelled for user ${user_id}`);
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
};

/**
 * Manejar fallo de pago
 */
const handlePaymentFailed = async (data) => {
  try {
    const { subscription, user_id } = data;
    
    if (!subscription || !user_id) {
      console.log('Missing subscription or user_id in webhook data');
      return;
    }
    
    // Actualizar el estado de la suscripción
    await pool.query(
      `UPDATE suscripciones SET
       status = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE clerk_user_id = ? AND plan_id = ?`,
      [subscription.status, user_id, subscription.plan_id]
    );
    
    // Actualizar el rol del usuario
    await updateUserRole(user_id);
    
    console.log(`Payment failed for user ${user_id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

/**
 * Manejar pago exitoso
 */
const handlePaymentSucceeded = async (data) => {
  try {
    const { subscription, user_id } = data;
    
    if (!subscription || !user_id) {
      console.log('Missing subscription or user_id in webhook data');
      return;
    }
    
    // Actualizar el estado de la suscripción
    await pool.query(
      `UPDATE suscripciones SET
       status = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE clerk_user_id = ? AND plan_id = ?`,
      [subscription.status, user_id, subscription.plan_id]
    );
    
    // Actualizar el rol del usuario
    await updateUserRole(user_id);
    
    console.log(`Payment succeeded for user ${user_id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

/**
 * Obtener estadísticas de suscripciones (solo para administradores)
 */
export const getSubscriptionStats = async (req, res) => {
  try {
    // Verificar si el usuario es administrador (puedes implementar tu propia lógica)
    const isAdmin = req.user.email === 'admin@example.com'; // Cambiar por tu lógica
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    // Obtener estadísticas
    const [totalSubscriptions] = await pool.query(
      "SELECT COUNT(*) as total FROM suscripciones WHERE status = 'active'"
    );
    
    const [premiumUsers] = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE rol = 'premium'"
    );
    
    const [freeUsers] = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE rol = 'free'"
    );
    
    const [recentSubscriptions] = await pool.query(
      `SELECT s.*, cu.email 
       FROM suscripciones s
       LEFT JOIN clerk_users cu ON s.clerk_user_id = cu.clerk_user_id
       WHERE s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 10`
    );
    
    res.json({
      success: true,
      data: {
        totalActiveSubscriptions: totalSubscriptions[0].total,
        premiumUsers: premiumUsers[0].total,
        freeUsers: freeUsers[0].total,
        recentSubscriptions: recentSubscriptions
      }
    });
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    return res.status(500).json({
      success: false,
      message: "Error getting subscription statistics"
    });
  }
}; 