
const CapitalCity = require('../models/capitalcity');

exports.getCapitalCity = async (req, res) => {
  try {
    const countries = await CapitalCity.getAll();
    res.render('capitalcity', { capitalcity }); 
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).send('Internal Server Error');
  }
};
