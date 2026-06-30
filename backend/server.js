// Force Redeployment Trigger
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// --- SCHEMAS ---
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    firstName: String,
    lastName: String,
    addresses: { type: Array, default: [] },
    cart: { type: Array, default: [] },
    wishlist: { type: Array, default: [] }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: String, category: String, image: String,
    images: { type: Array, default: [] },
    detail: String, color: { type: String, default: "bg-zinc-100" },
    sizes: { type: Array, default: [] },
    reviews: { type: Array, default: [] },
    rating: { type: Number, default: 0 },
    stock: { type: Number, default: 0 }, createdAt: { type: Date, default: Date.now }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userId: String, items: Array, totalAmount: Number,
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    shippingDetails: Object, status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
}));

const Coupon = mongoose.model('Coupon', new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "EMAIL ALREADY REGISTERED" });
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ email, password: hashedPassword }).save();
        res.status(201).json({ message: "SUCCESS" });
    } catch (err) { res.status(500).json({ message: "ERROR" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@xoxo.com" && password === "admin123") return res.json({ user: { id: "admin", email, role: "admin" } });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "FAIL" });
    res.json({ user: { id: user._id, email: user.email, role: user.role, cart: user.cart, wishlist: user.wishlist } });
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

app.post('/api/products/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { res.status(500).json(err); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/admin/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- FIXED SMS ROUTE ---
app.post('/api/admin/send-sms', async (req, res) => {
    const { numbers, message } = req.body;
    const API_KEY = "7a290809-e86d-46ab-ad49-90f941211d24";

    try {
        const formattedNumber = numbers.trim().startsWith('+') ? numbers.trim() : `+91${numbers.trim()}`;
        
        // Fetch devices first
        const devicesRes = await axios.get('https://api.textbee.dev/api/v1/gateway/devices', {
            headers: { 'x-api-key': API_KEY }
        });
        
        if (!devicesRes.data.data || devicesRes.data.data.length === 0) {
            return res.status(400).json({ success: false, message: "No devices found on TextBee" });
        }
        
        const deviceId = devicesRes.data.data[0]._id;
        
        // Send SMS
        const response = await axios.post(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
            recipients: [formattedNumber],
            message: message,
            simSubscriptionId: 2 // Use SIM 2 as requested
        }, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        
        console.log("Success Response from Gateway:", response.data);
        res.status(200).json({ success: true, message: "SMS triggered!" });
    } catch (err) {
        console.error("SMS Error:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: "Gateway Failed" });
    }
});

// --- USER PROFILE ROUTES ---
app.get('/api/user/:id', async (req, res) => {
    try {
        if (req.params.id === 'admin') {
            const orders = await Order.find({ userId: 'admin' }).sort({ createdAt: -1 });
            return res.json({
                user: { _id: 'admin', email: 'admin@xoxo.com', role: 'admin', addresses: [], cart: [], wishlist: [] },
                orders
            });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json({ user, orders });
    } catch (err) { res.status(500).json({ message: "Error loading profile" }); }
});

app.put('/api/user/:id', async (req, res) => {
    try {
        if (req.params.id === 'admin') {
            return res.json({ _id: 'admin', email: 'admin@xoxo.com', role: 'admin', addresses: [], cart: [], wishlist: [] });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Error updating profile" }); }
});

// --- NEW: USER DELETION ROUTE ---
app.delete('/api/user/delete/:id', async (req, res) => {
    try {
        if (req.params.id === 'admin') {
            return res.status(400).json({ message: "Admin account cannot be deleted" });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting account" });
    }
});

// --- NEW: PRODUCT STOCK DECREMENT ROUTE ---
app.put('/api/products/decrement/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.stock <= 0) {
            return res.status(400).json({ message: 'OUT_OF_STOCK' });
        }
        product.stock -= 1;
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Error decrementing stock" });
    }
});

// --- NEW: GET ORDERS BY USER ID ---
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user orders" });
    }
});

// --- PRODUCT REVIEWS ROUTE ---
app.post('/api/products/:id/reviews', async (req, res) => {
    try {
        const { userId, rating, text } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        
        product.reviews.push({ userId, rating, text, createdAt: new Date() });
        product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
        
        await product.save();
        res.json(product);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- COUPON ROUTES ---
app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
        if (!coupon) return res.status(404).json({ message: "Invalid or inactive coupon" });
        res.json({ discountPercent: coupon.discountPercent });
    } catch (err) { res.status(500).json({ message: "Error validating coupon" }); }
});

app.post('/api/admin/coupons', async (req, res) => {
    try {
        const code = req.body.code ? req.body.code.trim().toUpperCase() : '';
        const discountPercent = Number(req.body.discountPercent);
        
        if (!code) return res.status(400).json({ message: "Code is required" });
        if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
            return res.status(400).json({ message: "Discount must be a number between 1 and 100" });
        }

        const newCoupon = new Coupon({
            code,
            discountPercent
        });
        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (err) { res.status(500).json({ message: "Error creating coupon" }); }
});

app.get('/api/admin/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.delete('/api/admin/coupons/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- ANALYTICS ROUTE ---
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const orders = await Order.find();
        const users = await User.countDocuments();
        const products = await Product.countDocuments();
        
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length;
        
        res.json({
            totalRevenue,
            totalOrders: orders.length,
            activeOrders,
            totalUsers: users,
            totalProducts: products
        });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- ORDER PLACE ROUTE ---
app.post('/api/orders/place', async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingDetails, discountAmount, shippingFee } = req.body;
        const newOrder = new Order({
            userId, items, totalAmount, shippingDetails, discountAmount, shippingFee
        });
        await newOrder.save();
        
        // Decrement stock for purchased items
        for (const item of items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.qty } });
        }
        
        // Clear user's cart in the database upon successful order placement
        if (userId && userId !== 'admin' && mongoose.Types.ObjectId.isValid(userId)) {
            await User.findByIdAndUpdate(userId, { cart: [] });
        }
        
        res.status(201).json({ message: "Success", orderId: newOrder._id });
    } catch (err) { res.status(500).json({ message: "Error placing order" }); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));