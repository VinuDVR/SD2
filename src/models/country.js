const mysql = require("mysql2/promise");
const pool = require("./pool"); // Adjust according to where your pool configuration is located

const getCountries = async (options = {}) => {
  const { topN = 50, searchQuery, continent, region } = options;
  let whereClause = "";

  if (continent) {
    whereClause += `WHERE Continent = '${continent}' `;
  } else if (region) {
    whereClause += `WHERE Region = '${region}' `;
  }

  if (searchQuery) {
    whereClause += whereClause ? `AND` : `WHERE`;
    whereClause += ` (country.Name LIKE '%${searchQuery}%' OR country.Continent LIKE '%${searchQuery}%' OR country.Region LIKE '%${searchQuery}%')`;
  }

  const connection = await pool.getConnection();
  const [rows] = await connection.execute(`
    SELECT country.Code, country.Name, country.Continent, country.Region, 
           city.Name AS CapitalCity, country.Population 
    FROM country 
    JOIN city ON country.Capital = city.ID
    ${whereClause} 
    ORDER BY country.Population DESC 
    LIMIT ${topN}
  `);
  connection.release();

  return rows;
};

module.exports = { getCountries };
