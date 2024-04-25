const languageModel = require("../models/languages");

const getLanguages = async (req, res) => {
  try {
    const languages = await languageModel.getLanguages();
    res.render("languages", { languages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getLanguages };
