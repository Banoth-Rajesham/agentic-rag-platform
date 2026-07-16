const registerForm = document.getElementById('registerForm');
const togglePassword = document.getElementById('togglePassword');
const message = document.getElementById('message');

if (registerForm) {
    registerForm.reset();
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

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !email || !password) {
            message.textContent = 'Please complete all fields to continue.';
            message.style.color = '#ff7b7b';
            return;
        }

        message.textContent = 'Registering account...';
        message.style.color = '#ffffff';

        try {
            const result = await registerUser({ name, email, password });
            if (result?.user) {
                localStorage.setItem('agentdna_user', JSON.stringify({
                    name: result.user.name,
                    email: result.user.email,
                }));
            }
            message.textContent = 'Account created successfully. Redirecting to login...';
            message.style.color = '#4cff88';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);
        } catch (error) {
            message.textContent = error.message || 'Registration failed. Try again.';
            message.style.color = '#ff7b7b';
        }
    });
}
