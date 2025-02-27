// grading.js

// Given a list of assignment elements, calculates the overall percentage,
// and determines the ranking and letter grade.
function calculateOverallGrade(assignments) {
    let totalScore = 0;
    let totalCriteria = 0;
    
    // Loop through each assignment and each criterion within it.
    for (let assign of assignments) {
      let scores = assign.querySelectorAll(".gradingCriteria");
      scores.forEach(score => {
        totalScore += parseInt(score.value);
        totalCriteria++;
      });
    }
    
    if (totalCriteria === 0) {
      return {
        percentage: "0.00",
        ranking: "Insufficient Evidence (IE)",
        letterGrade: "N/A"
      };
    }
    
    // Calculate average score on the 1–4 scale and convert to a percentage
    let averageScore = totalScore / totalCriteria; // (1–4 scale)
    let percentage = (averageScore / 4) * 100;       // convert to 0–100%
    
    // Determine ranking and letter grade using the defined scale:
    // 0–59%   => Emerging (F)
    // 60–72%  => Developing (C)
    // 73–88%  => Proficient (B)
    // 89–100% => Extending (A)
    let ranking = "";
    let letterGrade = "";
    
    if (percentage < 60) {
      ranking = "Emerging";
      letterGrade = "F";
    } else if (percentage < 73) {
      ranking = "Developing";
      letterGrade = "C";
    } else if (percentage < 89) {
      ranking = "Proficient";
      letterGrade = "B";
    } else {
      ranking = "Extending";
      letterGrade = "A";
    }
    
    return {
      percentage: percentage.toFixed(2),
      ranking,
      letterGrade
    };
  }
  