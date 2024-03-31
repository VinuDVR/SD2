
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const citiesController = require('../controllers/citiesController');
const continentController = require('../controllers/continentController');
const capitalcityController = require('../controllers/capitalcityController');


router.get('/countries', countryController.getCountries);
router.get('/cities', citiesController.getCities);
router.get('/continent', continentController.getContinent);
router.get('/capitalcity', capitalcityController.getCapitalCity);

module.exports = router;
