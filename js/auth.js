async function login() {
    const role = document.getElementById('roleInput').value;
    const username = document.getElementById('matricInput').value.trim();
    const password = document.getElementById('passInput').value;
    const error = document.getElementById('error');

    error.innerText = '';

    if (!username || !password) {
        error.innerText = 'Please fill in all fields.';
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, username, password })
        });

        const data = await res.json();

        if (res.ok) {
            if (data.role === 'admin') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                localStorage.setItem('currentStudent', JSON.stringify(data.student));
                window.location.href = 'dashboard.html';
            }
        } else {
            error.innerText = data.message || 'Login failed';
        }
    } catch (err) {
        error.innerText = 'Server error. Please try again.';
    }
}