const pool = require('../db');

class CapitalCity {
  static async getAll(req) {
    try {
      const { topN } = req.query;
      const limit = parseInt(topN) || 10; 
      const [rows, fields] = await pool.execute(`SELECT city.Name AS CapitalCity, country.Name AS CountryName, city.Population 
      FROM city
      INNER JOIN country ON city.ID = country.Capital
      ORDER BY city.Population DESC
      LIMIT ${limit}`);
      return rows;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}

module.exports = CapitalCity;
