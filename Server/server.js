require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https"); // added for HTTPS
const { GoogleSpreadsheet } = require("google-spreadsheet");

const app = express();
const PORT = process.env.PORT || 443; // Use 443 for HTTPS by default
const sessionLogPath = path.join(__dirname, "..", "Grading_test_web_app", "user_sessions.json");

// Middleware to parse JSON request bodies
app.use(express.json());

// Log environment variables loaded
console.log("🛠️  ENV Loaded:", process.env.SHEET_ID, process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!process.env.SHEET_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("⚠️  WARNING: Missing Google Sheets configuration in .env file!");
}

// Load users from .env
const users = {
  [process.env.ADMIN1_USERNAME]: process.env.ADMIN1_PASSWORD,
  [process.env.ADMIN2_USERNAME]: process.env.ADMIN2_PASSWORD,
  [process.env.USER_USERNAME]: process.env.USER_PASSWORD,
  [process.env.BETA1_USERNAME]: process.env.BETA1_PASSWORD,
  [process.env.BETA2_USERNAME]: process.env.BETA2_PASSWORD,
  [process.env.BETA3_USERNAME]: process.env.BETA3_PASSWORD
};

// Initialize Google Sheets API
async function initGoogleSheets() {
    try {
        const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
        // Hard-coded credentials file name instead of using process.env value
        await doc.useServiceAccountAuth(require(path.join(__dirname, "..", "google-credentials.json")));
        await doc.loadInfo();
        console.log("✅ Google Sheets API initialized successfully.");
        return doc;
    } catch (error) {
        console.error("❌ Failed to initialize Google Sheets:", error);
        return null;
    }
}

let doc;
initGoogleSheets().then((loadedDoc) => {
    if (!loadedDoc) {
        console.log("⚠️ Google Sheets not initialized, skipping Google API logging.");
    }
    doc = loadedDoc;
});

// Helper function to parse User-Agent string for platform and browser
function parseUserAgent(userAgent) {
    let platform = "PC";
    if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) {
        platform = "Mac";
    }
    
    let browser = "Unknown";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge") && !userAgent.includes("OPR")) {
        browser = "Chrome";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        browser = "Safari";
    } else if (userAgent.includes("Firefox")) {
        browser = "Firefox";
    } else if (userAgent.includes("Edge")) {
        browser = "Edge";
    } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
        browser = "Opera";
    }
    return { platform, browser };
}

// Log all incoming requests with simplified User-Agent info
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || "";
    const { platform, browser } = parseUserAgent(userAgent);
    console.log(`🔹 Incoming request: Host=${req.hostname} - URL=${req.originalUrl} - Platform=${platform} - Browser=${browser}`);
    next();
});

// Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("🔹 Login Request:", username);
    if (users[username] && users[username] === password) {
        logSession(username, "login"); // Not awaiting to avoid blocking response
        console.log(`✅ SUCCESS: ${username} has logged in!`);
        res.json({ success: true });
    } else {
        console.log("❌ INVALID CREDENTIALS: Login failed.");
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Logout Route
app.post("/logout", async (req, res) => {
    const { username } = req.body;
    console.log(`🔹 ${username} is logging out...`);
    logSession(username, "logout"); // Not awaiting to avoid blocking response
    res.json({ success: true, message: "User logged out." });
});

// Function to log session (Local File + Google Sheets)
async function logSession(username, action) {
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

    if (action === "logout") {
        const lastSession = sessions.find(s => s.username === username && !s.logoutTime);
        if (lastSession) {
            lastSession.logoutTime = timestamp;
            lastSession.duration = Math.round((new Date(lastSession.logoutTime) - new Date(lastSession.loginTime)) / 1000) + "s";
        }
    } else {
        sessions.push({ username, loginTime: timestamp, logoutTime: null, duration: null });
    }

    // Save updated session logs locally
    fs.writeFileSync(sessionLogPath, JSON.stringify(sessions, null, 2));

    // Log to Google Sheets (non-blocking)
    if (doc) {
        (async () => {
            try {
                const sheet = doc.sheetsByIndex[0];

                // Ensure header row exists; if missing or empty, set it.
                await sheet.loadHeaderRow();
                if (!Array.isArray(sheet.headerValues) || sheet.headerValues.length === 0 || !sheet.headerValues.includes("Username")) {
                    await sheet.setHeaderRow(["Username", "LoginTime", "LogoutTime", "Duration"]);
                    console.log("✅ Header row initialized in Google Sheets.");
                }

                if (action === "login") {
                    await sheet.addRow({ Username: username, LoginTime: timestamp, LogoutTime: "", Duration: "" });
                } else if (action === "logout") {
                    const rows = await sheet.getRows();
                    const lastLogin = rows.reverse().find(row => row.Username === username && !row.LogoutTime);
                    if (lastLogin) {
                        lastLogin.LogoutTime = timestamp;
                        lastLogin.Duration = Math.round((new Date() - new Date(lastLogin.LoginTime)) / 1000) + "s";
                        await lastLogin.save();
                    }
                }
                console.log(`📌 ${action.toUpperCase()} logged for user: ${username} in Google Sheets`);
            } catch (error) {
                console.error(`❌ Error logging ${action} for ${username} in Google Sheets:`, error);
            }
        })();
    }
}

// Serve static files from Grading_test_web_app
app.use(express.static(path.join(__dirname, "..", "Grading_test_web_app")));

// Serve users.json (if needed)
app.get("/users.json", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Grading_test_web_app", "users.json"));
});

// Set your public IP for console logging
const PUBLIC_IP = "70.71.240.63";

// HTTPS options: Ensure you have your certificate and key files at these paths.
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "..", "ssl", "private.key")),   // Update the path
    cert: fs.readFileSync(path.join(__dirname, "..", "ssl", "certificate.crt")) // Update the path
};

// Start the HTTPS server with external access enabled
https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HTTPS Server running at: https://0.0.0.0:${PORT}`);
    console.log(`🔹 Accessible Locally: https://10.0.0.228:${PORT}`);
    console.log(`🌍 Accessible via Public IP (if configured): https://${PUBLIC_IP}:${PORT}`);
});
