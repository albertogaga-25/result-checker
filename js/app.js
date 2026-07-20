document.addEventListener("DOMContentLoaded", async () => {
    const student = JSON.parse(localStorage.getItem('currentStudent'));
    if (!student) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('studentName').innerText = student.name;
    document.getElementById('studentMatric').innerText = student.matricNumber;

    try {
        const response = await fetch(`/api/get-result?matricNumber=${encodeURIComponent(student.matricNumber)}`);
        const result = await response.json();

        if (response.ok) {
            const tableBody = document.getElementById('resultsTableBody');
            tableBody.innerHTML = '';

            result.courses.forEach((c, index) => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${c.code} - ${c.title}</td>
                        <td>${c.unit}</td>
                        <td style="text-align: center;">${c.score}</td>
                        <td style="text-align: center;">${c.grade}</td>
                        <td>${c.qualityPoint}</td>
                    </tr>
                `;
            });

            document.getElementById('totalUnits').innerText = result.totalUnits;
            document.getElementById('totalPoints').innerText = result.totalPoints;
            document.getElementById('gpaScore').innerText = result.gpa;
        } else {
            console.error(result.message);
        }
    } catch (err) {
        console.error("Failed to load result:", err);
    }
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}