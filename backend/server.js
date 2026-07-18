// Force Redeployment Trigger
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
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
    sizeStocks: { type: Object, default: {} },
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
        const user = await new User({ email, password: hashedPassword }).save();
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'xoxo_archive_secret_key_2026_secure', { expiresIn: '7d' });
        res.status(201).json({ message: "SUCCESS", token, user: { id: user._id, email: user.email, role: user.role, cart: user.cart, wishlist: user.wishlist } });
    } catch (err) { res.status(500).json({ message: "ERROR" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@xoxo.com" && password === "admin123") {
        const token = jwt.sign({ id: "admin", email, role: "admin" }, process.env.JWT_SECRET || 'xoxo_archive_secret_key_2026_secure', { expiresIn: '7d' });
        return res.json({ token, user: { id: "admin", email, role: "admin" } });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "FAIL" });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'xoxo_archive_secret_key_2026_secure', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, cart: user.cart, wishlist: user.wishlist } });
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

app.post('/api/products/add', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { res.status(500).json(err); }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- FIXED SMS ROUTE ---
app.post('/api/admin/send-sms', authenticateToken, requireAdmin, async (req, res) => {
    const { numbers, message } = req.body;
    const API_KEY = process.env.TEXTBEE_API_KEY || "7a290809-e86d-46ab-ad49-90f941211d24";

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
app.get('/api/user/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Access Denied: Unauthorized profile access" });
        }
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

app.put('/api/user/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Access Denied: Unauthorized profile update" });
        }
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
app.delete('/api/user/delete/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Access Denied: Unauthorized account deletion" });
        }
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

// --- NEW: GET ORDERS BY USER ID ---
app.get('/api/orders/user/:userId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({ message: "Access Denied: Unauthorized order history access" });
        }
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user orders" });
    }
});

// --- PRODUCT REVIEWS ROUTE ---
app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { userId, rating, text } = req.body;
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: "Access Denied: Cannot post review as another user" });
        }
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

app.post('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
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

app.get('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.delete('/api/admin/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- ANALYTICS ROUTE ---
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
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
app.post('/api/orders/place', authenticateToken, async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingDetails, discountAmount, shippingFee } = req.body;
        
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: "Access Denied: Unauthorized order placement" });
        }

        // Verify stock before placing order
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.name}` });
            
            // Check size specific stock if sizeStocks is defined
            if (item.selectedSize && product.sizeStocks && typeof product.sizeStocks[item.selectedSize] === 'number') {
                const available = product.sizeStocks[item.selectedSize];
                if (available < item.qty) {
                    return res.status(400).json({ message: `OUT_OF_STOCK: ${product.name} (Size ${item.selectedSize}) only has ${available} left in stock!` });
                }
            } else if (product.stock < item.qty) {
                return res.status(400).json({ message: `OUT_OF_STOCK: ${product.name} only has ${product.stock} left in stock!` });
            }
        }

        const newOrder = new Order({
            userId, items, totalAmount, shippingDetails, discountAmount, shippingFee
        });
        await newOrder.save();
        
        // Decrement stock for purchased items
        for (const item of items) {
            const updateFields = { $inc: { stock: -item.qty } };
            if (item.selectedSize) {
                updateFields.$inc[`sizeStocks.${item.selectedSize}`] = -item.qty;
            }
            await Product.findByIdAndUpdate(item._id, updateFields);
        }
        
        // Clear user's cart in the database upon successful order placement
        if (userId && userId !== 'admin' && mongoose.Types.ObjectId.isValid(userId)) {
            await User.findByIdAndUpdate(userId, { cart: [] });
        }

        // Send confirmation email asynchronously via Nodemailer
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            const recipientEmail = shippingDetails?.email || req.user?.email;
            if (recipientEmail) {
                const itemsListHtml = items.map(i => `<li><b>${i.name}</b> (${i.selectedSize || 'Standard'}) x ${i.qty} - ₹${(i.price * i.qty).toLocaleString()}</li>`).join('');
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipientEmail,
                    subject: `XOXO Archive - Order Confirmed (#${newOrder._id.toString().slice(-6).toUpperCase()})`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h1 style="background: #000; color: #fff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; text-transform: uppercase; font-style: italic;">XOXO Archive</h1>
                        <div style="padding: 20px;">
                          <h2>Thank you for your order, ${shippingDetails?.firstName || 'Valued Customer'}!</h2>
                          <p>Your order has been successfully placed and is now being processed.</p>
                          <h3>Order Details (ID: #${newOrder._id.toString().slice(-8).toUpperCase()})</h3>
                          <ul>${itemsListHtml}</ul>
                          <p><b>Subtotal/Discount Adjusted:</b> ₹${totalAmount.toLocaleString()}</p>
                          <p><b>Delivery Address:</b> ${shippingDetails?.address}, ${shippingDetails?.city}, ${shippingDetails?.zip}</p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                          <p style="font-size: 11px; color: #888; text-align: center;">XOXO ARCHIVE 2026 • ALL RIGHTS RESERVED</p>
                        </div>
                      </div>
                    `
                };
                transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err.message));
            }
        }
        
        res.status(201).json({ message: "Success", orderId: newOrder._id });
    } catch (err) { res.status(500).json({ message: err.message || "Error placing order" }); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));