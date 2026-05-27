const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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

// 1. Signup (No OTP)
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

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@xoxo.com" && password === "admin123") return res.json({ user: { id: "admin", email, role: "admin" } });
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "FAIL" });
    res.json({ user: { id: user._id, email: user.email, role: user.role, cart: user.cart, wishlist: user.wishlist } });
});

// 3. Products
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

// 4. Orders
app.post('/api/orders/place', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

// Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));