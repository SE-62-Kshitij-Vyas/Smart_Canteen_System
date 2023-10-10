<?php
// Database connection details
$host = "localhost"; // Your MySQL host
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$database = "canteen"; // Your database name

// Establish a connection to the database
$conn = new mysqli($host, $username, $password, $database);

// Check for database connection errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve user input from the form
$username = $_POST['username'];
$password = $_POST['password'];

// Query to check if the user exists
$sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // User exists and credentials are correct
    // Redirect to the user's dashboard or another page
    header("Location: dashboard.php");
    exit();
} else {
    // Invalid credentials
    echo "Invalid username or password. <a href='home.html'>Try again</a>";
}

// Close the database connection
$conn->close();
?>

