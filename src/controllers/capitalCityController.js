// Import the model for capital cities, which contains the logic for retrieving capital city data from the database
const capitalCityModel = require("../models/capitalcity");

// Asynchronous controller function to handle HTTP requests to get capital cities
const getCapitalCities = async (req, res) => {
  try {
    // Retrieve capital cities from the model, passing in the query parameters from the request
    const capitalCities = await capitalCityModel.getCapitalCities(req.query);

    // Render the 'capitalcity' view template and pass the retrieved capital cities to it
    res.render("capitalcity", { rows: capitalCities });
  } catch (err) {
    // If an error occurs, log the error message to the console
    console.error(err);

    // Respond to the client with a 500 status code indicating an internal server error
    res.status(500).send("Internal Server Error");
  }
};

// Export the controller function for use in other parts of the application
module.exports = { getCapitalCities };
