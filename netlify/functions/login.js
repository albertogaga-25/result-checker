document.addEventListener('DOMContentLoaded', () => {

    // 1. HANDLE STUDENT LOGIN
    const studentForm = document.getElementById('studentLoginForm');
    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const regNumber = document.getElementById('loginMatric').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const session = document.getElementById('loginSession').value;
            const term = document.getElementById('loginTerm').value;
            const errorMsg = document.getElementById('loginErrorMessage');

            if (errorMsg) errorMsg.innerText = '';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ regNumber, password, session, term })
                });

                const data = await response.json();

                if (response.ok) {
                    const studentSessionData = {
                        ...(data.student || { regNumber }),
                        regNumber: regNumber,
                        selectedSession: session,
                        selectedTerm: term
                    };
                    localStorage.setItem('currentStudent', JSON.stringify(studentSessionData));
                    window.location.href = 'dashboard.html';
                } else {
                    if (errorMsg) errorMsg.innerText = data.error || data.message || 'Invalid Student Credentials';
                }
            } catch (err) {
                console.error('Student login error:', err);
                if (errorMsg) errorMsg.innerText = 'Server error. Please try again.';
            }
        });
    }

    // 2. HANDLE ADMIN LOGIN
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            const errorMsg = document.getElementById('loginErrorMessage');

            if (errorMsg) errorMsg.innerText = '';

            try {
                const response = await fetch('/api/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Set token so admin.html allows access
                    localStorage.setItem('adminToken', data.token || 'logged_in');
                    window.location.href = 'admin.html';
                } else {
                    if (errorMsg) errorMsg.innerText = data.error || data.message || 'Invalid Admin Username or Password';
                }
            } catch (err) {
                console.error('Admin login fetch error:', err);
                
                // Fallback direct check if endpoint is not connected yet
                if (username.toLowerCase() === 'admin' && password === 'admin123') {
                    localStorage.setItem('adminToken', 'logged_in');
                    window.location.href = 'admin.html';
                } else {
                    if (errorMsg) errorMsg.innerText = 'Invalid Admin Username or Password';
                }
            }
        });
    }
});