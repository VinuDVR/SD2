// Import the connection pool to interact with the database
const pool = require("./pool"); 

// Import the function to get the total world population
const { getTotalWorldPopulation } = require("./population"); 

// Function to retrieve the most spoken languages and their corresponding populations
const getLanguages = async () => {
  // Acquire a database connection from the connection pool
  const connection = await pool.getConnection(); 

  // Execute a SQL query to get the population for specific languages
  const [languagesData] = await connection.execute(`
    SELECT 
      cl.Language,  
      SUM(c.Population) AS TotalPopulation  
    FROM 
      countrylanguage cl  
    JOIN 
      country c ON cl.CountryCode = c.Code  
    WHERE 
      cl.Language IN ('Chinese', 'English', 'Hindi', 'Spanish', 'Arabic')  
    GROUP BY 
      cl.Language  
    ORDER BY 
      TotalPopulation DESC;  
  `);

  // Fetch the total world population for calculating language percentage
  const totalWorldPopulation = await getTotalWorldPopulation(connection);

  // Calculate the percentage of the world population for each language
  const languagesWithPercentage = languagesData.map((languageData) => {
    // Calculate the percentage of the world's population that speaks this language
    const percentage = ((languageData.TotalPopulation / totalWorldPopulation) * 100).toFixed(2);

    // Return an object with the language, total population, and calculated percentage
    return {
      language: languageData.Language,
      population: languageData.TotalPopulation,
      percentage,  // Convert to fixed two decimal places
    };
  });

  // Release the database connection back to the pool
  connection.release(); 

  // Return the list of languages with their corresponding population and percentage
  return languagesWithPercentage;
};

// Export the function for use in other modules
module.exports = { getLanguages }; 
