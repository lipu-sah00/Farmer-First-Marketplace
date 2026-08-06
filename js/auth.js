let authMode = "login";
let isLoggedIn = true;
const text = "Welcome to Farmer Marketplace";
const title = document.getElementById("runningText");
let i = 0;


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
    title.textContent = "";

    const timer = setInterval(() => {
        title.textContent += text[i];
        i++;

        if (i >= text.length) {
            clearInterval(timer);

            setTimeout(() => {
                i = 0;
                animateText();
            }, 1000);
        }
    }, 100);
}

function getAuthFormData() {
    const authForm = {
        name: document.getElementById("name")?.value || "",
        phone: document.getElementById("phone")?.value || "",
        email: document.getElementById("email")?.value || "",
        password: document.getElementById("password")?.value || "",
        confirmPassword: document.getElementById("confirmPassword")?.value || ""
    };

    console.log(authForm);
    return authForm;
}


const authForm = getAuthFormData();
console.log(authForm);
// Set initial state
let init = () => {
    setAuthMode("login");
    animateText();
    const logout_btn = document.getElementById("logout_btn");
    if (isLoggedIn == false) {
        logout_btn.style.display = 'none';
    }
}
