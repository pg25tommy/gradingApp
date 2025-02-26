// save.js

// Saves grading data to a .txt file, updates local history, refreshes UI
function saveToFile() {
    const studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
    const term = document.getElementById("term").value.trim().replace(/\s+/g, '_');
    const assignments = document.getElementsByClassName("assignment");
    const teacherNotes = document.getElementById("teacherNotes").value;
    const currentUser = localStorage.getItem("currentUser");
  
    if (!studentName || !term) {
      alert("Please enter the student's name and term.");
      return;
    }
  
    // Build the content, calculating assignment averages
    let data = `Student Name: ${studentName}\nTerm: ${term}\n\nAssignments:\n`;
    let totalScore = 0;
    let totalCriteria = 0;
  
    for (let assign of assignments) {
      const name = assign.querySelector(".assignmentName").value;
      const scores = assign.querySelectorAll(".gradingCriteria");
      let sum = 0;
  
      scores.forEach(score => {
        sum += parseInt(score.value);
        totalScore += parseInt(score.value);
        totalCriteria++;
      });
  
      data += `- ${name}: Average Score: ${(sum / scores.length).toFixed(2)}\n`;
    }
  
    // Overall average & ranking
    const averageScore = (totalCriteria > 0)
      ? (totalScore / totalCriteria).toFixed(2)
      : 0;
  
    let ranking = 'Emerging';
    if (averageScore >= 3.5) ranking = 'Extending';
    else if (averageScore >= 3) ranking = 'Proficient';
    else if (averageScore >= 2) ranking = 'Developing';
  
    data += `\nOverall Average: ${averageScore}\nRanking: ${ranking}\n\nTeacher Notes:\n${teacherNotes}\n`;
  
    // Trigger file download
    const fileName = `${studentName}_${term}_Assignment.txt`;
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Update local history
    let history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
    let firstAssignmentName = (assignments.length > 0)
      ? assignments[0].querySelector(".assignmentName").value
      : "No_Assignment";
  
    history.push({
      studentName,
      term,
      firstAssignmentName,
      date: new Date().toLocaleString()
    });
  
    localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));
  
    // Refresh the history container
    displayHistory();
  }
  