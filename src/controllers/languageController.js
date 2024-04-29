// Import the language model to interact with the languages data in the database
const languageModel = require("../models/languages");

// Async function to handle requests for getting a list of languages
const getLanguages = async (req, res) => {
  try {
    // Attempt to retrieve languages from the database using the language model
    const languages = await languageModel.getLanguages();

    // Render the 'languages' view, passing the retrieved languages data
    res.render("languages", { languages });
  } catch (err) {
    // If an error occurs during the retrieval process
    console.error(err);  // Log the error for debugging purposes

    // Respond with an HTTP 500 status (Internal Server Error) and an appropriate message
    res.status(500).send("Internal Server Error");
  }
};

// Export the getLanguages function for use in other modules
module.exports = { getLanguages };
