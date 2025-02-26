// history.js

// Display the saved assignments for the current user
function displayHistory() {
    const currentUser = localStorage.getItem("currentUser");
    const history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
    const historyContainer = document.getElementById("history");
  
    if (!historyContainer) return; // If there's no #history element, do nothing
  
    historyContainer.innerHTML = "<h3>Saved Assignments</h3>";
  
    if (history.length === 0) {
      historyContainer.innerHTML += "<p>No saved assignments.</p>";
      return;
    }
  
    // Loop over each record and show in #history
    history.forEach(record => {
      historyContainer.innerHTML += `
        <p>${record.studentName} - ${record.term} - ${record.firstAssignmentName} (${record.date})</p>
      `;
    });
  }
  
  // Clear the localStorage history for the current user
  function clearHistory() {
    const currentUser = localStorage.getItem("currentUser");
    localStorage.removeItem(`history_${currentUser}`);
    displayHistory();
  }
  
  // Auto-run displayHistory once DOM is loaded
  document.addEventListener("DOMContentLoaded", displayHistory);
  