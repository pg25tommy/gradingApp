// auth.js

// Login function reads #username, #password, fetches users.json
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("currentUser", username);
          window.location.href = "grading.html";
      } else {
          alert("Invalid username or password.");
      }
  })
  .catch(error => console.error("Error:", error));
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
