const cityModel = require("../models/city"); // Import the city model to interact with city-related data in the database

// Controller function to handle requests to retrieve cities
const getCities = async (req, res) => {
  try {
    // Use the city model to fetch cities based on the request query parameters
    const cities = await cityModel.getCities(req.query);

    // Render the 'cities' view/template, passing in the retrieved cities as 'rows'
    res.render("cities", { rows: cities });
  } catch (err) {
    // Log any errors to the console for debugging
    console.error(err);

    // Respond with an HTTP 500 status indicating an internal server error
    res.status(500).send("Internal Server Error");
  }
};

// Export the controller function to be used in other parts of the application
module.exports = { getCities };
