const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "user",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "world",
});

const getCities = async (options = {}) => {
  const { topN = 50, searchQuery, continent, region } = options;
  let whereClause = "";

  if (continent) {
    whereClause += `WHERE country.Continent = '${continent}' `;
  } else if (region) {
    whereClause += `WHERE country.Region = '${region}' `;
  }

  if (searchQuery) {
    whereClause += whereClause ? `AND` : `WHERE`;
    whereClause += ` (city.Name LIKE '%${searchQuery}%' OR city.District LIKE '%${searchQuery}%')`;
  }

  const connection = await pool.getConnection();
  const [rows] = await connection.execute(`
    SELECT city.CountryCode, city.Name AS CityName, city.District, city.Population, 
           country.Continent, country.Name AS CountryName, country.Region
    FROM city
    INNER JOIN country ON city.CountryCode = country.Code
    ${whereClause}
    ORDER BY city.Population DESC
    LIMIT ${topN}
  `);
  connection.release();

  return rows;
};

module.exports = { getCities };
