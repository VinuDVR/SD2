const pool = require("./pool"); // Adjust according to where your pool configuration is located

const getUserByUsername = async (username) => {
  const connection = await pool.getConnection();
  const [rows] = await connection.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  connection.release();
  return rows;
};

const createUser = async (username, password) => {
  const connection = await pool.getConnection();
  await connection.execute(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password]
  );
  connection.release();
};

module.exports = { getUserByUsername, createUser };
