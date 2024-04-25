const userModel = require("../models/user");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await userModel.getUserByUsername(username);
    
    if (users.length > 0 && users[0].password === password) {
      req.session.user = { username: users[0].username };
      return res.redirect("/");
    } else {
      return res.render("invalidlogin");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await userModel.getUserByUsername(username);

    if (existingUser.length > 0) {
      return res.render("usernameexist");
    }

    await userModel.createUser(username, password);

    res.render("register_success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { login, register };
