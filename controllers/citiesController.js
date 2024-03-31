const Cities = require('../models/cities');

exports.getCities = async (req, res) => {
  try {
    const cities = await Cities.getAll();
    res.render('cities', { cities }); 
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).send('Internal Server Error');
  }
};
