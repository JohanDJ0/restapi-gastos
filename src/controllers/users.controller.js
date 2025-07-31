import { pool } from "../db.js";

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wron",
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
    return res.status(500).json({
      message: "Something goes wron",
    });
  }
};

export const createUser = async (req, res) => {
  const { name } = req.body;
  try {
    const [rows] = await pool.query("INSERT INTO users (name) VALUES (?)", [
      name,
    ]);
    res.send({
      id: rows.insertId,
      name,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wron",
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
    return res.status(500).json({
      message: "Something goes wron",
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ? WHERE id = ?",
      [name, id]
    );
    console.log(result);
    if (result.affectedRows === 0)
      return res.status(404).json({
        message: "User not found",
      });
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wron",
    });
  }
};
