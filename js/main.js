let state = {
    activeView: 'auth',
    isLoggedIn: false,
    userRole: 'buyer',
    cartCount: 2,
    isMenuOpen: false,
};
let alertTimer = null;


const pageContent = document.getElementById('pageContent');
const nav = document.getElementById('mainNav');
const cartCountLabel = document.getElementById('cartCountLabel');
const authAction = document.getElementById('authAction');


function showBuyerNav() {
    document.querySelectorAll('[data-buyer-nav="true"]').forEach(btn => {
        btn.style.display = 'block';
    });

    document.querySelectorAll('[data-farmer-nav="true"]').forEach(btn => {
        btn.style.display = 'none';
    });
}
function showFarmerNav() {
    document.querySelectorAll('[data-farmer-nav="true"]').forEach(btn => {
        btn.style.display = 'block';
    });

    document.querySelectorAll('[data-buyer-nav="true"]').forEach(btn => {
        btn.style.display = 'none';
    });
}


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
                document.querySelector('.site-footer').style.display = 'none';


                document.querySelectorAll('[data-buyer-nav="true"], [data-farmer-nav="true"] , #authAction')
                    .forEach(btn => {
                        btn.style.display = 'none';
                    });
                loadScript("js/auth.js", () => {
                    console.log('auth.js loaded');
                    init();
                    if (footer != null) {
                        footer.style.display = 'none';
                    }
                });
            } else {

                if (state.userRole === 'farmer') {
                    showFarmerNav();
                } else {
                    showBuyerNav();
                }
                document.querySelector(".site-footer")?.style.setProperty("display", "block");
                document.querySelector("#authAction")?.style.setProperty("display", "block");
                document.querySelector("#farmerRegisterBtn")?.style.setProperty("display", "none");
                if (state.activeView === 'farmer_dashboard') {
                    renderFarmerDashboard();
                }
                if (state.activeView === 'farmer_sell') {
                    getMandiLocations().then((locations) => {
                        const locationSelect = document.getElementById("farmer_city");
                        const blockSelect = document.getElementById("block_location");
                        const subLocationSelect = document.getElementById("mandi_location");

                        // Check farmer cities
                        if (locations?.length) {
                            locationSelect.innerHTML = locations
                                .map(loc => `<option value="${loc.id}">${loc.name}</option>`)
                                .join("");

                            // Load first city data
                            getMandiLocationById(locations[0].id).then((location) => {

                                // Check location
                                if (location?.Rural_block?.length) {

                                    // Load blocks
                                    blockSelect.innerHTML = location.Rural_block
                                        .map(block => `<option value="${block}">${block}</option>`)
                                        .join("");

                                    // Load sub-locations for first block
                                    getSubMandiLocations(location.Rural_block[0])
                                        .then((subLocations) => {
                                            subLocationSelect.innerHTML = subLocations?.NAME?.length
                                                ? subLocations.NAME
                                                    .map(subLoc => `<option value="${subLoc}">${subLoc}</option>`)
                                                    .join("")
                                                : `<option value="">No sub-locations available</option>`;
                                        });

                                } else {
                                    blockSelect.innerHTML =
                                        `<option value="">No blocks available</option>`;

                                    subLocationSelect.innerHTML =
                                        `<option value="">No sub-locations available</option>`;
                                }
                            });

                        } else {
                            locationSelect.innerHTML =
                                `<option value="">No locations available</option>`;

                            blockSelect.innerHTML =
                                `<option value="">No blocks available</option>`;

                            subLocationSelect.innerHTML =
                                `<option value="">No sub-locations available</option>`;
                        }
                    });
                }
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

async function loadSubLocations(block) {
    const subLocationSelect = document.getElementById("mandi_location");

    try {
        const subLocations = await getSubMandiLocations(block);

        if (subLocations?.NAME?.length) {
            subLocationSelect.innerHTML = subLocations.NAME
                .map(name => `<option value="${name}">${name}</option>`)
                .join("");
        } else {
            subLocationSelect.innerHTML =
                `<option value="">No sub-locations available</option>`;
        }
    } catch (err) {
        console.error(err);
        subLocationSelect.innerHTML =
            `<option value="">No sub-locations available</option>`;
    }
}
async function onCityChange(select) {
    const location = await getMandiLocationById(select.value);

    if (!location) return;

    const blockSelect = document.getElementById("block_location");

    if (location?.Rural_block?.length) {
        blockSelect.innerHTML = location.Rural_block
            .map(block => `<option value="${block}">${block}</option>`)
            .join("");

        await loadSubLocations(location.Rural_block[0]);
    } else {
        blockSelect.innerHTML = `<option value="">No blocks available</option>`;
        // Optional: Clear the sub-location dropdown as well
        document.getElementById("mandi_location").innerHTML =
            `<option value="">No sub-locations available</option>`;
    }

    if (location.Rural_block?.length) {
        await loadSubLocations(location.Rural_block[0]);
    }
}

async function onBlockChange(select) {
    await loadSubLocations(select.value);
}




function loadScript(src, callback) {
    if (document.querySelector(`script[src="${src}"]`)) {
        callback?.();
        return;
    }

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
}

function userAuthManage() {
    if (state.isLoggedIn) {
        state.isLoggedIn = false;
        state.userRole = 'guest';
        state.activeView = 'auth';
        logout().then(() => {
            document.querySelector('.site-footer').style.display = 'none';
            document.querySelector("#farmerRegisterBtn")?.style.setProperty("display", "block");
        }).catch((error) => {
            showAlert('Logout failed. Please try again.', 'error', 2000);
        });
    } else {
        state.isLoggedIn = true;
        state.userRole = 'buyer';
        state.activeView = 'home';
    }

    renderView();
    updateHeader();
}


function showAlert(message, type = "error", duration = 2500) {

    const modalElement = document.getElementById("alertModal");
    const title = document.getElementById("alertModalTitle");
    const messageElement = document.getElementById("alertModalMessage");
    const icon = document.getElementById("alertModalIcon");

    if (!modalElement || !title || !messageElement || !icon) {
        return;
    }

    clearTimeout(alertTimer);

    // Reset
    title.className = "modal-title";
    icon.className = "mb-3";

    if (type === "error") {

        title.textContent = "Error";
        title.classList.add("text-danger");

        icon.innerHTML = `
            <i class="bi bi-x-circle-fill text-danger"
               style="font-size: 55px;"></i>
        `;

    } else if (type === "success") {

        title.textContent = "Success";
        title.classList.add("text-success");

        icon.innerHTML = `
            <i class="bi bi-check-circle-fill text-success"
               style="font-size: 55px;"></i>
        `;

    } else if (type === "warning") {

        title.textContent = "Warning";
        title.classList.add("text-warning");

        icon.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill text-warning"
               style="font-size: 55px;"></i>
        `;

    } else {

        title.textContent = "Alert";

        icon.innerHTML = `
            <i class="bi bi-info-circle-fill text-primary"
               style="font-size: 55px;"></i>
        `;
    }

    messageElement.textContent = message;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();

    alertTimer = setTimeout(() => {
        modal.hide();
    }, duration);
}
function showLoader(message = "Please wait...") {
    const loader = document.getElementById("globalLoader");
    const loaderMessage = document.getElementById("loaderMessage");

    if (!loader) return;

    if (loaderMessage) {
        loaderMessage.textContent = message;
    }

    loader.classList.remove("d-none");
}

function hideLoader() {
    const loader = document.getElementById("globalLoader");

    if (!loader) return;

    loader.classList.add("d-none");
}

document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', (event) => {
        if (button.tagName === 'A') {
            event.preventDefault();
        }

        setView(button.dataset.view);
    });
});
authAction.addEventListener('click', userAuthManage);

renderView();
updateHeader();

// farmer dashboard specific code

async function addProduct() {
    const product = {
        name: document.getElementById("productName").value,
        category: document.getElementById("category").value,
        price: document.getElementById("price").value,
        quantity: document.getElementById("quantity").value,
        unit: document.getElementById("unit").value,
        description: document.getElementById("description").value,
        harvestDate: document.getElementById("harvestDate").value,
        location: document.getElementById("location").value,
        image: document.getElementById("image").files?.[0]?.name || ""
    };

    try {
        const productId = await window.addProductToFirestore(product);
        showAlert('Product added successfully', 'success', 2500);
        if (state.activeView === 'farmer_dashboard') {
            renderFarmerDashboard();
        }
    } catch (error) {
        showAlert(error.message || 'Could not add product. Please try again.', 'error', 2000);
    }
}

async function renderFarmerDashboard() {
    const productsContainer = document.getElementById('farmerProducts');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    const yearlyRevenueEl = document.getElementById('yearlyRevenue');

    if (!productsContainer || !totalRevenueEl || !monthlyRevenueEl || !yearlyRevenueEl) {
        return;
    }

    productsContainer.innerHTML = '<p>Loading products...</p>';
    totalRevenueEl.textContent = 'Loading...';
    monthlyRevenueEl.innerHTML = '';
    yearlyRevenueEl.innerHTML = '';

    try {
        const products = await window.getFarmerProducts();
        const revenue = await window.getFarmerRevenueSummary();

        if (products.length === 0) {
            productsContainer.innerHTML = '<p>No products added yet.</p>';
        } else {
            productsContainer.innerHTML = products.map((product) => `
                <div class="product-card">
                    <h4>${product.name}</h4>
                    <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                    <p><strong>Price:</strong> ₹${product.price}</p>
                    <p><strong>Quantity:</strong> ${product.quantity} ${product.unit || ''}</p>
                    <p><strong>Location:</strong> ${product.location || 'N/A'}</p>
                    <p><strong>Harvest Date:</strong> ${product.harvestDate || 'N/A'}</p>
                    <p>${product.description || ''}</p>
                </div>
            `).join('');
        }

        totalRevenueEl.textContent = `₹${revenue.totalRevenue.toFixed(2)}`;
        monthlyRevenueEl.innerHTML = revenue.monthly.length > 0
            ? revenue.monthly.map(item => `<li>${item.month}: ₹${item.total.toFixed(2)}</li>`).join('')
            : '<li>No monthly revenue yet.</li>';
        yearlyRevenueEl.innerHTML = revenue.yearly.length > 0
            ? revenue.yearly.map(item => `<li>${item.year}: ₹${item.total.toFixed(2)}</li>`).join('')
            : '<li>No yearly revenue yet.</li>';
    } catch (error) {
        console.error('Failed to load farmer dashboard data:', error);
        productsContainer.innerHTML = '<p>Unable to load products at this time.</p>';
        totalRevenueEl.textContent = '₹0';
        monthlyRevenueEl.innerHTML = '<li>Unable to load data.</li>';
        yearlyRevenueEl.innerHTML = '<li>Unable to load data.</li>';
    }
}


// farmer registration form submission
function openFarmerRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('farmerRegisterModal'), {
        backdrop: 'static', // Prevent closing when clicking outside
        keyboard: false     // Disable ESC key
    });
    modal.show();
}

function farmerRegister() {
    const farmer = {
        fullName: document.getElementById("fullName").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        email: document.getElementById("farmer_email").value.trim(),
        password: document.getElementById("farmer_password").value.trim(),
        village: document.getElementById("village").value.trim(),
        city: document.getElementById("city").value.trim(),
        pinCode: document.getElementById("pinCode").value.trim(),
        crop: document.getElementById("crop").value,
        address: document.getElementById("address").value.trim(),
        privacy: document.getElementById("privacy").checked
    };

    // Validation
    if (farmer.fullName === "") {
        return showAlert('Please enter Full Name.', 'error', 2000);
    }
    if (farmer.mobile === "") {
        return showAlert('Please enter Mobile Number.', 'error', 2000);
    }
    if (!/^[6-9]\d{9}$/.test(farmer.mobile)) {
        return showAlert('Please enter a valid 10-digit Mobile Number.', 'error', 2000);
    }
    if (farmer.email === "") {
        return showAlert('Please enter Email Address.', 'error', 2000);
    }
    if (!/^\S+@\S+\.\S+$/.test(farmer.email)) {
        return showAlert('Please enter a valid Email Address.', 'error', 2000);
    }
    if (farmer.password === "") {
        return showAlert('Please enter Password.', 'error', 2000);
    }
    if (farmer.password.length < 6) {
        return showAlert('Password must be at least 6 characters.', 'error', 2000);
    }
    if (farmer.village === "") {
        return showAlert('Please enter Village / Area.', 'error', 2000);
    }
    if (farmer.city === "") {
        return showAlert('Please enter City / District.', 'error', 2000);
    }

    if (farmer.pinCode === "") {
        return showAlert('Please enter PIN Code.', 'error', 2000);
    }

    if (!/^\d{6}$/.test(farmer.pinCode)) {
        return showAlert('PIN Code must be 6 digits.', 'error', 2000);
    }

    if (farmer.crop === "") {
        return showAlert('Please select Crop Production Type.', 'error', 2000);
    }

    if (farmer.address === "") {
        return showAlert('Please enter Postal Address.', 'error', 2000);
    }

    if (!farmer.privacy) {
        return showAlert('Please accept the Privacy Policy.', 'error', 2000);
    }

    // All validations passed
    registerFarmer(farmer)
        .then(() => {
            showAlert('Registration Successful!', 'success', 2500);

            const modal = bootstrap.Modal.getInstance(
                document.getElementById("farmerRegisterModal")
            );

            if (modal) {
                modal.hide();
            }
        })
        .catch((error) => {
            console.error("Registration failed:", error);
            showAlert('Registration failed. Please try again.', 'error', 2000);

        });





    // Send to API/Firebase here
}
