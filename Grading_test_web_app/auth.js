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
          window.location.href = "grading.html"; // Go to grading page
        } else {
          alert("Invalid username or password. Please try again.");
        }
      })
      .catch(error => console.error("Error loading users:", error));
  }
  
  // Ensures user must be authenticated if on grading.html
  function checkAuth() {
    if (window.location.pathname.includes("grading.html")) {
      if (localStorage.getItem("authenticated") !== "true") {
        window.location.href = "index.html"; // Not authenticated? Go to login
      }
    }
  }
  
  // Logs out the current user, clears localStorage, returns to login
  function logout() {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
  
  // Check authentication on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", checkAuth);
  