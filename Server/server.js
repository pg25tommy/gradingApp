const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80; // Default to 80, or change if needed

// Serve static files from Grading_test_web_app
app.use(express.static(path.join(__dirname, "..", "Grading_test_web_app")));

// Route for root URL (serves index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "index.html"));
});

// Route for grading page
app.get("/grading.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "grading.html"));
});

// Route to serve users.json
app.get("/users.json", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "users.json"));
});

// Start the server and listen on all available network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at: http://0.0.0.0:${PORT}`);
  console.log(`🔹 Accessible Locally: http://127.0.0.1:${PORT}`);
  console.log(`🌍 Accessible via Public IP (if configured): http://YOUR_PUBLIC_IP:${PORT}`);
});
