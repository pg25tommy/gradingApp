require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 80;
const sessionLogPath = path.join(__dirname, "..", "Grading_test_web_app", "user_sessions.json");

// Middleware to parse JSON request bodies
app.use(express.json());

// Debug: Log if environment variables are loaded (With Icons 🛠️ ✅ ⚠️)
console.log("🛠️  ENV Loaded: ", process.env.ADMIN_USERNAME, process.env.USER_USERNAME);
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

// Function to log session activity (Login & Logout)
function logSession(username, action) {
    const timestamp = new Date().toISOString();
    let sessions = [];

    // Load existing session logs (if any)
    if (fs.existsSync(sessionLogPath)) {
        const rawData = fs.readFileSync(sessionLogPath);
        try {
            sessions = JSON.parse(rawData);
        } catch (error) {
            console.error("⚠️ Error parsing session log file:", error);
        }
    }

    // If logging out, update the last login session with logout time
    if (action === "logout") {
        const lastSession = sessions.find(s => s.username === username && !s.logoutTime);
        if (lastSession) {
            lastSession.logoutTime = timestamp;
            lastSession.duration = Math.round((new Date(lastSession.logoutTime) - new Date(lastSession.loginTime)) / 1000) + "s";
        }
    } else {
        // Otherwise, create a new login session
        sessions.push({ username, loginTime: timestamp, logoutTime: null, duration: null });
    }

    // Save updated session logs
    fs.writeFileSync(sessionLogPath, JSON.stringify(sessions, null, 2));
}

// 🔹 Login Route: Track login time
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("🔹 Received Login Request:", username);
    if (users[username] && users[username] === password) {
        logSession(username, "login");  // Log login time
        console.log(`✅ SUCCESS: ${username} has logged in!`);
        res.json({ success: true });
    } else {
        console.log("❌ INVALID CREDENTIALS: Login failed.");
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 🔹 Logout Route: Track logout time
app.post("/logout", (req, res) => {
    const { username } = req.body;
    console.log(`🔹 ${username} is logging out...`);

    logSession(username, "logout");  // Log logout time
    res.json({ success: true, message: "User logged out." });
});

// Start the server and listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at: http://0.0.0.0:${PORT}`);
  console.log(`🔹 Accessible Locally: http://127.0.0.1:${PORT}`);
  console.log(`🌍 Accessible via Public IP (if configured): http://YOUR_PUBLIC_IP:${PORT}`);
});
