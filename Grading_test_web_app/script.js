const appVersion = "Version 1.0";

// Function to set app version dynamically on all pages
function setVersion() {
    const versionElements = document.querySelectorAll(".app-version");
    versionElements.forEach(element => {
        element.textContent = appVersion;
    });
}

document.addEventListener("DOMContentLoaded", setVersion);

// Handle login authentication using JSON file
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("users.json") // Load user credentials from a JSON file
        .then(response => response.json())
        .then(users => {
            if (users[username] && users[username] === password) {
                localStorage.setItem("authenticated", "true"); // Store authentication status
                localStorage.setItem("currentUser", username); // Store current user
                window.location.href = "grading.html"; // Redirect to the grading page
            } else {
                alert("Invalid username or password. Please try again.");
            }
        })
        .catch(error => console.error("Error loading users:", error));
}

// Check authentication before accessing the grading page
if (window.location.pathname.includes("grading.html")) {
    if (localStorage.getItem("authenticated") !== "true") {
        window.location.href = "index.html"; // Redirect to login page if not authenticated
    }
}

// Logout function to clear session and redirect to login page
function logout() {
    localStorage.removeItem("authenticated"); // Remove authentication session
    localStorage.removeItem("currentUser"); // Remove stored user info
    window.location.href = "index.html"; // Redirect to login page
}

// Function to display history of saved assignments
function displayHistory() {
    let currentUser = localStorage.getItem("currentUser");
    let history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
    let historyContainer = document.getElementById("history");

    if (!historyContainer) return; // Ensure history container exists

    historyContainer.innerHTML = "<h3>Saved Assignments</h3>";

    if (history.length === 0) {
        historyContainer.innerHTML += "<p>No saved assignments.</p>";
        return;
    }

    history.forEach(record => {
        historyContainer.innerHTML += `<p>${record.studentName} - ${record.term} - ${record.firstAssignmentName} (${record.date})</p>`;
    });
}

document.addEventListener("DOMContentLoaded", displayHistory);

// Function to clear the history of saved assignments
function clearHistory() {
    let currentUser = localStorage.getItem("currentUser");
    localStorage.removeItem(`history_${currentUser}`); // Remove history data
    displayHistory(); // Refresh history panel
}

// Function to add a new assignment section
function addAssignment() {
    let container = document.getElementById("assignments");
    let div = document.createElement("div");
    div.classList.add("assignment");

    div.innerHTML = `
        <label>Assignment Name:</label>
        <input type="text" class="assignmentName" required>
        
        <label>Understanding:</label>
        <select class="gradingCriteria">
            <option value="1">Emerging</option>
            <option value="2">Developing</option>
            <option value="3">Proficient</option>
            <option value="4">Extending</option>
        </select>
        
        <label>Application:</label>
        <select class="gradingCriteria">
            <option value="1">Emerging</option>
            <option value="2">Developing</option>
            <option value="3">Proficient</option>
            <option value="4">Extending</option>
        </select>
        
        <label>Communication:</label>
        <select class="gradingCriteria">
            <option value="1">Emerging</option>
            <option value="2">Developing</option>
            <option value="3">Proficient</option>
            <option value="4">Extending</option>
        </select>
        
        <label>Critical Thinking:</label>
        <select class="gradingCriteria">
            <option value="1">Emerging</option>
            <option value="2">Developing</option>
            <option value="3">Proficient</option>
            <option value="4">Extending</option>
        </select>
        
        <button type="button" class="remove-assignment">Remove</button>
    `;
    container.appendChild(div);

    div.querySelector(".remove-assignment").addEventListener("click", function() {
        div.remove();
    });
}

// Function to save grading data and store in history, while also generating a downloadable file
function saveToFile() {
    let studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
    let term = document.getElementById("term").value.trim().replace(/\s+/g, '_');
    let assignments = document.getElementsByClassName("assignment");
    let teacherNotes = document.getElementById("teacherNotes").value;
    let currentUser = localStorage.getItem("currentUser");

    if (!studentName || !term) {
        alert("Please enter the student's name and term.");
        return;
    }

    // Build the file content with average calculations
    let data = `Student Name: ${studentName}\nTerm: ${term}\n\nAssignments:\n`;
    let totalScore = 0;
    let totalCriteria = 0;

    for (let assign of assignments) {
        let name = assign.querySelector(".assignmentName").value;
        let scores = assign.querySelectorAll(".gradingCriteria");
        let sum = 0;

        scores.forEach(score => {
            sum += parseInt(score.value);
            totalScore += parseInt(score.value);
            totalCriteria++;
        });

        data += `- ${name}: Average Score: ${(sum / scores.length).toFixed(2)}\n`;
    }

    // Overall average/ranking
    let averageScore = (totalCriteria > 0) ? (totalScore / totalCriteria).toFixed(2) : 0;
    let ranking = averageScore >= 3.5
        ? 'Extending'
        : averageScore >= 3
            ? 'Proficient'
            : averageScore >= 2
                ? 'Developing'
                : 'Emerging';

    data += `\nOverall Average: ${averageScore}\nRanking: ${ranking}\n\nTeacher Notes:\n${teacherNotes}\n`;

    // 1) Trigger file download
    let fileName = `${studentName}_${term}_Assignment.txt`;
    let blob = new Blob([data], { type: "text/plain" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();          // Download the file
    document.body.removeChild(link);

    // 2) Update history
    let history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
    let firstAssignmentName =
        assignments.length > 0 ? assignments[0].querySelector(".assignmentName").value : "No_Assignment";

    history.push({
        studentName,
        term,
        firstAssignmentName,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));

    // 3) Refresh the history panel
    displayHistory();
}

