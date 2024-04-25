const countryModel = require("../models/country");

const getCountries = async (req, res) => {
  try {
    const countries = await countryModel.getCountries(req.query);
    res.render("country", { rows: countries });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getCountries };
