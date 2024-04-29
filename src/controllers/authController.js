// Import the user model to interact with the user data in the database
const userModel = require("../models/user");

// Function to handle user login
const login = async (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  try {
    // Get user data from the database by the provided username
    const users = await userModel.getUserByUsername(username);

    // Check if a user exists with the given username and if the provided password matches
    if (users.length > 0 && users[0].password === password) {
      // If login is successful, create a session for the user
      req.session.user = { username: users[0].username };

      // Redirect to the homepage or desired location upon successful login
      return res.redirect("/");
    } else {
      // If login fails (no matching user or incorrect password), render an invalid login page
      return res.render("invalidlogin");
    }
  } catch (err) {
    // Handle any errors that occur during database access or other operations
    console.error(err); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Respond with a 500 status for server errors
  }
};

// Function to handle user registration
const register = async (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  try {
    // Check if a user already exists with the given username
    const existingUser = await userModel.getUserByUsername(username);

    if (existingUser.length > 0) {
      // If the username already exists, render a page indicating the username is taken
      return res.render("usernameexist");
    }

    // Create a new user in the database with the provided username and password
    await userModel.createUser(username, password);

    // Render a success page upon successful registration
    res.render("register_success");
  } catch (err) {
    // Handle any errors that occur during the user creation process
    console.error(err); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Respond with a 500 status for server errors
  }
};

// Export the login and register functions for use in other parts of the application
module.exports = { login, register };
