const populationModel = require("../models/population");

const getPopulation = async (req, res) => {
  try {
    const { level, code, name = "" } = req.query;


    const populationData = await populationModel.getPopulation(level, code);

    res.render("population", {
      name,
      population: populationData.population,
      cityPopulation: populationData.cityPopulation,
      nonCityPopulation: populationData.nonCityPopulation,
      cityPercentage: populationData.cityPercentage,
      nonCityPercentage: populationData.nonCityPercentage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getPopulation };
