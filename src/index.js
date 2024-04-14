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
    const { topN, searchQuery } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid
    let whereClause = "";


    if(searchQuery) {
      whereClause = `WHERE Name LIKE '%${searchQuery}%' OR District LIKE '%${searchQuery}%'`
    }


    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT CountryCode, Name, District, Population FROM city ${whereClause} ORDER BY Population DESC LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("cities", { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/country", async (req, res) => {
  try {
    const { topN, continent, region } = req.query;
    const limit = parseInt(topN) || 50; // Default to 10 if topN is not provided or invalid
    let whereClause = "";

    if (continent) {
      whereClause += `WHERE Continent = '${continent}' `;
    } else if (region) {
      whereClause += `WHERE Region = '${region}' `;
    }
    
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT country.Code, country.Name, country.Continent, country.Region, 
    city.Name AS CapitalCity, country.Population 
    FROM country 
    JOIN city ON country.Capital = city.ID
    ${whereClause} 
    ORDER BY country.Population DESC 
    LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("country", { rows, fields});
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
    const [rows, fields] = await connection.execute(`SELECT Code, Name, Continent, Population FROM country ORDER BY Population DESC LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("continent", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/capitalcity", async (req, res) => {
  try {
    const { topN } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT city.Name AS CapitalCity, country.Name AS CountryName, city.Population 
    FROM city
    INNER JOIN country ON city.ID = country.Capital
    ORDER BY city.Population DESC
    LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("capitalcity", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/population", async (req, res) => {
  try {
    const { level, code } = req.query;
    let population;

    // Handle the case when level is not provided
    if (!level) {
      res.render("population", { population: null });
      return;
    }

    const connection = await pool.getConnection();

    switch (level) {
      case 'world':
        [population] = await connection.execute(`
          SELECT SUM(Population) AS TotalPopulation FROM country;
        `);
        break;
      case 'continent':
        [population] = await connection.execute(`
          SELECT SUM(Population) AS TotalPopulation FROM country WHERE Continent = ?;
        `, [code || null]);
        break;
      case 'region':
        [population] = await connection.execute(`
          SELECT SUM(Population) AS TotalPopulation FROM country WHERE Region = ?;
        `, [code || null]);
        break;
      case 'country':
        [population] = await connection.execute(`
          SELECT Population FROM country WHERE Code = ?;
        `, [code || null]);
        break;
      case 'district':
        [population] = await connection.execute(`
          SELECT SUM(Population) AS TotalPopulation FROM city WHERE District = ?;
        `, [code || null]);
        break;
      case 'city':
        [population] = await connection.execute(`
          SELECT Population FROM city WHERE Name = ?;
        `, [code || null]);
        break;
      default:
        population = null;
    }

    connection.release(); // Release the connection back to the pool

    res.render("population", { population: population[0].TotalPopulation || population[0].Population });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

async function getTotalWorldPopulation(connection) {
  const [worldPopulationData] = await connection.execute(`
    SELECT SUM(Population) AS TotalPopulation
    FROM country;
  `);
  return worldPopulationData[0].TotalPopulation;
}

app.get("/languages", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [languagesData] = await connection.execute(`
      SELECT cl.Language, SUM(c.Population) AS TotalPopulation
      FROM countrylanguage cl
      JOIN country c ON cl.CountryCode = c.Code
      WHERE cl.Language IN ('Chinese', 'English', 'Hindi', 'Spanish', 'Arabic')
      GROUP BY cl.Language
      ORDER BY TotalPopulation DESC;
    `);

    const totalWorldPopulation = await getTotalWorldPopulation(connection);

    const languagesWithPercentage = languagesData.map(languageData => {
      const percentage = ((languageData.TotalPopulation / totalWorldPopulation) * 100).toFixed(2);
      return {
        language: languageData.Language,
        population: languageData.TotalPopulation,
        percentage: percentage
      };
    });

    connection.release();

    res.render("languages", { languages: languagesWithPercentage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});




// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
