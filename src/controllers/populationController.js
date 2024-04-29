const populationModel = require("../models/population"); // Import the population model to interact with data

// Asynchronous function to get population data based on query parameters
const getPopulation = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { level, code, name = "" } = req.query;

    // Get population data based on the provided level and code
    const populationData = await populationModel.getPopulation(level, code);

    // Render the 'population' view with data from the population model
    res.render("population", {
      name, // Include a name if provided in the query parameters
      population: populationData.population, // Total population
      cityPopulation: populationData.cityPopulation, // Population in cities
      nonCityPopulation: populationData.nonCityPopulation, // Population outside cities
      cityPercentage: populationData.cityPercentage, // Percentage of population in cities
      nonCityPercentage: populationData.nonCityPercentage, // Percentage of population outside cities
    });
  } catch (err) {
    // Handle any errors during the process
    console.error(err); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Send an error response with a 500 status code
  }
};

module.exports = { getPopulation }; // Export the function to be used in other modules
