// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";


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
const db = getFirestore(app);

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
    // Basic client-side validation
    if (!data.email || !data.password) {
        showAlert('Please enter a valid email and password.', 'error', 2000);
        return;
    }

    if (data.password !== data.confirmPassword) {
        showAlert('Passwords do not match.', 'error', 2000);
        return;
    }

    try {
        showLoader('Registering user...');
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        const user = userCredential.user;
        // 2. Save additional user information in Firestore

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            name: data.name || "",
            phone: data.phone || "",
            role: "buyer", // Default role for regular users
            createdAt: new Date()
        });
        showAlert('Registration successful. You can now log in.', 'success', 2000);
        return user;
    } catch (error) {
        console.error(error.code, error.message);
        const msg = getAuthErrorMessage(error.code);
        showAlert(msg, 'error', 2000);
        throw error;
    } finally {
        hideLoader();
    }
}


export async function registerFarmer(obj) {
    //event.preventDefault();
    try {
        showLoader('Registering farmer...');
        // 1. Create Firebase Authentication user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            obj.email,
            obj.password
        );
        const user = userCredential.user;
        // 2. Save additional user information in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            role: "farmer", // Default role for farmers
            createdAt: new Date(),
            email: user.email,
            name: obj.fullName,
            phone: obj.mobile,
            village: obj.village,
            city: obj.city,
            pinCode: obj.pinCode,
            crop: obj.crop,
            address: obj.address,
            privacy: obj.privacy
        });
        return user;
    } catch (error) {
        console.error(error.code, error.message);
        const msg = getAuthErrorMessage(error.code);
        showAlert(msg, 'error', 2000);
        throw error;
    } finally {
        hideLoader();
    }
}


// ======================
// Login
// ======================
export async function login(email, password) {
    try {
        showLoader('Logging in...');
        // Login with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Get user data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User profile not found.");
        }

        const userData = userSnap.data();
        const role = userData.role;

        console.log("Logged In:", user);
        console.log("Role:", role);

        // Set application state based on role
        if (role === "farmer") {
            state = {
                activeView: "farmer_dashboard",
                isLoggedIn: true,
                userRole: "farmer",
                isMenuOpen: false
            };

            renderView("farmer_dashboard");

        } else {
            state = {
                activeView: "home",
                isLoggedIn: true,
                userRole: "buyer",
                isMenuOpen: false
            };

            renderView("home");
        }
        localStorage.setItem(
            'currentUser',
            JSON.stringify({ user, userData })
        );

        return { user, userData };

    } catch (error) {
        console.error(error.code, error.message);
        throw error;
    } finally {
        hideLoader();
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
        name = user.userData.name || "";
        console.log("Logged in as:", name);
        showAlert('Login successful. Hello, ' + name + '!', 'success', 3000);
        let userNamePlaceholder = document.getElementById("userID_firebase");
        if (userNamePlaceholder) {
            userNamePlaceholder.innerHTML = `Hello ${name}`
        }
        return user;
    } catch (error) {
        console.error('Login failed', error);
        const msg = getAuthErrorMessage(error.code);
        showAlert(msg, 'error', 2000);
        throw error;
    }
}

// ======================
// Logout
// ======================
export async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        let userNamePlaceholder = document.getElementById("userID_firebase");
        if (userNamePlaceholder) {
            userNamePlaceholder.innerHTML = ``;
        }
    } catch (error) {
        console.error(error);
    }
}

// ======================
// Current User Listener
// ======================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // console.log("User Logged In");
        // console.log("UID:", user.uid);
        // console.log("Email:", user.email);
    } else {
        // console.log("No User Logged In");
    }
});

// Export auth if needed elsewhere
export { auth };

export async function addProductToFirestore(productData) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to add a product.');
    }

    if (!productData.name || !productData.price || !productData.quantity) {
        throw new Error('Product name, price, and quantity are required.');
    }

    const product = {
        ...productData,
        price: Number(productData.price) || 0,
        quantity: Number(productData.quantity) || 0,
        ownerUid: user.uid,
        ownerEmail: user.email || null,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'products'), product);
    return docRef.id;
}

export async function getFarmerProducts(showall = false) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to view products.');
    }

    let productsQuery = query(
        collection(db, 'products'),
        where('ownerUid', '==', user.uid)
    );
    if (showall) {
        productsQuery = query(collection(db, 'products'));
    }
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteFarmerProduct(productId) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to delete products.');
    }

    if (!productId) {
        throw new Error('Product ID is required.');
    }

    const productRef = doc(db, 'products', productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
        throw new Error('Product not found.');
    }

    const productData = productSnapshot.data();

    if (productData.ownerUid !== user.uid) {
        throw new Error('You are not authorized to delete this product.');
    }

    await deleteDoc(productRef);

    return true;
}


export async function updateFarmerProduct(productId, productData) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('You must be logged in to update products.');
    }

    if (!productId) {
        throw new Error('Product ID is required.');
    }

    if (!productData) {
        throw new Error('Product data is required.');
    }

    const productRef = doc(db, 'products', productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
        throw new Error('Product not found.');
    }

    const existingProduct = productSnapshot.data();

    if (existingProduct.ownerUid !== user.uid) {
        throw new Error('You are not authorized to update this product.');
    }

    await updateDoc(productRef, {
        name: productData.name,
        category: productData.category,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        unit: productData.unit,
        description: productData.description || '',
        harvestDate: productData.harvestDate || '',
        location: productData.location || '',
        updatedAt: new Date()
    });

    return true;
}




export async function getMandiLocations() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to view mandi locations.");
    }

    try {
        const q = query(collection(db, "mandi_locations"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching mandi locations:", error);
        throw new Error("Failed to fetch mandi locations.");
    }
}

export async function getMandiLocationById(mandiId) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in.");
    }

    try {
        const docRef = doc(db, "mandi_locations", mandiId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            id: docSnap.id,
            ...docSnap.data(),
        };
    } catch (error) {
        console.error("Error fetching mandi location:", error);
        throw error;
    }
}


export async function getSubMandiLocations(mandiId) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in.");
    }

    try {
        const docRef = doc(db, "sub_mandi_locations", mandiId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            id: docSnap.id,
            ...docSnap.data(),
        };
    } catch (error) {
        console.error("Error fetching mandi location:", error);
        throw error;
    }
}



export async function getFarmerRevenueSummary() {
    const products = await getFarmerProducts();
    const monthTotals = {};
    const yearTotals = {};

    products.forEach((product) => {
        const price = Number(product.price) || 0;
        const quantity = Number(product.quantity) || 0;
        const revenue = price * quantity;
        let createdAt = null;

        if (product.createdAt && typeof product.createdAt.toDate === 'function') {
            createdAt = product.createdAt.toDate();
        } else if (product.createdAt instanceof Date) {
            createdAt = product.createdAt;
        }

        if (!createdAt) {
            return;
        }

        const month = createdAt.toLocaleString('default', { month: 'short' });
        const year = createdAt.getFullYear();
        const monthKey = `${month} ${year}`;
        const yearKey = `${year}`;

        monthTotals[monthKey] = (monthTotals[monthKey] || 0) + revenue;
        yearTotals[yearKey] = (yearTotals[yearKey] || 0) + revenue;
    });

    const monthly = Object.entries(monthTotals)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([month, total]) => ({ month, total }));

    const yearly = Object.entries(yearTotals)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([year, total]) => ({ year, total }));

    const totalRevenue = yearly.reduce((sum, item) => sum + item.total, 0);

    return { totalRevenue, monthly, yearly };
}

export async function createMandiLocation(name, district, state) {
    try {
        const docRef = await addDoc(collection(db, "mandi_locations"), {
            name,
            district,
            state,
            createdAt: new Date(),
        });
        return {
            id: docRef.id,
            name,
            district,
            state,
        };
    } catch (error) {
        console.error("Error creating mandi:", error);
        throw error;
    }
}

export async function addToCart(productId) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not logged in");
    }

    const product = allProducts.find(item => item.id === productId);

    if (!product) {
        throw new Error("Product not found");
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User document does not exist");
        }

        const cart = userSnap.data().cart || [];

        const existingProduct = cart.find(
            item => item.productId === productId
        );

        let updatedCart;
        let newQuantity;

        if (existingProduct) {

            updatedCart = cart.map(item => {

                if (item.productId === productId) {
                    newQuantity = Number(item.quantity) + 1;

                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: newQuantity * Number(item.price)
                    };
                }

                return item;
            });

        } else {

            newQuantity = 1;

            updatedCart = [
                ...cart,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    price: Number(product.price),
                    totalPrice: Number(product.price)
                }
            ];
        }

        await updateDoc(userRef, {
            cart: updatedCart
        });

        // Update UI immediately
        updateCartQuantityUI(productId, newQuantity);

        return true;

    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
}
export async function decreaseCartQuantity(productId) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not logged in");
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User document does not exist");
        }

        const cart = userSnap.data().cart || [];

        let newQuantity = 0;

        const updatedCart = cart
            .map(item => {

                if (item.productId === productId) {

                    newQuantity = Number(item.quantity) - 1;

                    if (newQuantity <= 0) {
                        return null;
                    }

                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: newQuantity * Number(item.price)
                    };
                }

                return item;
            })
            .filter(item => item !== null);

        await updateDoc(userRef, {
            cart: updatedCart
        });

        // Update UI immediately
        updateCartQuantityUI(productId, Math.max(newQuantity, 0));

        return true;

    } catch (error) {
        console.error("Error decreasing quantity:", error);
        throw error;
    }
}

export async function removeFromCart() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not logged in");
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User document does not exist");
        }

        // const cart = userSnap.data().cart || [];

        // const updatedCart = cart.filter(
        //     item => item.productId !== productId
        // );

        await updateDoc(userRef, { cart: [] });

        // Update UI immediately
        // updateCartQuantityUI(productId, 0);

        return true;

    } catch (error) {
        console.error("Error removing product:", error);
        throw error;
    }
}

export async function getUserCart() {

    const user = auth.currentUser;

    // User is not logged in
    if (!user) {
        return [];
    }

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(userRef);

        // User document does not exist
        if (!userSnap.exists()) {
            return [];
        }

        const userData = userSnap.data();

        // Return cart or empty array
        const cart = userData.cart || [];


        return cart;

    } catch (error) {

        console.error(
            "Error getting user cart:",
            error
        );

        throw error;
    }
}


export async function saveOrder(order) {
    showLoader("Placing your order...");
    try {
        const user = auth.currentUser;

        if (!user) {
            showAlert("Please login first.", 'error');
            return;
        }

        await addDoc(
            collection(db, "users", user.uid, "orders"),
            {
                ...order,
                status: "Pending",
                createdAt: serverTimestamp()
            }
        );
        await removeFromCart();
    } catch (error) {
        throw new Error("Failed to place order.");
    } finally {
        hideLoader();
    }
}

export async function getOrders() {
    showLoader("Loading your orders...");
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("Please login first.");
        }

        const ordersRef = collection(
            db,
            "users",
            user.uid,
            "orders"
        );

        const querySnapshot = await getDocs(ordersRef);

        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return orders;

    } catch (error) {
        console.error("Failed to get orders:", error);
        throw new Error("Failed to load orders.");

    } finally {
        hideLoader();
    }
}


export async function forgotPassword() {
    const emailInput = document.getElementById("email");
    const email = emailInput?.value?.trim();
    if (!email) {
        showAlert('Please enter your email address.', 'error', 2000);
        return;
    }

    showLoader();

    try {
        await sendPasswordResetEmail(auth, email);
        showAlert('Password reset email has been sent. Please check your inbox / spam folder.', 'success', 9000);
    } catch (error) {
        const msg = getAuthErrorMessage(error.code);
        showAlert(msg, 'error', 2000);
    } finally {
        hideLoader();
    }
}

export async function getProductPrice() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in.");
    }

    showLoader();

    try {


        const querySnapshot = await getDocs(collection(db, "Product_price"));

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));













    } catch (error) {
        const msg = getAuthErrorMessage(error.code);
        showAlert(msg, 'error', 2000);
    } finally {
        hideLoader();
    }
}


window.forgotPassword = forgotPassword;
window.getOrders = getOrders;
window.saveOrder = saveOrder;
window.decreaseCartQuantity = decreaseCartQuantity;
window.removeFromCart = removeFromCart;
window.createMandiLocation = createMandiLocation;
window.addToCart = addToCart;
window.registerUser = registerUser;
window.getUserCart = getUserCart;
window.registerFarmer = registerFarmer;
window.loginUser = loginUser;
window.logout = logout;
window.addProductToFirestore = addProductToFirestore;
window.getFarmerProducts = getFarmerProducts;
window.getFarmerRevenueSummary = getFarmerRevenueSummary;
window.getMandiLocations = getMandiLocations;
window.getMandiLocationById = getMandiLocationById;
window.getSubMandiLocations = getSubMandiLocations;
window.deleteFarmerProduct = deleteFarmerProduct;
window.updateFarmerProduct = updateFarmerProduct;
window.getProductPrice = getProductPrice;