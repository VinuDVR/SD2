const mysql = require("mysql2/promise"); // Import MySQL library for promise-based database interactions

// Create a connection pool to manage multiple database connections
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost", // Database host (default is "localhost")
  user: process.env.DATABASE_USER || "user", // Database user (default is "user")
  password: process.env.DATABASE_PASSWORD || "password", // Database password (default is "password")
  database: process.env.DATABASE_NAME || "world", // Default database to connect to (here, "world")
});

// Function to retrieve cities from the database based on optional search criteria
const getCities = async (options = {}) => {
  // Destructure options with default values if not provided
  const { topN = 1000, searchQuery, continent, region } = options;

  let whereClause = ""; // Initialize the SQL WHERE clause as empty

  // Add filtering conditions to the WHERE clause based on provided options
  if (continent) {
    // If a continent is specified, filter by continent
    whereClause += `WHERE country.Continent = '${continent}' `;
  } else if (region) {
    // If a region is specified, filter by region
    whereClause += `WHERE country.Region = '${region}' `;
  }

  if (searchQuery) {
    // If a search query is provided, add a condition to filter by city name or district
    // Determine whether to append with 'AND' or initialize with 'WHERE'
    whereClause += whereClause ? ` AND` : ` WHERE`;
    // Apply the search condition with LIKE operator for partial matching
    whereClause += ` (city.Name LIKE '%${searchQuery}%' OR city.District LIKE '%${searchQuery}%')`;
  }

  // Get a connection from the pool to execute the query
  const connection = await pool.getConnection();

  // Execute the SQL query with appropriate joins, filters, and sorting
  const [rows] = await connection.execute(`
    SELECT city.CountryCode,  
           city.Name AS CityName,  
           city.District,  
           city.Population,  
           country.Continent,  
           country.Name AS CountryName,  
           country.Region  
    FROM city
    INNER JOIN country ON city.CountryCode = country.Code  
    ${whereClause}  
    ORDER BY city.Population DESC  
    LIMIT ${topN} 
  `);

  // Release the connection back to the pool after query execution
  connection.release();

  // Return the resulting rows from the query
  return rows;
};

// Export the function for use in other modules
module.exports = { getCities };
