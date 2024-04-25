const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const cityController = require("./controllers/cityController");
const countryController = require("./controllers/countryController");
const continentController = require("./controllers/continentController");
const capitalCityController = require("./controllers/capitalCityController");
const authController = require("./controllers/authController");
const populationController = require("./controllers/populationController");
const languageController = require("./controllers/languageController");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("static"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// Routes
app.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", authController.login);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", authController.register);

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

app.get("/cities", cityController.getCities);
app.get("/country", countryController.getCountries);
app.get("/continent", continentController.getContinents);
app.get("/capitalcity", capitalCityController.getCapitalCities);

app.get("/population", populationController.getPopulation);

app.get("/languages", languageController.getLanguages);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
