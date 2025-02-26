// auth.js

// Login function reads #username, #password, fetches users.json
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("users.json")
    .then(response => response.json())
    .then(users => {
      if (users[username] && users[username] === password) {
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("currentUser", username);
        // On success, redirect to grading page
        window.location.href = "grading.html";
      } else {
        alert("Invalid username or password. Please try again.");
      }
    })
    .catch(error => console.error("Error loading users:", error));
}

// Ensures the user must be authenticated if on grading.html
function checkAuth() {
  if (window.location.pathname.includes("grading.html")) {
    if (localStorage.getItem("authenticated") !== "true") {
      window.location.href = "index.html"; // Not authenticated? Go to login
    }
  }
}

// Logout function that clears localStorage and returns to login
function logout() {
  localStorage.removeItem("authenticated");
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Check authentication on DOMContentLoaded
document.addEventListener("DOMContentLoaded", checkAuth);
