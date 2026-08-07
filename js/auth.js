let authMode = "login";
let isLoggedIn = true;
const text = "Welcome to Farmer Marketplace";
const title = document.getElementById("runningText");
let i = 0;
let textTimer = null;
let restartTimer = null;

function setAuthMode(mode) {
    authMode = mode;
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const registerFields = document.querySelectorAll(".registerFields");
    const loginFields = document.querySelectorAll(".loginFields");
    registerFields.forEach(field => {
        field.style.display = authMode === "register" ? "block" : "none";
    });
    loginFields.forEach(field => {
        field.style.display = authMode === "login" ? "block" : "none";
    });
    if (authMode === "login") {
        loginBtn.style.background = "#16a34a";
        loginBtn.style.color = "#fff";
        registerBtn.style.background = "transparent";
        registerBtn.style.color = "#374151";
    } else {
        registerBtn.style.background = "#16a34a";
        registerBtn.style.color = "#fff";
        loginBtn.style.background = "transparent";
        loginBtn.style.color = "#374151";
    }
}

function animateText() {
    const title = document.getElementById("runningText");
    if (!title) return;
    // Stop any previous animation
    clearInterval(textTimer);
    clearTimeout(restartTimer);
    title.textContent = "";
    i = 0;
    textTimer = setInterval(() => {
        if (!document.body.contains(title)) {
            clearInterval(textTimer);
            return;
        }

        title.textContent += text[i];
        i++;

        if (i >= text.length) {
            clearInterval(textTimer);

            restartTimer = setTimeout(() => {
                animateText();
            }, 1000);
        }
    }, 100);
}

// Set initial state
let init = () => {
    setAuthMode("login");
    animateText();
}
