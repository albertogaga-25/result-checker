function addNewCourseInput() {
    const container = document.getElementById('coursesContainer');
    const courseCount = container.getElementsByClassName('course-input-group').length + 1;

    const div = document.createElement('div');
    div.className = 'course-input-group';
    div.style.marginTop = '15px';
    div.innerHTML = `
        <h4 class="course-count-label">Course ${courseCount} Details</h4>
        <input type="text" class="cCode" placeholder="Course Code (e.g., COS 201)" required>
        <input type="text" class="cTitle" placeholder="Course Title" required>
        <input type="number" class="cUnit" placeholder="Credit Units" min="1" max="6" required>
        <input type="number" class="cScore" placeholder="Score (0 - 100)" min="0" max="100" required>
    `;
    container.appendChild(div);
}

async function addStudent(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value.trim();
    const matricNumber = document.getElementById('newMatric').value.trim();
    const password = document.getElementById('newPass').value;
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('adminErrorMessage');

    successMsg.innerText = '';
    errorMsg.innerText = '';

    const courseGroups = document.querySelectorAll('.course-input-group');
    const courses = [];

    courseGroups.forEach(group => {
        courses.push({
            code: group.querySelector('.cCode').value.trim(),
            title: group.querySelector('.cTitle').value.trim(),
            unit: Number(group.querySelector('.cUnit').value),
            score: Number(group.querySelector('.cScore').value)
        });
    });

    try {
        const res = await fetch('/api/upload-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, matricNumber, password, courses })
        });

        const data = await res.json();

        if (res.ok) {
            successMsg.innerText = "Student record uploaded successfully!";
            document.getElementById('studentForm').reset();
        } else {
            errorMsg.innerText = data.message || "Failed to save record.";
        }
    } catch (err) {
        errorMsg.innerText = "Server error. Could not save record.";
    }
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}