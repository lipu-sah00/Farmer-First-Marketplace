const state = {
    activeView: 'auth',
    isLoggedIn: true,
    userRole: 'buyer',
    cartCount: 2,
    isMenuOpen: false,
};

const pageContent = document.getElementById('pageContent');
const nav = document.getElementById('mainNav');
const menuBtn = document.getElementById('menuBtn');
const cartCountLabel = document.getElementById('cartCountLabel');
const authAction = document.getElementById('authAction');

function updateHeader() {
    const buyerButtons = document.querySelectorAll('[data-buyer-nav="true"]');
    const farmerButtons = document.querySelectorAll('[data-farmer-nav="true"]');

    buyerButtons.forEach((button) => {
        button.style.display = state.userRole === 'farmer' ? 'none' : 'inline-flex';
    });

    farmerButtons.forEach((button) => {
        button.style.display = state.userRole === 'farmer' ? 'inline-flex' : 'none';
    });

    cartCountLabel.textContent = state.cartCount;
    authAction.textContent = state.isLoggedIn ? 'Logout' : 'Login';
    menuBtn.style.display = state.isLoggedIn ? 'inline-flex' : 'none';
    nav.classList.toggle('open', state.isMenuOpen && state.isLoggedIn);
}

function renderView() {
    const footer = document.querySelector(".site-footer");
    const viewMap = {
        home: 'module/buyer/home.html',
        products: 'module/buyer/products.html',
        cart: 'module/buyer/cart.html',
        orders: 'module/buyer/orders.html',
        farmer: 'module/farmer/farmer.html',
        farmer_dashboard: 'module/farmer/farmer_dashboard.html',
        farmer_sell: 'module/farmer/farmer_sell.html',
        auth: 'module/auth/auth.html',
    };

    const pageToLoad = viewMap[state.activeView] || viewMap.home;

    fetch(pageToLoad)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load ${pageToLoad}`);
            }

            return response.text();
        })
        .then((html) => {
            pageContent.innerHTML = html;
            if (state.activeView === "auth") {
                loadScript("js/auth.js", () => {
                    console.log('auth.js loaded');
                    if (footer != null) {
                        footer.style.display = 'none';
                    }
                });
            } else {
                // footer.style.display = 'block';
            }
        })
        .catch(() => {
            pageContent.innerHTML = `
                <section class="content-card">
                    <h2>Page unavailable</h2>
                    <p>The selected section could not be loaded. Please try again.</p>
                </section>
            `;
        });
}
function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.body.appendChild(script);
}

function setView(view) {
    state.activeView = view;

    if (view === 'farmer') {
        state.userRole = 'farmer';
    } else if (['home', 'products', 'cart', 'orders'].includes(view)) {
        state.userRole = 'buyer';
    }

    renderView();
    updateHeader();
    closeMenu();
}

function closeMenu() {
    state.isMenuOpen = false;
    updateHeader();
}

function toggleMenu() {
    if (!state.isLoggedIn) {
        return;
    }

    state.isMenuOpen = !state.isMenuOpen;
    updateHeader();
}

function userAuthManage() {
    if (state.isLoggedIn) {
        state.isLoggedIn = false;
        state.userRole = 'guest';
        state.activeView = 'auth';
    } else {
        state.isLoggedIn = true;
        state.userRole = 'buyer';
        state.activeView = 'home';
    }

    renderView();
    updateHeader();
}

document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', (event) => {
        if (button.tagName === 'A') {
            event.preventDefault();
        }

        setView(button.dataset.view);
    });
});

menuBtn.addEventListener('click', toggleMenu);
authAction.addEventListener('click', userAuthManage);

window.addEventListener('resize', () => {
    if (window.innerWidth > 568) {
        closeMenu();
    }
});

renderView();
updateHeader();
