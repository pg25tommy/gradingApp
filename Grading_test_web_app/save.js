// save.js

// Generates the file content from the current form values.
function generateFileContent() {
  let studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
  let grade = document.getElementById("grade").value.trim();
  let term = document.getElementById("term").value.trim().replace(/\s+/g, '_');
  let block = document.getElementById("block").value.trim();
  let assignments = document.getElementsByClassName("assignment");
  let teacherNotes = document.getElementById("teacherNotes").value;

  let data = `Student Name: ${studentName}\nGrade: ${grade}\nTerm: ${term}\nBlock: ${block}\n\nAssignments:\n`;
  
  // List each assignment name.
  for (let assign of assignments) {
    let name = assign.querySelector(".assignmentName").value;
    data += `- ${name}\n`;
  }
  
  // Append Teacher Notes.
  data += `\nTeacher Notes:\n${teacherNotes}\n`;
  
  // Append Formative Assessments if any.
  let formativeTextareas = document.getElementsByClassName("formativeAssessment");
  if (formativeTextareas.length > 0) {
    data += `\nFormative Assessments:\n`;
    for (let ta of formativeTextareas) {
      let text = ta.value;
      if (text.trim() !== "") {
        data += `- ${text}\n`;
      }
    }
  }
  
  // Calculate overall grade using the function from grading.js.
  let overall = calculateOverallGrade(assignments);
  data += `\nOverall Percentage: ${overall.percentage}%`;
  data += `\nRanking: ${overall.ranking}`;
  data += `\nLetter Grade: ${overall.letterGrade}\n`;
  
  return { data, studentName };
}

// Common function that updates local history, generates a PDF using jsPDF, downloads it, and clears the form.
function commonSaveAndDownload() {
  let studentName = document.getElementById("studentName").value.trim().replace(/\s+/g, '_');
  let grade = document.getElementById("grade").value.trim();
  let term = document.getElementById("term").value.trim().replace(/\s+/g, '_');
  let block = document.getElementById("block").value.trim();
  let assignments = document.getElementsByClassName("assignment");
  let currentUser = localStorage.getItem("currentUser");

  if (!studentName || !term || !grade || !block) {
    alert("Please enter the student's name, grade, term, and block.");
    return;
  }
  
  // Update local history.
  let history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
  let firstAssignmentName = assignments.length > 0
    ? assignments[0].querySelector(".assignmentName").value.trim().replace(/\s+/g, '_')
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
  displayHistory();
  
  // Generate file content.
  let { data, studentName: fileStudentName } = generateFileContent();
  
  // Create a PDF using jsPDF.
  const { jsPDF } = window.jspdf; // Ensure jsPDF is loaded in your HTML.
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });
  
  // Add a title.
  doc.setFontSize(18);
  doc.text(`Grading Report for ${fileStudentName}`, 40, 40);
  
  // Split text to fit within the page width.
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(data, 500);
  doc.text(lines, 40, 70);
  
  // Generate file name as StudentName_AssignmentName_Assignment.pdf.
  let fileName = `${fileStudentName}_${firstAssignmentName}_Assignment.pdf`;
  doc.save(fileName);
  
  // Clear the form fields.
  document.getElementById("studentName").value = "";
  document.getElementById("grade").value = "";
  document.getElementById("term").value = "";
  document.getElementById("block").value = "";
  document.getElementById("teacherNotes").value = "";
  // Clear assignment blocks (keeping the header).
  document.getElementById("assignments").innerHTML = "<h3>Assignments</h3>";
  // Clear formative assessments.
  document.getElementById("formativeContainer").innerHTML = "";
}

// Separate function for "Save" button.
function saveFormData() {
  commonSaveAndDownload();
}

// Separate function for "Download" button.
function downloadFile() {
  commonSaveAndDownload();
}

