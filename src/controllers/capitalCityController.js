const capitalCityModel = require("../models/capitalcity");

const getCapitalCities = async (req, res) => {
  try {
    const capitalCities = await capitalCityModel.getCapitalCities(req.query);
    res.render("capitalcity", { rows: capitalCities });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getCapitalCities };
