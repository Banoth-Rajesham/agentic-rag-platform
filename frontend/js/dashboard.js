const logoutBtn = document.getElementById('logoutBtn');
const welcomeHeading = document.getElementById('welcomeHeading');
const userEmail = document.getElementById('userEmail');

const session = JSON.parse(localStorage.getItem('agentdna_session') || 'null');

if (!session) {
    window.location.href = 'login.html';
} else {
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${session.name || 'Agent'}`;
    }
    if (userEmail) {
        userEmail.textContent = session.email || 'no-email@agentdna.app';
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('agentdna_session');
        window.location.href = 'login.html';
    });
}
