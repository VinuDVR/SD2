const pool = require("./pool"); // Pool configuration

const getTotalWorldPopulation = async (connection = null) => {
  const conn = connection || (await pool.getConnection());
  const [worldPopulationData] = await conn.execute(`
    SELECT SUM(Population) AS TotalPopulation
    FROM country;
  `);
  if (!connection) {
    conn.release();
  }
  return worldPopulationData[0].TotalPopulation;
};

const getPopulation = async (level, code) => {
  const connection = await pool.getConnection();
  let population = null;
  let cityPopulation = null;
  let nonCityPopulation = null;
  let cityPercentage = null;
  let nonCityPercentage = null;

  switch (level) {
    case 'world':
      {
        const [worldPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city) AS TotalCityPopulation
          FROM country;
        `);

        population = worldPopulationData[0].TotalPopulation;
        cityPopulation = worldPopulationData[0].TotalCityPopulation;
        nonCityPopulation = population - cityPopulation;

        // Calculate percentages
        if (population > 0) {
          cityPercentage = Math.round((cityPopulation / population) * 100);
          nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
        } else {
          cityPercentage = 0;
          nonCityPercentage = 0;
        }
      }
      break;

    case 'continent':
      {
        const [continentPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Continent = ?)) AS TotalCityPopulation
          FROM country
          WHERE Continent = ?;
        `, [code, code]);

        population = continentPopulationData[0].TotalPopulation;
        cityPopulation = continentPopulationData[0].TotalCityPopulation;
        nonCityPopulation = population - cityPopulation;

        if (population > 0) {
          cityPercentage = Math.round((cityPopulation / population) * 100);
          nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
        } else {
          cityPercentage = 0;
          nonCityPercentage = 0;
        }
      
      }
      break;

    case 'region':
      {
        const [regionPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Region = ?)) AS TotalCityPopulation
          FROM country
          WHERE Region = ?;
        `, [code, code]);

        population = regionPopulationData[0].TotalPopulation;
        cityPopulation = regionPopulationData[0].TotalCityPopulation;
        nonCityPopulation = population - cityPopulation;

        if (population > 0) {
          cityPercentage = Math.round((cityPopulation / population) * 100);
          nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
        } else {
          cityPercentage = 0;
          nonCityPercentage = 0;
        }
      
      }
      break;

    case 'country':
      {
        const [countryPopulationData] = await connection.execute(`
          SELECT 
            Population AS TotalPopulation,
            (SELECT SUM(Population) FROM city WHERE CountryCode = ?) AS TotalCityPopulation
          FROM country
          WHERE Code = ?;
        `, [code, code]);

        population = countryPopulationData[0].TotalPopulation;
        cityPopulation = countryPopulationData[0].TotalCityPopulation;
        nonCityPopulation = population - cityPopulation;

        if (population > 0) {
          cityPercentage = Math.round((cityPopulation / population) * 100);
          nonCityPercentage = Math.round((nonCityPopulation / population) * 100);
        } else {
          cityPercentage = 0;
          nonCityPercentage = 0;
        }
      
      }
      break;

    case 'city':
      {
          const [result] = await connection.execute(`
            SELECT 
              Population AS CityPopulation
            FROM 
              city 
            WHERE 
              Name = ?;
          `, [code]);

          cityPopulation = result[0].CityPopulation;
          population = cityPopulation;

        
      }
      break;

    case 'district':
      {
          const [result] = await connection.execute(`
            SELECT 
              SUM(Population) AS TotalPopulation,
              (SELECT SUM(Population) FROM city WHERE District = ?) AS TotalCityPopulation
            FROM city
            WHERE District = ?;
          `, [code, code]);
  
          population = result[0].TotalPopulation;
          cityPopulation = result[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;

        
      }
      break;


      default:
        population = null;
        cityPopulation = null;
        nonCityPopulation = null;
        cityPercentage = null;
        nonCityPercentage = null;
  }

  connection.release();
  return {
    population,
    cityPopulation,
    nonCityPopulation,
    cityPercentage,
    nonCityPercentage,
  };
};

module.exports = { getTotalWorldPopulation, getPopulation };
