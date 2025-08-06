import { pool } from "../db.js";

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getUser = async (req, res) => {
  try {
   
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length <= 0)
      return res.status(404).json({
        message: "User not found",
      });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createUser = async (req, res) => {
  const { name, rol = 'free' } = req.body;
  
  // Validar que el rol sea válido
  if (rol && !['free', 'premium'].includes(rol)) {
    return res.status(400).json({
      message: "Rol must be 'free' or 'premium'"
    });
  }

  try {
    // Verificar si ya existe un usuario con el mismo nombre
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE name = ?", 
      [name]
    );

    if (existingUsers.length > 0) {
      console.log(`User with name '${name}' already exists`);
      return res.status(409).json({
        message: "User with this name already exists",
        existingUser: existingUsers[0]
      });
    }

    console.log(`Creating new user: ${name} with rol: ${rol}`);
    
    const [rows] = await pool.query(
      "INSERT INTO users (name, rol) VALUES (?, ?)", 
      [name, rol]
    );
    
    console.log(`User created successfully with ID: ${rows.insertId}`);
    
    res.status(201).json({
      id: rows.insertId,
      name,
      rol
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows <= 0)
      return res.status(404).json({
        message: "User not found",
      });
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, rol } = req.body;

  // Validar que el rol sea válido si se proporciona
  if (rol && !['free', 'premium'].includes(rol)) {
    return res.status(400).json({
      message: "Rol must be 'free' or 'premium'"
    });
  }

  try {
    let query = "UPDATE users SET ";
    let params = [];
    
    if (name) {
      query += "name = ?";
      params.push(name);
    }
    
    if (rol) {
      if (params.length > 0) query += ", ";
      query += "rol = ?";
      params.push(rol);
    }
    
    query += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0)
      return res.status(404).json({
        message: "User not found",
      });
      
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};
