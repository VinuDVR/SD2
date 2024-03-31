const pool = require('../db');

class Country {
  static async getAll(req) {
    try {
      const { topN } = req.query;
      const limit = parseInt(topN) || 10; 
      const [rows, fields] = await pool.execute(`SELECT country.Code, country.Name, country.Continent, country.Region, 
      city.Name AS CapitalCity, country.Population 
      FROM country 
      JOIN city ON country.Capital = city.ID 
      ORDER BY country.Population DESC 
      LIMIT ${limit}`);
      return rows;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}

module.exports = Country;
