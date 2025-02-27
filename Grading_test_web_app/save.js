// save.js

// Saves grading data to a .txt file, updates local history, refreshes UI
function saveToFile() {
  let studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
  
  // Reordered: Grade is fetched before Term
  let grade = document.getElementById("grade").value.trim();
  let term = document.getElementById("term").value.trim().replace(/\s+/g, '_');
  let block = document.getElementById("block").value.trim();
  
  let assignments = document.getElementsByClassName("assignment");
  let teacherNotes = document.getElementById("teacherNotes").value;
  let currentUser = localStorage.getItem("currentUser");

  if (!studentName || !term || !grade || !block) {
    alert("Please enter the student's name, grade, term, and block.");
    return;
  }

  // Build the file content, with Grade now appearing before Term
  let data = `Student Name: ${studentName}\nGrade: ${grade}\nTerm: ${term}\nBlock: ${block}\n\nAssignments:\n`;
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

    // Summarize each assignment’s average
    data += `- ${name}: Average Score: ${(sum / scores.length).toFixed(2)}\n`;
  }

  // Overall average & ranking
  let averageScore = (totalCriteria > 0)
    ? (totalScore / totalCriteria).toFixed(2)
    : 0;

  let ranking = 'Emerging';
  if (averageScore >= 3.5) ranking = 'Extending';
  else if (averageScore >= 3) ranking = 'Proficient';
  else if (averageScore >= 2) ranking = 'Developing';

  data += `\nOverall Average: ${averageScore}\nRanking: ${ranking}\n\nTeacher Notes:\n${teacherNotes}\n`;

  // Trigger file download
  let fileName = `${studentName}_${term}_Assignment.txt`;
  let blob = new Blob([data], { type: "text/plain" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Update local history
  let history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
  let firstAssignmentName = assignments.length > 0
    ? assignments[0].querySelector(".assignmentName").value
    : "No_Assignment";

  history.push({
    studentName,
    grade,
    term,
    block,
    firstAssignmentName,
    date: new Date().toLocaleString()
  });

  localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));

  // Refresh the history container
  displayHistory();
}
