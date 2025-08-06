import { pool } from "../db.js";

export const mapClerkUser = async (req, res, next) => {
  try {
    const clerkUserId = req.user.id;
    
    // Buscar si el usuario de Clerk ya existe en nuestra base de datos
    const [existingUser] = await pool.query(
      "SELECT * FROM clerk_users WHERE clerk_user_id = ?",
      [clerkUserId]
    );

    if (existingUser.length > 0) {
      // Usuario ya existe, obtener el user_id correspondiente
      req.user.dbUserId = existingUser[0].user_id;
      console.log(`Existing Clerk user mapped: ${clerkUserId} -> user_id: ${existingUser[0].user_id}`);
    } else {
      // Usuario nuevo, usar transacción para evitar condiciones de carrera
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Verificar nuevamente dentro de la transacción
        const [existingUserInTx] = await connection.query(
          "SELECT * FROM clerk_users WHERE clerk_user_id = ?",
          [clerkUserId]
        );

        if (existingUserInTx.length > 0) {
          // Otro proceso ya creó el usuario mientras estábamos esperando
          req.user.dbUserId = existingUserInTx[0].user_id;
          console.log(`Existing Clerk user found in transaction: ${clerkUserId} -> user_id: ${existingUserInTx[0].user_id}`);
        } else {
          // Crear el usuario dentro de la transacción
          const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Usuario';
          
          // Verificar si ya existe un usuario con el mismo nombre
          const [existingUsers] = await connection.query(
            "SELECT * FROM users WHERE name = ?",
            [userName]
          );

          let userId;
          
          if (existingUsers.length > 0) {
            // Usar el usuario existente
            userId = existingUsers[0].id;
            console.log(`Using existing user with name '${userName}' (ID: ${userId})`);
          } else {
            // Crear nuevo usuario
            const [newUser] = await connection.query(
              "INSERT INTO users (name, rol) VALUES (?, 'free')",
              [userName]
            );
            userId = newUser.insertId;
            console.log(`Created new user: '${userName}' (ID: ${userId})`);
          }

          // Crear la entrada en clerk_users
          await connection.query(
            "INSERT INTO clerk_users (clerk_user_id, user_id, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
            [clerkUserId, userId, req.user.email, req.user.firstName, req.user.lastName]
          );

          req.user.dbUserId = userId;
          console.log(`New Clerk user mapped: ${clerkUserId} -> user_id: ${userId}`);
        }
        
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    next();
  } catch (error) {
    console.error('Error mapping Clerk user:', error);
    
    // Si es un error de duplicado en clerk_users, intentar recuperar el usuario existente
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('clerk_user_id')) {
      try {
        const [existingUser] = await pool.query(
          "SELECT * FROM clerk_users WHERE clerk_user_id = ?",
          [req.user.id]
        );
        
        if (existingUser.length > 0) {
          req.user.dbUserId = existingUser[0].user_id;
          console.log(`Recovered existing Clerk user: ${req.user.id} -> user_id: ${existingUser[0].user_id}`);
          return next();
        }
      } catch (recoveryError) {
        console.error('Error recovering user:', recoveryError);
      }
    }
    
    return res.status(500).json({
      message: "Error processing user authentication"
    });
  }
}; 