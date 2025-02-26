const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from Grading_test_web_app
app.use(express.static(path.join(__dirname, "..", "Grading_test_web_app")));

// Route for /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "index.html"));
});

// Optional route for users.json
app.get("/users.json", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "users.json"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
