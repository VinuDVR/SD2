const continentModel = require("../models/continent"); // Import the continent model for database interactions

// Asynchronous controller function to handle HTTP requests for retrieving continents
const getContinents = async (req, res) => {
  try {
    // Call the model function to get a list of continents based on query parameters from the request
    const continents = await continentModel.getContinents(req.query);

    // Render the "continent" view template with the data of retrieved continents
    res.render("continent", { rows: continents });
  } catch (err) {
    // If an error occurs, log it to the console
    console.error(err);

    // Send a 500 (Internal Server Error) HTTP status code to the client
    res.status(500).send("Internal Server Error");
  }
};

// Export the controller function for use in routing
module.exports = { getContinents };
