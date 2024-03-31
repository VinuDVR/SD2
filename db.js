const mysql = require("mysql2/promise");

/* Setup database connection pool */
const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    user: "user",
    password: "password",
    database: "world",
  });

  module.exports = pool;