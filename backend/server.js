const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// Nodemailer Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS // Yahan 16-digit App Password hona chahiye
    }
});

let otpStore = {};

// Schemas
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    cart: { type: Array, default: [] },
    wishlist: { type: Array, default: [] }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: String, category: String, image: String,
    detail: String, color: { type: String, default: "bg-zinc-100" },
    stock: { type: Number, default: 0 }, createdAt: { type: Date, default: Date.now }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userId: String, items: Array, totalAmount: Number,
    shippingDetails: Object, status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. OTP Send
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "EMAIL ALREADY REGISTERED" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;
        await transporter.sendMail({
            from: `"XOXO ARCHIVE" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'XOXO ARCHIVE | IDENTITY VERIFICATION',
            html: `<div style="background:#000; color:#fff; padding:50px; text-align:center;"><h1>XOXO.</h1><p>Your Code: ${otp}</p></div>`
        });
        res.json({ message: "OTP SENT" });
    } catch (err) { 
        console.error("OTP Error:", err);
        res.status(500).json({ message: "MAIL ERROR", error: err.message }); 
    }
});

// 2. Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, otp } = req.body;
    if (!otpStore[email] || otpStore[email] !== otp) return res.status(400).json({ message: "INVALID OTP" });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ email, password: hashedPassword }).save();
        delete otpStore[email];
        res.status(201).json({ message: "SUCCESS" });
    } catch (err) { res.status(500).json({ message: "ERROR" }); }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@xoxo.com" && password === "admin123") return res.json({ user: { id: "admin", email, role: "admin" } });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "FAIL" });
    res.json({ user: { id: user._id, email: user.email, role: user.role } });
});

// 4. Products
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

// 5. Orders
app.post('/api/orders/place', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));