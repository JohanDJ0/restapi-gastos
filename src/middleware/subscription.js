import { pool } from "../db.js";

// Planes disponibles
export const PLANS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

// Plan keys de Clerk
export const CLERK_PLAN_KEYS = {
  PREMIUM: 'plan_korly_premium'
};

// Funcionalidades premium
export const PREMIUM_FEATURES = {
  UNLIMITED_CATEGORIES: 'unlimited_categories',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_DATA: 'export_data',
  CUSTOM_REPORTS: 'custom_reports',
  MULTIPLE_BUDGETS: 'multiple_budgets'
};

// Límites para usuarios free
export const FREE_LIMITS = {
  MAX_CATEGORIES: 10,
  MAX_BUDGETS: 3,
  MAX_TRANSACTIONS_PER_MONTH: 100
};

/**
 * Middleware para verificar si un usuario tiene suscripción premium
 */
export const requirePremium = async (req, res, next) => {
  try {
    const hasPremium = await checkUserSubscription(req.user.id);
    
    if (!hasPremium) {
      return res.status(403).json({
        message: "Premium subscription required",
        error: "PREMIUM_REQUIRED",
        upgradeUrl: "/pricing"
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking premium subscription:', error);
    return res.status(500).json({
      message: "Error checking subscription status"
    });
  }
};

/**
 * Middleware para verificar límites de usuarios free
 */
export const checkFreeLimits = (feature) => {
  return async (req, res, next) => {
    try {
      const hasPremium = await checkUserSubscription(req.user.id);
      
      if (hasPremium) {
        return next(); // Usuarios premium no tienen límites
      }
      
      // Verificar límites según la funcionalidad
      const withinLimits = await checkFeatureLimits(req.user.dbUserId, feature);
      
      if (!withinLimits.allowed) {
        return res.status(403).json({
          message: withinLimits.message,
          error: "LIMIT_EXCEEDED",
          current: withinLimits.current,
          limit: withinLimits.limit,
          upgradeUrl: "/pricing"
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking free limits:', error);
      return res.status(500).json({
        message: "Error checking usage limits"
      });
    }
  };
};

/**
 * Verificar si un usuario tiene suscripción premium activa
 */
export const checkUserSubscription = async (clerkUserId) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.* FROM suscripciones s
       WHERE s.clerk_user_id = ? 
       AND s.plan_key = ? 
       AND s.status = 'active'
       AND (s.current_period_end IS NULL OR s.current_period_end > NOW())`,
      [clerkUserId, CLERK_PLAN_KEYS.PREMIUM]
    );
    
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return false;
  }
};

/**
 * Obtener información completa de suscripción del usuario
 */
export const getUserSubscriptionInfo = async (clerkUserId) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.rol FROM suscripciones s
       LEFT JOIN clerk_users cu ON s.clerk_user_id = cu.clerk_user_id
       LEFT JOIN users u ON cu.user_id = u.id
       WHERE s.clerk_user_id = ?
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [clerkUserId]
    );
    
    if (rows.length === 0) {
      return {
        hasSubscription: false,
        plan: PLANS.FREE,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    }
    
    const subscription = rows[0];
    return {
      hasSubscription: true,
      plan: subscription.plan_key === CLERK_PLAN_KEYS.PREMIUM ? PLANS.PREMIUM : PLANS.FREE,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planId: subscription.plan_id
    };
  } catch (error) {
    console.error('Error getting user subscription info:', error);
    return {
      hasSubscription: false,
      plan: PLANS.FREE,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    };
  }
};

/**
 * Verificar límites específicos para usuarios free
 */
export const checkFeatureLimits = async (userId, feature) => {
  try {
    switch (feature) {
      case PREMIUM_FEATURES.UNLIMITED_CATEGORIES:
        const [categories] = await pool.query(
          "SELECT COUNT(*) as count FROM categorias WHERE usuario_id = ?",
          [userId]
        );
        
        const categoryCount = categories[0].count;
        return {
          allowed: categoryCount < FREE_LIMITS.MAX_CATEGORIES,
          current: categoryCount,
          limit: FREE_LIMITS.MAX_CATEGORIES,
          message: `Free users can only create up to ${FREE_LIMITS.MAX_CATEGORIES} categories. Upgrade to Premium for unlimited categories.`
        };
        
      case PREMIUM_FEATURES.MULTIPLE_BUDGETS:
        const [budgets] = await pool.query(
          "SELECT COUNT(*) as count FROM presupuestos WHERE usuario_id = ? AND estado = 'activo'",
          [userId]
        );
        
        const budgetCount = budgets[0].count;
        return {
          allowed: budgetCount < FREE_LIMITS.MAX_BUDGETS,
          current: budgetCount,
          limit: FREE_LIMITS.MAX_BUDGETS,
          message: `Free users can only have ${FREE_LIMITS.MAX_BUDGETS} active budgets. Upgrade to Premium for unlimited budgets.`
        };
        
      case PREMIUM_FEATURES.ADVANCED_ANALYTICS:
        return {
          allowed: false,
          current: 0,
          limit: 0,
          message: "Advanced analytics are only available for Premium users."
        };
        
      case PREMIUM_FEATURES.EXPORT_DATA:
        return {
          allowed: false,
          current: 0,
          limit: 0,
          message: "Data export is only available for Premium users."
        };
        
      case PREMIUM_FEATURES.CUSTOM_REPORTS:
        return {
          allowed: false,
          current: 0,
          limit: 0,
          message: "Custom reports are only available for Premium users."
        };
        
      default:
        return {
          allowed: true,
          current: 0,
          limit: 0,
          message: ""
        };
    }
  } catch (error) {
    console.error('Error checking feature limits:', error);
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "Error checking usage limits"
    };
  }
};

/**
 * Actualizar el rol del usuario en la tabla users basado en su suscripción
 */
export const updateUserRole = async (clerkUserId) => {
  try {
    const hasPremium = await checkUserSubscription(clerkUserId);
    
    // Obtener el user_id de la tabla clerk_users
    const [clerkUser] = await pool.query(
      "SELECT user_id FROM clerk_users WHERE clerk_user_id = ?",
      [clerkUserId]
    );
    
    if (clerkUser.length === 0) {
      console.log(`No clerk_user found for ${clerkUserId}`);
      return;
    }
    
    const newRole = hasPremium ? PLANS.PREMIUM : PLANS.FREE;
    
    // Actualizar el rol del usuario
    await pool.query(
      "UPDATE users SET rol = ? WHERE id = ?",
      [newRole, clerkUser[0].user_id]
    );
    
    console.log(`Updated user role for ${clerkUserId} to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}; 