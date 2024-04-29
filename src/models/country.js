const mysql = require("mysql2/promise"); // Import the MySQL library with promise support
const pool = require("./pool"); // Import the pool configuration for database connections

// Function to retrieve countries with optional filtering
const getCountries = async (options = {}) => {
  // Destructure optional parameters with default values
  const { topN = 1000, searchQuery, continent, region } = options;

  let whereClause = ""; // Initialize the SQL WHERE clause

  // Check if 'continent' is provided and append it to the WHERE clause
  if (continent) {
    whereClause += `WHERE Continent = '${continent}' `;
  } else if (region) {
    // Otherwise, check if 'region' is provided and append it to the WHERE clause
    whereClause += `WHERE Region = '${region}' `;
  }

  // If 'searchQuery' is provided, add it to the WHERE clause
  if (searchQuery) {
    // If there's an existing WHERE clause, append 'AND' to add more conditions
    whereClause += whereClause ? `AND` : `WHERE`; // Ensure correct use of 'AND' or 'WHERE'
    whereClause += ` (country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`; // Condition for search query
  }

  // Retrieve a connection from the pool to execute the query
  const connection = await pool.getConnection();

  // Execute the query to select countries with specific fields and optional filtering
  const [rows] = await connection.execute(`
    SELECT country.Code,  
           country.Name,  
           country.Continent,  
           country.Region,  
           city.Name AS CapitalCity,  
           country.Population  
    FROM country  
    JOIN city ON country.Capital = city.ID  
    ${whereClause}  
    ORDER BY country.Population DESC  
    LIMIT ${topN}  
  `);

  // Release the connection back to the pool
  connection.release();

  // Return the result set
  return rows;
};

// Export the function to be used in other modules
module.exports = { getCountries };
