document.addEventListener("DOMContentLoaded", async () => {
    // ----------------------------------------------------
    // 1. LOGOUT EVENT LISTENER
    // ----------------------------------------------------
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('index.html');
        });
    }

    // ----------------------------------------------------
    // 2. CHECK STUDENT AUTHENTICATION
    // ----------------------------------------------------
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    if (!student) {
        window.location.href = 'index.html';
        return;
    }

    // Support flexible property names stored at login
    const regNumber = student.regNumber || student.matricNumber || student.username;
    const studentName = student.name || student.studentName || 'Student';

    // Populate student info in UI
    const nameElem = document.getElementById('studentName');
    const matricElem = document.getElementById('studentMatric');
    if (nameElem) nameElem.innerText = studentName;
    if (matricElem) matricElem.innerText = regNumber || '---';

    // ----------------------------------------------------
    // 3. FETCH RESULTS FROM BACKEND
    // ----------------------------------------------------
    try {
        const response = await fetch(
            `/api/get-result?regNumber=${encodeURIComponent(regNumber)}&matricNumber=${encodeURIComponent(regNumber)}`
        );
        const data = await response.json();

        if (response.ok) {
            // Unify response object structure
            let resultData = data.result || data;
            if (Array.isArray(resultData)) {
                resultData = resultData[0] || {};
            }

            // Extract course array safely
            const courses = resultData.courses || resultData.subjects || data.courses || [];
            const tableBody = document.getElementById('resultsTableBody');

            if (tableBody) {
                tableBody.innerHTML = '';

                if (courses.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align: center; color: #888;">No results found for this student.</td>
                        </tr>
                    `;
                } else {
                    courses.forEach((c, index) => {
                        const score = Number(c.score || 0);
                        const unit = Number(c.unit || 0);
                        const grade = c.grade || getGrade(score);
                        const qualityPoint = c.qualityPoint ?? c.qp ?? calculateQP(score, unit);

                        tableBody.innerHTML += `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${c.code || c.courseCode || ''} - ${c.title || c.courseTitle || ''}</td>
                                <td style="text-align: center;">${unit}</td>
                                <td style="text-align: center;">${score}</td>
                                <td style="text-align: center;">${grade}</td>
                                <td style="text-align: center;">${qualityPoint}</td>
                            </tr>
                        `;
                    });
                }
            }

            // Update Totals and GPA
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

// ----------------------------------------------------
// GLOBAL LOGOUT FALLBACK
// ----------------------------------------------------
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('index.html');
}

// ----------------------------------------------------
// HELPER CALCULATIONS
// ----------------------------------------------------
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