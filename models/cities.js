const pool = require('../db');

class Cities {
  static async getAll(req) {
    try {
      const { topN } = req.query;
      const limit = parseInt(topN) || 10; 
      const [rows, fields] = await pool.execute(`SELECT CountryCode, Name, District, Population FROM city ORDER BY Population DESC LIMIT ${limit}`);
      return rows;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}

module.exports = Cities;
