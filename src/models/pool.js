const mysql = require("mysql2/promise");

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "user",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "world",
  waitForConnections: true,
  connectionLimit: 10, // Adjust according to your needs
  queueLimit: 0,
});

module.exports = pool;
