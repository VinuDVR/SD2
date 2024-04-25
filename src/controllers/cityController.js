const cityModel = require("../models/city");

const getCities = async (req, res) => {
  try {
    const cities = await cityModel.getCities(req.query);
    res.render("cities", { rows: cities });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getCities };
