const pool = require("./pool"); // Import the connection pool for database access

// Asynchronous function to get country details with optional filtering and limits
const getContinents = async (options = {}) => {
  // Default options: topN results to fetch, and optional search and continent filters
  const { topN = 1000, searchQuery, continent } = options;

  let whereClause = ""; // Initialize the SQL WHERE clause

  // If a specific continent is provided, filter countries by continent
  if (continent) {
    whereClause += `WHERE Continent = '${continent}' `;
  }

  // If a search query is provided, add conditions to the WHERE clause
  if (searchQuery) {
    // If there's already a WHERE clause, add additional conditions with 'AND'
    if (whereClause) {
      whereClause += `AND (Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%')`;
    } else {
      // If there's no WHERE clause, create it with the search conditions
      whereClause = `WHERE Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%')`;
    }
  }

  // Get a database connection from the pool
  const connection = await pool.getConnection();

  // Execute the SQL query to fetch country information
  const [rows] = await connection.execute(`
    SELECT Code, Name, Continent, Population 
    FROM country 
    ${whereClause}  
    ORDER BY Population DESC  
    LIMIT ${topN}  
  `);

  // Release the connection back to the pool
  connection.release();

  // Return the result set (an array of rows)
  return rows;
};

// Export the function for use in other parts of the application
module.exports = { getContinents };
