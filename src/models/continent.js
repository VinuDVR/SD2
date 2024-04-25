const pool = require("./pool"); // Pool configuration

const getContinents = async (options = {}) => {
  const { topN = 50, searchQuery, continent } = options;
  let whereClause = "";

  if (continent) {
    whereClause += `WHERE Continent = '${continent}' `;
  }

  if (searchQuery) {
    if (whereClause) {
      whereClause += `AND (Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%')`;
    } else {
      whereClause = `WHERE Code LIKE '%${searchQuery}%' OR Name LIKE '%${searchQuery}%' OR Continent LIKE '%${searchQuery}%')`;
    }
  }

  const connection = await pool.getConnection();
  const [rows] = await connection.execute(`
    SELECT Code, Name, Continent, Population 
    FROM country 
    ${whereClause}
    ORDER BY Population DESC 
    LIMIT ${topN}
  `);
  connection.release();

  return rows;
};

module.exports = { getContinents };
