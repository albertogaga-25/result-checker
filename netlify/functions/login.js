document.addEventListener('DOMContentLoaded', () => {
    // If student is already logged in, redirect directly to dashboard
    const currentStudent = localStorage.getItem('currentStudent');
    if (currentStudent) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('loginErrorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const regNumber = document.getElementById('loginMatric').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const session = document.getElementById('loginSession').value;
            const term = document.getElementById('loginTerm').value;

            if (errorMsg) errorMsg.innerText = '';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ regNumber, password, session, term })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save student info along with selected session & term
                    const studentSessionData = {
                        ...(data.student || { regNumber }),
                        regNumber: regNumber,
                        selectedSession: session,
                        selectedTerm: term
                    };

                    localStorage.setItem('currentStudent', JSON.stringify(studentSessionData));
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    if (errorMsg) {
                        errorMsg.innerText = data.message || data.error || 'Invalid Matric Number, Password, or Session';
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                if (errorMsg) {
                    errorMsg.innerText = 'Unable to connect to server. Please try again.';
                }
            }
        });
    }
});