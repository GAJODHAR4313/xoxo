const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xoxo_archive';
mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

// --- NODEMAILER CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

let otpStore = {}; 

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    cart: { type: Array, default: [] },
    wishlist: { type: Array, default: [] }
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    detail: { type: String, required: true },
    color: { type: String, default: "bg-zinc-100" },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    shippingDetails: { type: Object, required: true },
    status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// --- AUTH & OTP ROUTES ---

// OTP Send for Signup
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "EMAIL ALREADY REGISTERED" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;
        const mailOptions = {
            from: `"XOXO ARCHIVE" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'XOXO ARCHIVE | IDENTITY VERIFICATION',
            html: `<div style="background:#000; color:#fff; padding:50px; text-align:center;"><h1 style="letter-spacing:15px; font-style:italic;">XOXO.</h1><p>Your Verification Code: ${otp}</p></div>`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP SENT" });
    } catch (err) { res.status(500).json({ message: "MAIL ERROR" }); }
});

// Forgot Password OTP
app.post('/api/auth/forgot-password-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "USER NOT FOUND" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;
        const mailOptions = {
            from: `"XOXO ARCHIVE" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'XOXO | PASSWORD RESET',
            html: `<div style="background:#000; color:#fff; padding:50px; text-align:center;"><h1 style="letter-spacing:15px; font-style:italic;">XOXO.</h1><p>Reset Code: ${otp}</p></div>`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP SENT" });
    } catch (err) { res.status(500).json({ message: "ERROR" }); }
});

// Reset Password Final (Hashing Fix Included)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!otpStore[email] || otpStore[email] !== otp) return res.status(400).json({ message: "INVALID OTP" });
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        delete otpStore[email];
        res.json({ message: "PASSWORD UPDATED" });
    } catch (err) { res.status(500).json({ message: "FAILED" }); }
});

// Final Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, otp } = req.body;
    if (!otpStore[email] || otpStore[email] !== otp) return res.status(400).json({ message: "INVALID OTP" });
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        delete otpStore[email];
        res.status(201).json({ message: "SUCCESS" });
    } catch (err) { res.status(500).json({ message: "ERROR" }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@xoxo.com" && password === "admin123") return res.json({ user: { id: "admin", email, role: "admin" } });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "FAIL" });
    res.json({ user: { id: user._id, email: user.email, role: user.role, cart: user.cart, wishlist: user.wishlist } });
});

// Delete Account
app.delete('/api/user/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "DELETED" });
    } catch (err) { res.status(500).json({ message: "FAILED" }); }
});

// --- PRODUCT ROUTES ---
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
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// --- ORDER ROUTES ---
app.post('/api/orders/place', async (req, res) => {
    const { items } = req.body;
    try {
        for (let item of items) {
            const p = await Product.findById(item._id);
            if (!p || p.stock < 1) return res.status(400).json({ message: `${item.name} SOLD OUT` });
        }
        const newOrder = new Order(req.body);
        await newOrder.save();
        for (let item of items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { stock: -1 } });
        }
        res.status(201).json(newOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

app.put('/api/admin/orders/:id', async (req, res) => {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
});

app.listen(5001, () => console.log("🚀 Server running on Port 5001"));