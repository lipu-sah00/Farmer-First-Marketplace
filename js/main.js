let state = {
    activeView: 'auth',
    isLoggedIn: false,
    userRole: 'buyer',
    cartCount: 0,
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
    // nav.classList.toggle('open', state.isMenuOpen && state.isLoggedIn);
}

function renderView(view, callback) {
    if (view) {
        state.activeView = view;
    }
    setActiveNav(state.activeView);

    const footer = document.querySelector(".site-footer");
    const viewMap = {
        home: 'module/buyer/home.html',
        products: 'module/buyer/products.html',
        cart: 'module/buyer/cart.html',
        orders: 'module/buyer/orders.html',
        confirm_order: 'module/buyer/confirm-order.html',
        farmer: 'module/farmer/farmer.html',
        farmer_dashboard: 'module/farmer/farmer_dashboard.html',
        farmer_sell: 'module/farmer/farmer_sell.html',
        auth: 'module/auth/auth.html',
        about: 'module/common/aboutus.html',
        privacy: 'module/common/privacy.html',
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
            if (callback) {
                callback();
            }
            if (state.activeView === "auth") {
                document.querySelector('.site-footer').style.display = 'none';


                document.querySelectorAll('[data-buyer-nav="true"], [data-farmer-nav="true"] , #authAction')
                    .forEach(btn => {
                        btn.style.display = 'none';
                    });

                const storedUser = JSON.parse(
                    localStorage.getItem('currentUser')
                );

                if (storedUser?.user && storedUser?.userData) {
                    state.isLoggedIn = true;
                    state.userRole = storedUser.userData.role;
                    state.activeView = storedUser.activeView || (state.userRole === 'farmer' ? 'farmer_dashboard' : 'home');
                    renderView(state.activeView);
                } else {
                    loadScript("js/auth.js", () => {
                        init();
                        if (footer != null) {
                            footer.style.display = 'none';
                        }
                    });
                }

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
                if (state.activeView === 'products') {
                    renderAllProducts();
                }
                if (state.activeView === 'cart') {
                    renderMyCart();
                }
                if (state.activeView === 'home') {
                    getUserCart().then((cart) => {
                        state.cartCount = cart?.length || 0;
                        updateHeader();
                    })
                }
                if (state.activeView === 'orders') {
                    renderOrders();
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
function setActiveNav(view) {
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
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
function footerFnCall(page) {
    if (page == 'about') {
        renderView('about', () => {
        });
    }
    if (page == 'privacy') {
        renderView('privacy', () => {
        });
    }
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

    showLoader();

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
    } finally {
        hideLoader();
    }
}



function getProductById(productId) {
    return allProducts.find(
        product => product.id === productId
    );
}

function updateCartQuantityUI(productId, quantity) {

    const quantityElement = document.getElementById(
        `cart-quantity-${productId}`
    );

    if (quantityElement) {
        quantityElement.textContent = quantity;
    }
}

async function renderMyCart() {

    const cartContainer = document.getElementById('buyerCart');
    const totalPriceElement = document.getElementById('cartTotal');

    if (!cartContainer) {
        return;
    }

    showLoader();

    try {

        allProducts = await window.getFarmerProducts(true);

        const cart = await window.getUserCart();

        console.log("User cart:", cart);

        state.cartCount = cart?.length || 0;
        updateHeader();

        // Empty cart
        if (!cart || cart.length === 0) {

            cartContainer.innerHTML = `
                <div class="cart-card">

                    <div class="empty-cart">
                        <i class="bi bi-cart-x"></i>
                        <h4>Your cart is empty</h4>
                        <p>Add some products to your cart.</p>
                    </div>

                </div>
            `;

            if (totalPriceElement) {
                totalPriceElement.innerHTML = '₹0.00';
            }

            return;
        }

        // Calculate total
        let totalPrice = 0;

        cart.forEach((product) => {
            totalPrice += Number(product.totalPrice || 0);
        });

        if (totalPriceElement) {
            totalPriceElement.innerHTML = `₹${totalPrice.toFixed(2)}`;
        }

        // Single cart card
        cartContainer.innerHTML = `
            <div class="cart-card">

                <!-- Header -->
                <div class="cart-header">

                    <div>
                        <h3>
                            <i class="bi bi-cart3"></i>
                            My Cart
                        </h3>

                        <span>
                            ${cart.length} item${cart.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div class="cart-item-count">
                        ${cart.length}
                    </div>

                </div>


                <!-- Products -->
                <div class="cart-products">

                    ${cart.map((product, index) => `

                        <div class="cart-product">

                            <div class="product-number">
                                ${index + 1}
                            </div>

                            <div class="product-info">

                                <h4>
                                    ${product.name || 'Product'}
                                </h4>

                                <div class="product-meta">

                                    <span>
                                        <i class="bi bi-box"></i>
                                        Quantity:
                                        <strong>${product.quantity || 0}</strong>
                                    </span>

                                    <span>
                                        <i class="bi bi-currency-rupee"></i>
                                        Price:
                                        <strong>
                                            ₹${Number(product.totalPrice || 0).toFixed(2)}
                                        </strong>
                                    </span>

                                </div>

                            </div>

                           

                        </div>

                    `).join('')}

                </div>


                <!-- Cart Summary -->
                <div class="cart-summary">

                    <div class="summary-row">
                        <span>Total Items</span>
                        <strong>${cart.length}</strong>
                    </div>

                    <div class="summary-row total-row">
                        <span>Grand Total</span>

                        <strong>
                            ₹${totalPrice.toFixed(2)}
                        </strong>

                        <button class="btn btn-success" onclick="handleCheckout('${cart[0]?.productId || ''}', '${totalPrice.toFixed(2)}', '${cart.length}')">Checkout</button>

                    </div>

                </div>

            </div>
        `;

    } catch (error) {

        console.error('Failed to load cart:', error);

        cartContainer.innerHTML = `
            <div class="cart-card cart-error">

                <i class="bi bi-exclamation-triangle"></i>

                <h4>Unable to load cart</h4>

                <p>Please try again later.</p>

            </div>
        `;

        if (totalPriceElement) {
            totalPriceElement.innerHTML = '₹0.00';
        }

    } finally {

        hideLoader();

    }
}

function handleCheckout(productId, totalPrice, itemCount) {
    renderView('confirm_order', () => {
        const totalPriceElement =
            document.getElementById('confirmGrandTotal');

        const itemCountElement =
            document.getElementById('confirmTotalItems');


        if (totalPriceElement) {
            totalPriceElement.textContent =
                `₹${Number(totalPrice).toFixed(2)}`;
        }


        if (itemCountElement) {
            itemCountElement.textContent = itemCount;
        }

    });
}


async function placeOrder() {

    // Delivery details
    const deliveryName =
        document.getElementById('deliveryName')?.value.trim();

    const deliveryMobile =
        document.getElementById('deliveryMobile')?.value.trim();

    const deliveryAddress =
        document.getElementById('deliveryAddress')?.value.trim();

    const deliveryCity =
        document.getElementById('deliveryCity')?.value.trim();

    const deliveryState =
        document.getElementById('deliveryState')?.value.trim();

    const deliveryPincode =
        document.getElementById('deliveryPincode')?.value.trim();


    // Payment method
    const paymentMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value;


    // Order summary
    const totalItems =
        document.getElementById('confirmTotalItems')?.textContent.trim();

    const grandTotalText =
        document.getElementById('confirmGrandTotal')?.textContent.trim();

    // Remove ₹ and convert to number
    const grandTotal =
        Number(grandTotalText.replace(/[₹,]/g, ''));


    // Create order object
    const order = {

        delivery: {
            name: deliveryName,
            mobile: deliveryMobile,
            address: deliveryAddress,
            city: deliveryCity,
            state: deliveryState,
            pincode: deliveryPincode
        },

        payment: {
            method: paymentMethod
        },

        summary: {
            totalItems: Number(totalItems),
            grandTotal: grandTotal
        }

    };

    await saveOrder(order)
        .then(() => {
            showAlert('Order placed successfully!', 'success', 2500);
        })
        .catch((error) => {
            showAlert('Order placement failed. Please try again.', 'error', 2000);
        })
        .finally(() => {
            renderView('home');
        });
}

async function renderOrders() {
    const ordersContainer = document.getElementById("ordersContainer");
    if (!ordersContainer) {
        return;
    }
    try {
        const orders = await getOrders();
        orders[0].status = 'delivered';
        orders[1].status = 'cancelled'
        orders[2].status = 'shipped'

        if (!orders.length) {
            ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <div class="empty-orders-icon">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <h5>No orders yet</h5>
                    <p>Start shopping and your orders will appear here.</p>
                    <button class="btn btn-success btn-sm" data-view="products">
                        <i class="bi bi-bag me-1"></i>Start Shopping
                    </button>
                </div>
            `;
            return;
        }
        ordersContainer.innerHTML = `
            <div class="row g-3">
                ${orders.map(order => `
                    <div class="col-xl-3 col-lg-4 col-md-6 col-12">
                        <div class="order-card h-100">
                            <div class="order-card-header">
                                <div>
                                    <small class="order-label">ORDER</small>
                                    <h6 class="order-id mb-0">#${order.id}</h6>
                                </div>
                                <span class="order-status ${getOrderStatusClass(order.status)}">
                                    <i class="bi bi-circle-fill"></i>
                                    ${order.status || "Pending"}
                                </span>
                            </div>
                            <div class="order-divider"></div>
                            <div class="order-info">
                                <div class="order-info-item">
                                    <div class="order-icon">
                                        <i class="bi bi-person"></i>
                                    </div>
                                    <div>
                                        <small>Delivery To</small>
                                        <p>${order.delivery?.name || "N/A"}</p>
                                    </div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-icon">
                                        <i class="bi bi-geo-alt"></i>
                                    </div>
                                    <div>
                                        <small>Address</small>
                                        <p>
                                            ${order.delivery?.address || "N/A"},
                                            ${order.delivery?.city || ""},
                                            ${order.delivery?.state || ""}
                                            - ${order.delivery?.pincode || ""}
                                        </p>
                                    </div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-icon">
                                        <i class="bi bi-credit-card"></i>
                                    </div>
                                    <div>
                                        <small>Payment</small>
                                        <p>${order.payment?.method || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="order-summary">
                                <div>
                                    <small>Items</small>
                                    <strong>
                                        <i class="bi bi-bag me-1"></i>
                                        ${order.summary?.totalItems || 0}
                                    </strong>
                                </div>
                                <div class="text-end">
                                    <small>Total Amount</small>
                                    <strong class="order-total">
                                        ₹${Number(order.summary?.grandTotal || 0).toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    } catch (error) {
        console.error(error);
        ordersContainer.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-circle"></i>
                Unable to load your orders.
            </div>
        `;
    }
}
function getOrderStatusClass(status) {
    const value = String(status || "").toLowerCase();
    if (value === "delivered" || value === "completed") {
        return "status-success";
    }
    if (value === "cancelled" || value === "canceled") {
        return "status-danger";
    }
    if (value === "shipped" || value === "out for delivery") {
        return "status-primary";
    }
    return "status-warning";
}

let allProducts = [];
let userCart = [];

function searchProducts(value) {
    const searchInput = document.getElementById("productSearch");
    const searchTerm = (value ?? searchInput?.value ?? "").trim().toLowerCase();
    const filteredProducts = allProducts.filter(product =>
        product.name?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
    );
    renderProductCards(filteredProducts);
}

function renderProductCards(products) {
    const productsContainer = document.getElementById('buyerProducts');
    if (!productsContainer) {
        return;
    }

    productsContainer.innerHTML = products.map(product => {
        const cartItem = userCart.find(item => item.productId === product.id);
        const quantity = cartItem ? Number(cartItem.quantity) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="cart-actions">
                    <button class="cart-btn quantity-btn" title="Decrease Quantity" onclick="decreaseCartQuantity('${product.id}')" ${quantity === 0 ? 'disabled' : ''}>
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="cart-quantity" id="cart-quantity-${product.id}">
                        ${quantity}
                    </span>
                    <button class="cart-btn quantity-btn" title="Increase Quantity" onclick="addToCart('${product.id}')">
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="cart-btn remove-cart-btn" title="Remove from Cart" onclick="removeFromCart('${product.id}')" ${quantity === 0 ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="product-content">
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <p>
                            <strong>Category:</strong>
                            ${product.category || 'N/A'}
                        </p>
                        <p>
                            <strong>Price:</strong>
                            ₹${product.price}
                        </p>
                        <p>
                            <strong>Harvest on:</strong>
                            ${product.harvestDate || 'N/A'}
                        </p>
                    </div>
                    <div class="product-image">
                        <img src="${product?.image || 'assets/img2.jpg'}" alt="${product?.name || 'Product'}" onerror="this.src='assets/img2.jpg'">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (!products.length) {
        productsContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-search fs-3"></i>
                <p class="mt-2 mb-0">No products found.</p>
            </div>
        `;
    }
}

async function renderAllProducts() {
    const productsContainer = document.getElementById('buyerProducts');

    if (!productsContainer) {
        return;
    }

    showLoader();

    try {
        allProducts = await window.getFarmerProducts(true);
        userCart = await window.getUserCart();
        renderProductCards(allProducts);
    } catch (error) {
        console.error('Failed to load Products:', error);
        productsContainer.innerHTML = '<p>Unable to load products at this time.</p>';
    } finally {
        hideLoader();
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
