// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCf6tMmYd5K5bSUzt5gdqJhIum8_ejsweQ",
    authDomain: "farmer-db-10284.firebaseapp.com",
    projectId: "farmer-db-10284",
    storageBucket: "farmer-db-10284.firebasestorage.app",
    messagingSenderId: "367209163612",
    appId: "1:367209163612:web:afe6b3b63cbc08c305ef99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Helper: map Firebase auth error codes to user-friendly messages
function getAuthErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try logging in.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found for this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';

        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Contact support.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';

        default:
            return 'An error occurred. Please try again.';
    }
}

// Register
export async function registerUser(event) {
    event.preventDefault();

    const form = document.getElementById("authForm");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log(data);

    // Basic client-side validation
    if (!data.email || !data.password) {
        alert('Please enter a valid email and password.');
        return;
    }

    if (data.password !== data.confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        console.log("Registered:", userCredential.user);

        // You can also save other fields like name and phone to Firestore here
        console.log("Name:", data.name);
        console.log("Phone:", data.phone);

        return userCredential.user;
    } catch (error) {
        console.error(error.code, error.message);
        const msg = getAuthErrorMessage(error.code);
        alert(msg);
        throw error;
    }
}



// ======================
// Login
// ======================
export async function login(email, password, role) {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Logged In:", userCredential.user);
        if (role === 'farmer') {
            state = {
                activeView: 'farmer_dashboard',
                isLoggedIn: true,
                userRole: 'farmer',
                isMenuOpen: false,
            };
        } else {
            state = {
                activeView: 'home',
                isLoggedIn: true,
                userRole: 'buyer',
                isMenuOpen: false,
            };
        }
        renderView('home');
        return userCredential.user;
    } catch (error) {
        console.error(error.code, error.message);
        throw error;
    }
}

// Wrapper used by inline onclick handlers in non-module HTML
export async function loginUser(event, role) {
    if (event && event.preventDefault) event.preventDefault();
    const form = document.getElementById("authForm");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const user = await login(data.email, data.password, role);
        alert('Login successful. Welcome!');
        return user;
    } catch (error) {
        console.error('Login failed', error);
        const msg = getAuthErrorMessage(error.code);
        alert(msg);
        throw error;
    }
}

// ======================
// Logout
// ======================
export async function logout() {
    try {
        await signOut(auth);
        console.log("Logged Out");
    } catch (error) {
        console.error(error);
    }
}

// ======================
// Current User Listener
// ======================
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User Logged In");
        console.log("UID:", user.uid);
        console.log("Email:", user.email);
    } else {
        console.log("No User Logged In");
    }
});

// Export auth if needed elsewhere
export { auth };

// Expose functions to `window` so inline handlers like `onclick="registerUser(event)"` work
// This keeps existing HTML unchanged while using ES modules.
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logout = logout;