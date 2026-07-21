document.addEventListener("DOMContentLoaded", async () => {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    if (!student) {
        window.location.href = 'index.html';
        return;
    }

    const regNumber = student.regNumber || student.matricNumber || student.username;
    const studentName = student.name || student.studentName || 'Student';

    const nameElem = document.getElementById('studentName');
    const matricElem = document.getElementById('studentMatric');
    if (nameElem) nameElem.innerText = studentName;
    if (matricElem) matricElem.innerText = regNumber || '---';

    try {
        const response = await fetch(
            `/api/get-result?regNumber=${encodeURIComponent(regNumber)}&matricNumber=${encodeURIComponent(regNumber)}`
        );
        const data = await response.json();

        if (response.ok) {
            // Unpack courses whether returned as top-level or wrapped inside data.result
            const resultData = data.result || data;
            const courses = resultData.courses || resultData.subjects || [];

            const tableBody = document.getElementById('resultsTableBody');
            if (tableBody) {
                tableBody.innerHTML = '';

                courses.forEach((c, index) => {
                    const score = Number(c.score || 0);
                    const unit = Number(c.unit || 0);
                    const grade = c.grade || getGrade(score);
                    const qualityPoint = c.qualityPoint ?? c.qp ?? calculateQP(score, unit);

                    tableBody.innerHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${c.code || c.courseCode || ''} - ${c.title || c.courseTitle || ''}</td>
                            <td>${unit}</td>
                            <td style="text-align: center;">${score}</td>
                            <td style="text-align: center;">${grade}</td>
                            <td>${qualityPoint}</td>
                        </tr>
                    `;
                });
            }

            const totalUnitsElem = document.getElementById('totalUnits');
            const totalPointsElem = document.getElementById('totalPoints');
            const gpaElem = document.getElementById('gpaScore');

            if (totalUnitsElem) totalUnitsElem.innerText = resultData.totalUnits ?? calculateTotalUnits(courses);
            if (totalPointsElem) totalPointsElem.innerText = resultData.totalPoints ?? calculateTotalPoints(courses);
            if (gpaElem) gpaElem.innerText = resultData.gpa ?? calculateGPA(courses);
        } else {
            console.error("Result fetch error:", data.message || data.error);
        }
    } catch (err) {
        console.error("Failed to load result:", err);
    }
});

// Helper Functions
function getGrade(score) {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 45) return 'D';
    if (score >= 40) return 'E';
    return 'F';
}

function getGradePoint(score) {
    if (score >= 70) return 5;
    if (score >= 60) return 4;
    if (score >= 50) return 3;
    if (score >= 45) return 2;
    if (score >= 40) return 1;
    return 0;
}

function calculateQP(score, unit) {
    return getGradePoint(score) * Number(unit);
}

function calculateTotalUnits(courses) {
    return courses.reduce((sum, c) => sum + Number(c.unit || 0), 0);
}

function calculateTotalPoints(courses) {
    return courses.reduce((sum, c) => sum + calculateQP(Number(c.score || 0), Number(c.unit || 0)), 0);
}

function calculateGPA(courses) {
    const totalUnits = calculateTotalUnits(courses);
    if (totalUnits === 0) return '0.00';
    const totalPoints = calculateTotalPoints(courses);
    return (totalPoints / totalUnits).toFixed(2);
}