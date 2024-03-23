/* Import dependencies */
const express = require("express");
const mysql = require("mysql2/promise");

/* Create express instance */
const app = express();
const port = 3000;

app.set("view engine", "pug");

app.use(express.static("static"));

/* Setup database connection pool */
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});

/* Landing route */
app.get("/", (req, res) => {
  res.render("index");
});

// Returns an array of cities from the database
app.get("/cities", async (req, res) => {
  try {
    const { topN } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT CountryCode, Name, District, Population FROM city ORDER BY Population DESC LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("cities", { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/country", async (req, res) => {
  try {
    const { topN } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT Code, Name, Continent, Region, Capital, Population FROM country ORDER BY Population DESC LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("country", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/continent", async (req, res) => {
  try {
    const { topN } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT Code, Name, Continent FROM country LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("continent", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/regions", async (req, res) => {
  try {
    const { topN } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT Code, Name, Region FROM country LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("region", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
