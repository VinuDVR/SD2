const Country = require('../models/country');

exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.getAll();
    res.render('country', { countries }); // Assuming you have a view named 'country'
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).send('Internal Server Error');
  }
};
