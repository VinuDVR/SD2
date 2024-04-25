const pool = require("./pool"); // Pool configuration

const getCapitalCities = async (options = {}) => {
  const { topN = 50, searchQuery, continent, region } = options;
  let whereClause = "";

  if (continent) {
    whereClause += `WHERE country.Continent = '${continent}' `;
  } else if (region) {
    whereClause += `WHERE country.Region = '${region}' `;
  }

  if (searchQuery) {
    if (whereClause) {
      whereClause += `AND (city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
    } else {
      whereClause = `WHERE city.Name LIKE '%${searchQuery}%' OR country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
    }
  }

  const connection = await pool.getConnection();
  const [rows] = await connection.execute(`
    SELECT city.Name AS CapitalCity, country.Name AS CountryName, city.Population, country.Continent, country.Region
    FROM city
    INNER JOIN country ON city.ID = country.Capital
    ${whereClause}
    ORDER BY city.Population DESC
    LIMIT ${topN}
  `);
  connection.release();

  return rows;
};

module.exports = { getCapitalCities };
