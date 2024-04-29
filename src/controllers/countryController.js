const countryModel = require("../models/country"); // Import the country model for database interaction

// Controller function to handle requests for retrieving countries
const getCountries = async (req, res) => {
  try {
    // Retrieve the countries from the model using the query parameters from the request
    const countries = await countryModel.getCountries(req.query);

    // Render the "country" view, passing the retrieved countries as data
    res.render("country", { rows: countries });
  } catch (err) {
    // If an error occurs during data retrieval or rendering, log the error
    console.error(err);

    // Send a 500 Internal Server Error response to the client
    res.status(500).send("Internal Server Error");
  }
};

// Export the controller function for use in other modules/routes
module.exports = { getCountries };
