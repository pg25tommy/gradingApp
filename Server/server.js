require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

// Debug: Log if environment variables are loaded (With Icons 🛠️ ✅ ⚠️)
console.log("🛠️  ENV Loaded: ", process.env.ADMIN_USERNAME, process.env.USER_USERNAME, process.env.BETA1_USERNAME);
if (!process.env.ADMIN_USERNAME || !process.env.USER_USERNAME) {
    console.log("⚠️  WARNING: Some environment variables are missing!");
}

// Serve static files from Grading_test_web_app
app.use(express.static(path.join(__dirname, "..", "Grading_test_web_app")));

// Route for serving index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "index.html"));
});

// Route for grading page
app.get("/grading.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "grading.html"));
});

// Serve users.json (if needed)
app.get("/users.json", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "users.json"));
});

// 🔹 Store credentials from `.env` file
const users = {
  [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD,
  [process.env.USER_USERNAME]: process.env.USER_PASSWORD,
  [process.env.BETA1_USERNAME]: process.env.BETA1_PASSWORD,
  [process.env.BETA2_USERNAME]: process.env.BETA2_PASSWORD,
  [process.env.BETA3_USERNAME]: process.env.BETA3_PASSWORD
};

// 🔹 Secure login route with debugging
app.post("/login", express.json(), (req, res) => {
    const { username, password } = req.body;
    
    console.log("🔹 Received Login Request:");
    console.log("👤 Username:", username);
    console.log("🔑 Password:", password ? "******" : "❌ (No password entered)");
    console.log("📌 Stored Users:", Object.keys(users));

    if (users[username] && users[username] === password) {
        console.log(`✅ SUCCESS: ${username} has logged in!`);
        res.json({ success: true });
    } else {
        console.log("❌ INVALID CREDENTIALS: Login failed.");
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Start the server and listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at: http://0.0.0.0:${PORT}`);
  console.log(`🔹 Accessible Locally: http://127.0.0.1:${PORT}`);
  console.log(`🌍 Accessible via Public IP (if configured): http://YOUR_PUBLIC_IP:${PORT}`);
});
