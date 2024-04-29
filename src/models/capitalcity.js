const pool = require("./pool"); // Import the connection pool for database interactions

// Function to retrieve capital cities based on optional search parameters
const getCapitalCities = async (options = {}) => {
  // Destructure default options with default values if not provided
  const { topN = 1000, searchQuery, continent, region } = options;

  let whereClause = ""; // Initialize the SQL WHERE clause

  // Add conditions to the WHERE clause based on the provided options
  if (continent) {
    // If continent is specified, filter by continent
    whereClause += `WHERE country.Continent = '${continent}' `;
  } else if (region) {
    // If region is specified, filter by region
    whereClause += `WHERE country.Region = '${region}' `;
  }

  if (searchQuery) {
    // If search query is specified, add additional filtering for city, country, continent, or region
    if (whereClause) {
      // If there's already a WHERE clause, add the condition with 'AND'
      whereClause += `AND (city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
    } else {
      // If there's no WHERE clause yet, initialize it with the condition
      whereClause = `WHERE city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
    }
  }

  // Get a connection from the pool to execute the query
  const connection = await pool.getConnection();

  // Execute the query to select capital cities with appropriate joins and filters
  const [rows] = await connection.execute(`
    SELECT city.Name AS CapitalCity, 
           country.Name AS CountryName, 
           city.Population, 
           country.Continent, 
           country.Region
    FROM city
    INNER JOIN country ON city.ID = country.Capital
    ${whereClause}  
    ORDER BY city.Population DESC 
    LIMIT ${topN} 
  `);

  // Release the database connection back to the pool
  connection.release();

  // Return the result rows
  return rows;
};

// Export the function for use in other modules
module.exports = { getCapitalCities };
