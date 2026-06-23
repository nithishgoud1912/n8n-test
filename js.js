const express = require('express');
const router = express.Router();
const db = require('../db'); // Hypothetical DB connection

// SECURITY: Hardcoded AWS Credentials left in code
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// BUG & SECURITY: Race condition / Shared global state
// Storing local state globally means concurrent requests will overwrite each other's data
let currentCart = {}; 

// 1. BUG: Missing await/async handling on asynchronous DB call
// 2. QUALITY: No error handling (Try/Catch)
router.post('/checkout', (req, res) => {
    const { userId, items, totalAmount } = req.body;
    currentCart = { userId, items, totalAmount };

    // This returns a promise, but it's not awaited. Code execution moves on instantly.
    db.collection('orders').insertOne(currentCart); 
    
    // Will send "Order Processed" even if the database insertion fails
    res.status(200).json({ message: "Order processed successfully", cart: currentCart });
});

// 3. BUG: Type coercion exploit & Logic flaw (NaN / Negative numbers allowed)
// 4. SECURITY: No input sanitization or validation
router.post('/apply-discount', (req, res) => {
    const { discountCode, originalPrice } = req.body;
    
    // If a user passes "10" as a string, it concatenates instead of adding/subtracting
    // If they pass a negative number, they could increase their cart value or get free money
    let finalPrice = originalPrice;
    if (discountCode === "SUMMER50") {
        finalPrice = originalPrice - "50"; 
    }

    res.json({ finalPrice });
});

// 5. BUG: Missing null-check / Deep nested property crash ("Cannot read properties of undefined")
router.get('/order-status', (req, res) => {
    const order = db.getOrder(req.query.orderId); 
    
    // If getOrder returns null or undefined, accessing .delivery crashes the entire Node process
    const status = order.delivery.tracking.status; 
    res.send(`Your order status is: ${status}`);
});

// 6. SECURITY: NoSQL Injection vulnerability
// Passing an object like { "$ne": null } bypasses password verification entirely
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Vulnerable to NoSQL injection because req.body properties are passed directly to MongoDB finder
    db.collection('admins').findOne({ username: username, password: password }, (err, admin) => {
        if (admin) {
            res.send("Welcome Admin!");
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});

// 7. QUALITY: Blatant code duplication (Copy-pasted logging formatters)
function formatLogMessage(msg) {
    const date = new Date().toISOString();
    return `[${date}] - LOG - ${msg}`;
}
function formatErrorLogMessage(msg) {
    const date = new Date().toISOString();
    return `[${date}] - ERROR - ${msg}`;
}
function formatDebugLogMessage(msg) {
    const date = new Date().toISOString();
    return `[${date}] - DEBUG - ${msg}`;
}

module.exports = router;