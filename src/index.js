/* Import dependencies */
const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser")
const session = require("express-session");


/* Create express instance */
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.use(express.static("static"));


/* Setup database connection pool */
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});


app.use(
  session({
    secret: "your-secret-key", // Use a strong secret key
    resave: false,
    saveUninitialized: false,
  })
);


function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // User is logged in, continue to the next middleware
    return next();
  }

  // User is not logged in, redirect to the login page
  res.redirect("/login");
}

app.get("/", isAuthenticated, (req, res) => {
  res.render('index');
});

app.get('/aboutus', (req, res) => {
  res.render('aboutus'); // Render registration form
});

app.get('/register', (req, res) => {
  res.render('register'); // Render registration form
});

app.get('/login', (req, res) => {
  res.render('login'); // Render login form
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Verify user credentials (implement your own validation)
  const connection = await pool.getConnection();
  const [rows] = await connection.execute(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password]
  );

  if (rows.length > 0) {
    // User found, set session and redirect to the homepage
    req.session.user = { username: rows[0].username };
    res.redirect("/");
  } else {
    res.render("invalidlogin");
  }

  connection.release();
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Implement registration logic
  const connection = await pool.getConnection();
  const [rows] = await connection.execute(
    "SELECT username FROM users WHERE username = ?",
    [username]
  );

  if (rows.length > 0) {
    connection.release();
    res.render("usernameexist");
    return;
  }

  await connection.execute(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password]
  );

  connection.release();
  res.render("register_success");
});

app.get("/logout", (req, res) => {
  req.session.destroy(); // Destroy the session
  res.redirect("/login"); // Redirect to login
});

// Returns an array of cities from the database
app.get("/cities", async (req, res) => {
  try {
    const { topN, searchQuery, continent, region } = req.query;
    const limit = parseInt(topN) || 50; // Default to 10 if topN is not provided or invalid
    let whereClause = "";

    if (continent) {
      whereClause += `WHERE country.Continent = '${continent}' `;
    } else if (region) {
      whereClause += `WHERE country.Region = '${region}' `;
    }

    if (searchQuery) {
      if (whereClause) {
        whereClause += `AND (city.Name LIKE '%${searchQuery}%' OR city.District LIKE '%${searchQuery}%')`;
      } else {
        whereClause = `WHERE city.Name LIKE '%${searchQuery}%' OR city.District LIKE '%${searchQuery}%'`;
      }
    }

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`
      SELECT city.CountryCode, city.Name AS CityName, city.District, city.Population, country.Continent, country.Name AS CountryName, country.Region
      FROM city
      INNER JOIN country ON city.CountryCode = country.Code
      ${whereClause}
      ORDER BY city.Population DESC
      LIMIT ${limit}
    `);
    connection.release(); // Release the connection back to the pool
    res.render("cities", { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/country", async (req, res) => {
  try {
    const { topN, searchQuery, continent, region } = req.query;
    const limit = parseInt(topN) || 50; // Default to 10 if topN is not provided or invalid
    let whereClause = "";

    if (continent) {
      whereClause += `WHERE Continent = '${continent}' `;
    } else if (region) {
      whereClause += `WHERE Region = '${region}' `;
    }

    if (searchQuery) {
      if (whereClause) {
        whereClause += `AND (country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
      } else {
        whereClause = `WHERE country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%'`;
      }
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
    const { topN, searchQuery, continent } = req.query;
    const limit = parseInt(topN) || 50; // Default to 10 if topN is not provided or invalid
    let whereClause = "";

    if (continent) {
      whereClause += `WHERE Continent = '${continent}' `;
    }

    if (searchQuery) {
      if (whereClause) {
        whereClause += `AND (Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%')`;
      } else {
        whereClause = `WHERE Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%'`;
      }
    }

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT Code, Name, Continent, Population FROM country ${whereClause} ORDER BY Population DESC LIMIT ${limit}`);
    connection.release(); // Release the connection back to the pool
    res.render("continent", { rows, fields });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


app.get("/capitalcity", async (req, res) => {
  try {
    const { topN, searchQuery, continent, region } = req.query;
    const limit = parseInt(topN) || 10; // Default to 10 if topN is not provided or invalid
    let whereClause = "";

    if (continent) {
      whereClause += `WHERE Continent = '${continent}' `;
    } else if (region) {
      whereClause += `WHERE Region = '${region}' `;
    }

    if (searchQuery) {
      if (whereClause) {
        whereClause += `AND (city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
      } else {
        whereClause = `WHERE city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%'`;
      }
    }

    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT city.Name AS CapitalCity, country.Name AS CountryName, city.Population, country.Continent, country.Region 
    FROM city
    INNER JOIN country ON city.ID = country.Capital
    ${whereClause}
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
    const { level, code, name = "" } = req.query; // Capture optional name parameter
    let population = null;
    let cityPopulation = null;
    let nonCityPopulation = null;
    let cityPercentage = null;
    let nonCityPercentage = null;

    const connection = await pool.getConnection();

    switch (level) {
      case 'world':
        {
          const [worldPopulationData] = await connection.execute(`
            SELECT 
              SUM(Population) AS TotalPopulation,
              (SELECT SUM(Population) FROM city) AS TotalCityPopulation
            FROM country;
          `);

          population = worldPopulationData[0].TotalPopulation;
          cityPopulation = worldPopulationData[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;

          // Calculate percentages
          if (population > 0) {
            cityPercentage = Math.round((cityPopulation / population) * 100);
            nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
          } else {
            cityPercentage = 0;
            nonCityPercentage = 0;
          }
        }
        break;

      case 'continent':
        {
          const [continentPopulationData] = await connection.execute(`
            SELECT 
              SUM(Population) AS TotalPopulation,
              (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Continent = ?)) AS TotalCityPopulation
            FROM country
            WHERE Continent = ?;
          `, [code, code]);

          population = continentPopulationData[0].TotalPopulation;
          cityPopulation = continentPopulationData[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;

          if (population > 0) {
            cityPercentage = Math.round((cityPopulation / population) * 100);
            nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
          } else {
            cityPercentage = 0;
            nonCityPercentage = 0;
          }
        
        }
        break;

      case 'region':
        {
          const [regionPopulationData] = await connection.execute(`
            SELECT 
              SUM(Population) AS TotalPopulation,
              (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Region = ?)) AS TotalCityPopulation
            FROM country
            WHERE Region = ?;
          `, [code, code]);

          population = regionPopulationData[0].TotalPopulation;
          cityPopulation = regionPopulationData[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;

          if (population > 0) {
            cityPercentage = Math.round((cityPopulation / population) * 100);
            nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
          } else {
            cityPercentage = 0;
            nonCityPercentage = 0;
          }
        
        }
        break;

      case 'country':
        {
          const [countryPopulationData] = await connection.execute(`
            SELECT 
              Population AS TotalPopulation,
              (SELECT SUM(Population) FROM city WHERE CountryCode = ?) AS TotalCityPopulation
            FROM country
            WHERE Code = ?;
          `, [code, code]);

          population = countryPopulationData[0].TotalPopulation;
          cityPopulation = countryPopulationData[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;

          if (population > 0) {
            cityPercentage = Math.round((cityPopulation / population) * 100);
            nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
          } else {
            cityPercentage = 0;
            nonCityPercentage = 0;
          }
        
        }
        break;

      case 'city':
        {
            const [result] = await connection.execute(`
              SELECT 
                Population AS CityPopulation
              FROM 
                city 
              WHERE 
                Name = ?;
            `, [code]);
  
            cityPopulation = result[0].CityPopulation;
            population = cityPopulation;

          
        }
        break;

      case 'district':
        {
            const [result] = await connection.execute(`
              SELECT 
                SUM(Population) AS TotalPopulation,
                (SELECT SUM(Population) FROM city WHERE District = ?) AS TotalCityPopulation
              FROM city
              WHERE District = ?;
            `, [code, code]);
    
            population = result[0].TotalPopulation;
            cityPopulation = result[0].TotalCityPopulation;
            nonCityPopulation = population - cityPopulation;

          
        }
        break;

        default:
          population = null;
          cityPopulation = null;
          nonCityPopulation = null;
          cityPercentage = null;
          nonCityPercentage = null;
      }
  
      connection.release(); // Release the connection back to the pool
  
      res.render("population", {
        name, // Include the user-inserted name
        population,
        cityPopulation,
        nonCityPopulation,
        cityPercentage,
        nonCityPercentage,
      });
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
