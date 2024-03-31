const Continent = require('../models/continent');

exports.getContinent = async (req, res) => {
  try {
    const cities = await Continent.getAll();
    res.render('continent', { continent }); 
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).send('Internal Server Error');
  }
};
