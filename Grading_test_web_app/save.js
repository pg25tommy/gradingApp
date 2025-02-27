// save.js

// Saves grading data to a .txt file, updates local history, and refreshes the UI.
function saveToFile() {
  let studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
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

  // Build the file content header.
  let data = `Student Name: ${studentName}\nGrade: ${grade}\nTerm: ${term}\nBlock: ${block}\n\nAssignments:\n`;
  
  // List each assignment name only.
  for (let assign of assignments) {
    let name = assign.querySelector(".assignmentName").value;
    data += `- ${name}\n`;
  }
  
  // Calculate overall grade using the function from grading.js.
  let overall = calculateOverallGrade(assignments);
  
  // Append overall results (only percentage, ranking, and letter grade)
  data += `\nOverall Percentage: ${overall.percentage}%`;
  data += `\nRanking: ${overall.ranking}`;
  data += `\nLetter Grade: ${overall.letterGrade}`;
  data += `\n\nTeacher Notes:\n${teacherNotes}\n`;

  // Trigger file download.
  let fileName = `${studentName}_${term}_Assignment.txt`;
  let blob = new Blob([data], { type: "text/plain" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Update local history.
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

  // Refresh the history container.
  displayHistory();
}
