// Import the connection pool for database interactions
const pool = require("./pool"); 

// Function to get the total world population. Accepts an optional connection to reuse.
const getTotalWorldPopulation = async (connection = null) => {
  // Use the provided connection or create a new one from the pool
  const conn = connection || (await pool.getConnection());

  // Execute the SQL query to sum the population of all countries
  const [worldPopulationData] = await conn.execute(`
    SELECT SUM(Population) AS TotalPopulation
    FROM country;
  `);

  // If a new connection was created, release it back to the pool
  if (!connection) {
    conn.release();
  }

  // Return the total world population from the query result
  return worldPopulationData[0].TotalPopulation;
};

// Function to get population information at different levels (world, continent, region, country, city, district)
const getPopulation = async (level, code) => {
  const connection = await pool.getConnection(); // Get a connection from the pool

  // Initialize variables to store population data and percentages
  let population = null;
  let cityPopulation = null;
  let nonCityPopulation = null;
  let cityPercentage = null;
  let nonCityPercentage = null;

  // Check the level to determine which query to run
  switch (level) {
    case 'world':
      {
        // Query to get the total world population and total city population
        const [worldPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city) AS TotalCityPopulation
          FROM country;
        `);

        // Calculate populations and percentages
        population = worldPopulationData[0].TotalPopulation;
        cityPopulation = worldPopulationData[0].TotalCityPopulation;
        nonCityPopulation = population - cityPopulation;

        if (population > 0) {
          cityPercentage = Math.round((cityPopulation / population) * 100); // City population as percentage of total
          nonCityPercentage = Math.round((nonCityPopulation / population) * 100); // Non-city population percentage
        } else {
          cityPercentage = 0;
          nonCityPercentage = 0;
        }
      }
      break;

    case 'continent':
      {
        // Query to get the total population and city population for a specific continent
        const [continentPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Continent = ?)) AS TotalCityPopulation
          FROM country
          WHERE Continent = ?;
        `, [code, code]);

        // Calculate populations and percentages
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
        // Query to get the total population and city population for a specific region
        const [regionPopulationData] = await connection.execute(`
          SELECT 
            SUM(Population) AS TotalPopulation,
            (SELECT SUM(Population) FROM city WHERE CountryCode IN (SELECT Code FROM country WHERE Region = ?)) AS TotalCityPopulation
          FROM country
          WHERE Region = ?;
        `, [code, code]);

        // Calculate populations and percentages
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
        // Query to get the total population and city population for a specific country
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
        // Query to get the population of a specific city
          const [cityPopulationData] = await connection.execute(`
            SELECT 
              Population AS CityPopulation
            FROM 
              city 
            WHERE 
              Name = ?;
          `, [code]);

          cityPopulation = cityPopulationData[0].CityPopulation; // Retrieve city population
          population = cityPopulation;
      }
      break;

    case 'district':
      {
        // Query to get the total population and city population for a specific district
          const [districtPopulationData] = await connection.execute(`
            SELECT 
              SUM(Population) AS TotalPopulation,
              (SELECT SUM(Population) FROM city WHERE District = ?) AS TotalCityPopulation
            FROM city
            WHERE District = ?;
          `, [code, code]);

          population = districtPopulationData[0].TotalPopulation; 
          cityPopulation = districtPopulationData[0].TotalCityPopulation;
          nonCityPopulation = population - cityPopulation;
      }
      break;

    default:
      // Default case where no valid level is provided
      population = null;
      cityPopulation = null;
      nonCityPopulation = null;
      cityPercentage = null;
      nonCityPercentage = null;
  }

  connection.release(); // Release the connection back to the pool

  // Return an object containing population data and percentages
  return {
    population,
    cityPopulation,
    nonCityPopulation,
    cityPercentage,
    nonCityPercentage,
  };
};

// Export the functions for use in other modules
module.exports = { getTotalWorldPopulation, getPopulation };
