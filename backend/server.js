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

// 1. Signup
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

// 3. User Data
app.get('/api/user/data/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ cart: user.cart || [], wishlist: user.wishlist || [] });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 4. Delete User
app.delete('/api/user/delete/:userId', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: "Account deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 5. Cart Sync
app.post('/api/cart/sync', async (req, res) => {
    try {
        const { userId, cartItems } = req.body;
        await User.findByIdAndUpdate(userId, { cart: cartItems });
        res.json({ message: "Cart synced" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 6. Wishlist Sync
app.post('/api/wishlist/sync', async (req, res) => {
    try {
        const { userId, wishlistItems } = req.body;
        await User.findByIdAndUpdate(userId, { wishlist: wishlistItems });
        res.json({ message: "Wishlist synced" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 7. Products — Get All
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

// 8. Products — Add
app.post('/api/products/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { res.status(500).json(err); }
});

// 9. Products — Delete
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 10. Products — Decrement stock when added to cart
app.put('/api/products/decrement/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.stock <= 0) return res.status(400).json({ message: "OUT_OF_STOCK" });
        product.stock = product.stock - 1;
        await product.save();
        res.json({ stock: product.stock });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 11. Orders — Place
app.post('/api/orders/place', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 12. Orders — Get by user
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 13. Admin — All Orders
app.get('/api/admin/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

// 14. Admin — Update Order Status
app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));