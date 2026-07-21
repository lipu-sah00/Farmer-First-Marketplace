const state = {
    activeView: 'home',
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
    const viewMap = {
        home: `
      <section class="hero-card">
        <p class="stat-pill">Fresh from local farms</p>
        <h2>Welcome to Farmer First Marketplace</h2>
        <p>Browse farm-fresh produce, manage your cart, and keep track of orders in one place.</p>
        <div class="hero-grid">
          <div>
            <h3>Daily essentials</h3>
            <p>Vegetables, fruits, dairy, and pantry staples delivered fast.</p>
          </div>
          <div>
            <h3>Trusted farmers</h3>
            <p>Support local growers and see the full journey from farm to door.</p>
          </div>
        </div>
      </section>
    `,
        products: `
      <section class="content-card">
        <h2>Products</h2>
        <p>Fresh stock from nearby farms is now available.</p>
        <p><span class="stat-pill">Tomatoes</span><span class="stat-pill">Milk</span><span class="stat-pill">Eggs</span></p>
      </section>
    `,
        cart: `
      <section class="content-card">
        <h2>Your Cart</h2>
        <p>You have ${state.cartCount} items ready to checkout.</p>
      </section>
    `,
        orders: `
      <section class="content-card">
        <h2>My Orders</h2>
        <p>Your latest order was delivered this morning.</p>
      </section>
    `,
        farmer: `
      <section class="content-card">
        <h2>Farmer onboarding</h2>
        <p>Share your farm details and start selling products through the marketplace.</p>
      </section>
    `,
        farmer_dashboard: `
      <section class="content-card">
        <h2>Farmer Dashboard</h2>
        <p>Track sales, update stock, and manage your listings.</p>
      </section>
    `,
        farmer_sell: `
      <section class="content-card">
        <h2>Sell Product</h2>
        <p>Add a new listing for your harvest and reach your buyers.</p>
      </section>
    `,
        auth: `
      <section class="content-card">
        <h2>Account</h2>
        <p>You are currently signed out. Log in again to continue shopping.</p>
      </section>
    `,
    };

    pageContent.innerHTML = viewMap[state.activeView] || viewMap.home;
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
    if (window.innerWidth > 768) {
        closeMenu();
    }
});

renderView();
updateHeader();
