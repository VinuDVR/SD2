const express = require('express');
const bcrypt = require('bcrypt');  // For password hashing

const router = express.Router();

// ... other imports and variables (database connection pool, etc.)

// Route to handle login form submission (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find user by username
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(`SELECT * FROM users WHERE username = ?`, [username]);
    connection.release();

    const user = rows[0];  // Assuming only one user with the username

    // 2. Check if user exists and compare password hash
    if (user && await bcrypt.compare(password, user.password)) {
      // Login successful
      req.session.user = user;  // Set session data (replace with JWT if preferred)
      res.redirect('/profile');  // Redirect to protected page
    } else {
      res.render('login', { error: 'Invalid username or password' });  // Login failed
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;