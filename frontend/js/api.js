const API_BASE_URL = 'http://127.0.0.1:8000/auth';

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.detail || data?.message || 'Request failed';
        throw new Error(message);
    }

    return data;
}

async function registerUser(payload) {
    return requestJson(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

async function loginUser(payload) {
    return requestJson(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

function getAuthToken() {
    return localStorage.getItem('agentdna_token');
}

function getSession() {
    return JSON.parse(localStorage.getItem('agentdna_session') || 'null');
}

function clearAuth() {
    localStorage.removeItem('agentdna_token');
    localStorage.removeItem('agentdna_session');
}
