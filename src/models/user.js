const pool = require("./pool"); // Import the connection pool for database interactions

// Function to retrieve user information by username
const getUserByUsername = async (username) => {
  // Get a connection from the pool to execute the query
  const connection = await pool.getConnection();
  
  // Execute a parameterized query to retrieve user information based on the username
  const [rows] = await connection.execute(
    "SELECT * FROM users WHERE username = ?", // SQL query with a placeholder for username
    [username] // Array of parameters to substitute into the query
  );
  
  // Release the connection back to the pool after executing the query
  connection.release();
  
  // Return the result rows, which contains the user information
  return rows;
};

// Function to create a new user with the given username and password
const createUser = async (username, password) => {
  // Get a connection from the pool to execute the query
  const connection = await pool.getConnection();
  
  // Execute a parameterized query to insert a new user into the 'users' table
  await connection.execute(
    "INSERT INTO users (username, password) VALUES (?, ?)", // SQL query with placeholders for username and password
    [username, password] // Array of parameters to substitute into the query
  );
  
  // Release the connection back to the pool after inserting the new user
  connection.release();
};

// Export the functions for use in other parts of the application
module.exports = { getUserByUsername, createUser };
