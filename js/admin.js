let courseCount = 1;

function addNewCourseInput() {
    courseCount++;
    const container = document.getElementById('coursesContainer');
    const group = document.createElement('div');
    group.className = 'course-input-group';
    group.style.marginTop = '15px';
    group.style.paddingTop = '15px';
    group.style.borderTop = '1px dashed #ccc';

    group.innerHTML = `
        <h4 class="course-count-label">Course ${courseCount} Details</h4>
        <input type="text" class="cCode" placeholder="Course Code (e.g., COS 201)" required>
        <input type="text" class="cTitle" placeholder="Course Title" required>
        <input type="number" class="cUnit" placeholder="Credit Units" min="1" max="6" required>
        <input type="number" class="cScore" placeholder="Score (0 - 100)" min="0" max="100" required>
    `;
    container.appendChild(group);
}

async function addStudent(event) {
    event.preventDefault();

    const name = document.getElementById('newName').value.trim();
    const regNumber = document.getElementById('newMatric').value.trim();
    const password = document.getElementById('newPass').value.trim();
    const session = document.getElementById('newSession').value.trim();
    const term = document.getElementById('newTerm').value;

    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('adminErrorMessage');
    if (successMsg) successMsg.innerText = '';
    if (errorMsg) errorMsg.innerText = '';

    // Collect all courses from inputs
    const courseGroups = document.querySelectorAll('.course-input-group');
    const courses = [];

    courseGroups.forEach(group => {
        const code = group.querySelector('.cCode').value.trim();
        const title = group.querySelector('.cTitle').value.trim();
        const unit = Number(group.querySelector('.cUnit').value);
        const score = Number(group.querySelector('.cScore').value);

        if (code && title) {
            courses.push({ code, title, unit, score });
        }
    });

    if (courses.length === 0) {
        if (errorMsg) errorMsg.innerText = 'Please enter at least one course.';
        return;
    }

    const payload = {
        name,
        regNumber,
        password,
        session,
        term,
        courses
    };

    try {
        const response = await fetch('/api/upload-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            if (successMsg) successMsg.innerText = '✅ Student record saved successfully!';
            document.getElementById('studentForm').reset();
            // Reset course inputs back to 1
            document.getElementById('coursesContainer').innerHTML = `
                <div class="course-input-group">
                    <h4 class="course-count-label">Course 1 Details</h4>
                    <input type="text" class="cCode" placeholder="Course Code (e.g., COS 201)" required>
                    <input type="text" class="cTitle" placeholder="Course Title" required>
                    <input type="number" class="cUnit" placeholder="Credit Units" min="1" max="6" required>
                    <input type="number" class="cScore" placeholder="Score (0 - 100)" min="0" max="100" required>
                </div>
            `;
            courseCount = 1;
        } else {
            if (errorMsg) errorMsg.innerText = data.error || 'Failed to save student record.';
        }
    } catch (err) {
        console.error('Error saving student:', err);
        if (errorMsg) errorMsg.innerText = 'Server error. Please try again.';
    }
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
}