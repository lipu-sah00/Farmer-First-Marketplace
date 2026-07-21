const DB_END_POINT = `http://localhost:8080/login`

/**
 * Send credentials to the login endpoint and store the returned token.
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<object>} server response JSON
 */
async function logIn(credentials) {
    try {
        const res = await fetch(DB_END_POINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Login failed: ${res.status} ${errText}`);
        }

        const data = await res.json();

        if (data && data.token) {
            localStorage.setItem('authToken', data.token);
        }

        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Remove stored token and optionally call a logout endpoint if available.
 * @returns {Promise<void>}
 */
async function logOut() {
    const token = localStorage.getItem('authToken');

    // best-effort notify server about logout if endpoint exists
    try {
        await fetch(DB_END_POINT.replace(/\/login$/, '/logout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({}),
        });
    } catch (e) {
        // ignore network errors on logout
    }

    localStorage.removeItem('authToken');
}

// Expose for other scripts to call
window.apiService = { logIn, logOut };