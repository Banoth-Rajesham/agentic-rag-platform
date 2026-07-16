const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const message = document.getElementById('message');

const storedUser = JSON.parse(localStorage.getItem('agentdna_user') || 'null');

if (loginForm) {
    loginForm.reset();
}

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const password = document.getElementById('password');
        const icon = togglePassword.querySelector('i');
        if (password.type === 'password') {
            password.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            password.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            message.textContent = 'Email and password are required.';
            message.style.color = '#ff7b7b';
            return;
        }

        message.textContent = 'Signing in...';
        message.style.color = '#ffffff';

        try {
            const data = await loginUser({ email, password });
            localStorage.setItem('agentdna_token', data.access_token);
            localStorage.setItem('agentdna_session', JSON.stringify({
                name: storedUser?.name || email.split('@')[0] || 'Agent',
                email,
            }));
            message.textContent = 'Login successful. Redirecting...';
            message.style.color = '#4cff88';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 900);
        } catch (error) {
            message.textContent = error.message || 'Login failed. Please try again.';
            message.style.color = '#ff7b7b';
        }
    });
}
