document.addEventListener("DOMContentLoaded", async () => {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    if (!student) {
        window.location.href = 'index.html';
        return;
    }

    // Fall back through all possible property names used at login
    const regNumber = student.regNumber || student.matricNumber || student.username;
    const studentName = student.name || student.studentName || 'Student';

    document.getElementById('studentName').innerText = studentName;
    document.getElementById('studentMatric').innerText = regNumber || '---';

    try {
        // Send both query params so your backend function catches whichever it expects
        const response = await fetch(
            `/api/get-result?regNumber=${encodeURIComponent(regNumber)}&matricNumber=${encodeURIComponent(regNumber)}`
        );
        const result = await response.json();

        if (response.ok) {
            const tableBody = document.getElementById('resultsTableBody');
            tableBody.innerHTML = '';

            const courses = result.courses || result.subjects || [];

            courses.forEach((c, index) => {
                // Calculate grade / quality points on the fly if backend returns raw scores
                const score = Number(c.score || 0);
                const unit = Number(c.unit || 0);
                const grade = c.grade || getGrade(score);
                const qualityPoint = c.qualityPoint ?? c.qp ?? calculateQP(score, unit);

                tableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${c.code || ''} - ${c.title || ''}</td>
                        <td>${unit}</td>
                        <td style="text-align: center;">${score}</td>
                        <td style="text-align: center;">${grade}</td>
                        <td>${qualityPoint}</td>
                    </tr>
                `;
            });

            document.getElementById('totalUnits').innerText = result.totalUnits ?? calculateTotalUnits(courses);
            document.getElementById('totalPoints').innerText = result.totalPoints ?? calculateTotalPoints(courses);
            document.getElementById('gpaScore').innerText = result.gpa ?? calculateGPA(courses);
        } else {
            console.error("Result fetch error:", result.message || result.error);
        }
    } catch (err) {
        console.error("Failed to load result:", err);
    }
});

// Helper functions in case the backend only sends raw course scores
function getGrade(score) {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 45) return 'D';
    if (score >= 40) return 'E';
    return 'F';
}

function calculateQP(score, unit) {
    let point = 0;
    if (score >= 70) point = 5;
    else if (score >= 60) point = 4;
    else if (score >= 50) point = 3;
    else if (score >= 45) point = 2;
    else if (score >= 40) point = 1;
    return point * unit;
}

function calculateTotalUnits(courses) {
    return courses.reduce((sum, c) => sum + Number(c.unit || 0), 0);
}

function calculateTotalPoints(courses) {
    return courses.reduce((sum, c) => sum + calculateQP(Number(c.score || 0), Number(c.unit || 0)), 0);
}

function calculateGPA(courses) {
    const units = calculateTotalUnits(courses);
    if (units === 0) return '0.00';
    const points = calculateTotalPoints(courses);
    return (points / units).toFixed(2);
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}