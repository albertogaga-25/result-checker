document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentLoginForm');
    const adminForm = document.getElementById('adminLoginForm');
    const btnStudent = document.getElementById('btnStudentRole');
    const btnAdmin = document.getElementById('btnAdminRole');
    const errorMsg = document.getElementById('loginErrorMessage');

    // Switch to Student Role
    if (btnStudent) {
        btnStudent.addEventListener('click', () => {
            studentForm.style.display = 'block';
            adminForm.style.display = 'none';
            btnStudent.style.backgroundColor = '#0066cc';
            btnStudent.style.color = '#ffffff';
            btnAdmin.style.backgroundColor = '#e0e0e0';
            btnAdmin.style.color = '#333333';
            if (errorMsg) errorMsg.innerText = '';
        });
    }

    // Switch to Admin Role
    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
            studentForm.style.display = 'none';
            adminForm.style.display = 'block';
            btnAdmin.style.backgroundColor = '#000000';
            btnAdmin.style.color = '#ffffff';
            btnStudent.style.backgroundColor = '#e0e0e0';
            btnStudent.style.color = '#333333';
            if (errorMsg) errorMsg.innerText = '';
        });
    }

    // Handle Student Form Submit
    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMsg) errorMsg.innerText = '';

            const regNumber = document.getElementById('loginMatric').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const session = document.getElementById('loginSession').value;
            const term = document.getElementById('loginTerm').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ regNumber, password, session, term })
                });

                const data = await response.json();

                if (response.ok) {
                    const studentData = {
                        ...(data.student || { regNumber }),
                        regNumber: regNumber,
                        selectedSession: session,
                        selectedTerm: term
                    };
                    localStorage.setItem('currentStudent', JSON.stringify(studentData));
                    window.location.href = 'dashboard.html';
                } else {
                    if (errorMsg) errorMsg.innerText = data.message || data.error || 'Invalid Student Credentials';
                }
            } catch (err) {
                console.error('Login error:', err);
                if (errorMsg) errorMsg.innerText = 'Unable to connect to server.';
            }
        });
    }

    // Handle Admin Form Submit
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMsg) errorMsg.innerText = '';

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            try {
                const response = await fetch('/api/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('adminToken', data.token || 'logged_in');
                    window.location.href = 'admin.html';
                } else {
                    if (errorMsg) errorMsg.innerText = data.message || data.error || 'Invalid Admin Credentials';
                }
            } catch (err) {
                console.error('Admin Login error:', err);
                if (errorMsg) errorMsg.innerText = 'Unable to connect to server.';
            }
        });
    }
});