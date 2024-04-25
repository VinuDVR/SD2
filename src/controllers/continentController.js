const continentModel = require("../models/continent");

const getContinents = async (req, res) => {
  try {
    const continents = await continentModel.getContinents(req.query);
    res.render("continent", { rows: continents });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getContinents };
