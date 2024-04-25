const pool = require("./pool"); // Pool configuration
const { getTotalWorldPopulation } = require("./population");

const getLanguages = async () => {
  const connection = await pool.getConnection();

  const [languagesData] = await connection.execute(`
    SELECT cl.Language, SUM(c.Population) AS TotalPopulation
    FROM countrylanguage cl
    JOIN country c ON cl.CountryCode = c.Code
    WHERE cl.Language IN ('Chinese', 'English', 'Hindi', 'Spanish', 'Arabic')
    GROUP BY cl.Language
    ORDER BY TotalPopulation DESC;
  `);

  const totalWorldPopulation = await getTotalWorldPopulation(connection);

  const languagesWithPercentage = languagesData.map((languageData) => {
    const percentage = ((languageData.TotalPopulation / totalWorldPopulation) * 100).toFixed(2);
    return {
      language: languageData.Language,
      population: languageData.TotalPopulation,
      percentage,
    };
  });

  connection.release();

  return languagesWithPercentage;
};

module.exports = { getLanguages };
