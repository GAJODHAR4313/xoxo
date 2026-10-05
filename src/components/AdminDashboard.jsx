import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Package, Users, Tag, Trash2 } from 'lucide-react';
import API_BASE_URL from '../config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [smsData, setSmsData] = useState({ numbers: '', message: '' });

  const [form, setForm] = useState({
    name: '', price: '', section: '', category: '', image: '', images: '',
    detail: '', color: 'bg-zinc-100', sizeStocks: {}
  });
  const [sizeInput, setSizeInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');

  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: 10 });
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', section: '' });
  const [sections, setSections] = useState([]);
  const [sectionForm, setSectionForm] = useState({ name: '' });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser || savedUser.role !== 'admin') {
      alert("Access Denied: Admins Only");
      window.location.href = "/";
      return;
    }
    fetchOrders();
    fetchProducts();
    fetchCoupons();
    fetchAnalytics();
    fetchCategories();
    fetchSections();
  }, []);

  const fetchOrders = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }); setOrders(res.data); } catch (err) { console.error(err); } };
  const fetchProducts = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/products`); setProducts(res.data); } catch (err) { console.error(err); } };
  const fetchCoupons = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/api/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } }); setCoupons(res.data); } catch (err) { console.error(err); } };
  const fetchAnalytics = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }); setAnalytics(res.data); } catch (err) { console.error(err); } };
  const fetchSections = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/sections`); setSections(res.data); } catch (err) { console.error(err); } };
  const fetchCategories = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/categories`); setCategories(res.data); } catch (err) { console.error(err); } };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const calculatedSizes = Object.keys(form.sizeStocks);
    const calculatedStock = Object.values(form.sizeStocks).reduce((a, b) => a + b, 0);

    const payload = {
      ...form,
      images: typeof form.images === 'string' ? form.images.split(',').map(s => s.trim()).filter(Boolean) : form.images,
      sizes: calculatedSizes,
      stock: calculatedStock,
      sizeStocks: form.sizeStocks
    };
    if (payload.images.length === 0 && payload.image) {
      payload.images = [payload.image];
    } else if (payload.images.length > 0 && !payload.image) {
      payload.image = payload.images[0];
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/products/add`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Product Added!");
      setForm({
        name: '', price: '', section: '', category: '', image: '', images: '',
        detail: '', color: 'bg-zinc-100', sizeStocks: {}
      });
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    }
  };

  const handleDeleteProduct = async (id) => { if (window.confirm("Delete Product?")) { const token = localStorage.getItem('token'); await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchProducts(); fetchAnalytics(); } };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/coupons`, couponForm, { headers: { Authorization: `Bearer ${token}` } });
      alert("Coupon Created!");
      fetchCoupons();
      setCouponForm({ code: '', discountPercent: 10 });
    } catch (err) {
      alert("Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => { if (window.confirm("Delete Coupon?")) { const token = localStorage.getItem('token'); await axios.delete(`${API_BASE_URL}/api/admin/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchCoupons(); } };

  const handleSendSMS = async () => {
    if (!smsData.numbers || !smsData.message) return alert("Enter details");
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/send-sms`, smsData, { headers: { Authorization: `Bearer ${token}` } });
      alert("SMS Sent Successfully!");
      setSmsData({ numbers: '', message: '' });
    } catch (err) {
      alert("Failed to send SMS.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/categories`, categoryForm, { headers: { 'Authorization': `Bearer ${token}` }});
      alert("Category Added!");
      fetchCategories();
      setCategoryForm({ name: '', type: 'Clothing' });
    } catch (err) { alert("Failed to add category."); }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete Category?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
        fetchCategories();
      } catch (err) { alert("Failed to delete category."); }
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/sections`, sectionForm, { headers: { 'Authorization': `Bearer ${token}` }});
      alert("Section Added!");
      fetchSections();
      setSectionForm({ name: '' });
    } catch (err) { alert("Failed to add section."); }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm("Delete Section?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/admin/sections/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
        fetchSections();
      } catch (err) { alert("Failed to delete section."); }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-primary pt-20 md:pt-0">
      <div className="w-full md:w-64 bg-black text-white p-6 flex flex-row md:flex-col gap-4 items-center md:items-stretch overflow-x-auto sticky top-20 md:top-0 z-30">
        <h2 className="font-black text-xl italic md:mb-10 text-center tracking-tighter mr-6 md:mr-0 flex-shrink-0">XOXO ADMIN</h2>
        <div className="flex flex-row md:flex-col gap-3 w-full">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'dashboard' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('orders')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'orders' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Orders</button>
          <button onClick={() => setActiveTab('products')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'products' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Inventory</button>
          <button onClick={() => setActiveTab('sections')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'sections' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Sections</button>
          <button onClick={() => setActiveTab('categories')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'categories' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Categories</button>
          <button onClick={() => setActiveTab('coupons')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'coupons' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Coupons</button>
          <button onClick={() => setActiveTab('marketing')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1 ${activeTab === 'marketing' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Marketing</button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-10">

        {activeTab === 'dashboard' && analytics && (
          <div className="space-y-8">
            <h3 className="font-black text-2xl uppercase italic">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border flex flex-col gap-2">
                <TrendingUp className="text-black/40 w-6 h-6 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Total Revenue</span>
                <span className="text-3xl font-black italic">₹{analytics.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border flex flex-col gap-2">
                <Package className="text-black/40 w-6 h-6 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Total Orders</span>
                <span className="text-3xl font-black italic">{analytics.totalOrders}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border flex flex-col gap-2">
                <Users className="text-black/40 w-6 h-6 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Total Users</span>
                <span className="text-3xl font-black italic">{analytics.totalUsers}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border flex flex-col gap-2">
                <Tag className="text-black/40 w-6 h-6 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Products</span>
                <span className="text-3xl font-black italic">{analytics.totalProducts}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">{orders.map(o => (
            <div key={o._id} className="bg-white p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-black text-[10px] italic">{o.shippingDetails?.firstName || 'Customer'}</p>
                <p className="text-[10px] text-black/50">₹{o.totalAmount} • {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <select value={o.status} onChange={(e) => { const token = localStorage.getItem('token'); axios.put(`${API_BASE_URL}/api/admin/orders/${o._id}`, { status: e.target.value }, { headers: { Authorization: `Bearer ${token}` } }).then(() => { fetchOrders(); fetchAnalytics(); })}} className="bg-black text-white text-[9px] p-2 rounded-lg">
                <option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option>
              </select>
            </div>
          ))}</div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-10">
            <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Name" value={form.name} className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Price" value={form.price} type="number" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({ ...form, price: e.target.value })} required />
              <select className="p-4 bg-zinc-50 rounded-xl text-xs font-bold" value={form.section} onChange={e => setForm({ ...form, section: e.target.value, category: '' })}>
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <select className="p-4 bg-zinc-50 rounded-xl text-xs font-bold" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {categories.filter(c => c.section === form.section).map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="sm:col-span-2 bg-zinc-50 p-4 rounded-xl space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/50">Per-Size Inventory</p>
                <div className="flex gap-2">
                  <input placeholder="Size (e.g. S, M, XL)" value={sizeInput} className="p-3 bg-white border border-black/5 rounded-lg text-xs flex-1" onChange={e => setSizeInput(e.target.value)} />
                  <input placeholder="Quantity" type="number" value={qtyInput} className="p-3 bg-white border border-black/5 rounded-lg text-xs flex-1" onChange={e => setQtyInput(e.target.value)} />
                  <button type="button" onClick={() => {
                    if (sizeInput && qtyInput) {
                      setForm({ ...form, sizeStocks: { ...form.sizeStocks, [sizeInput.toUpperCase()]: parseInt(qtyInput) } });
                      setSizeInput('');
                      setQtyInput('');
                    }
                  }} className="bg-black text-white px-4 rounded-lg text-xs font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(form.sizeStocks).map(([size, qty]) => (
                    <div key={size} className="bg-white border border-black/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black">
                      <span>{size}: {qty}</span>
                      <button type="button" onClick={() => {
                        const newStocks = { ...form.sizeStocks };
                        delete newStocks[size];
                        setForm({ ...form, sizeStocks: newStocks });
                      }} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                  {Object.keys(form.sizeStocks).length === 0 && <span className="text-xs text-black/30 italic">No sizes added yet.</span>}
                </div>
              </div>

              <input placeholder="Main Image URL" value={form.image} className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({ ...form, image: e.target.value })} required />
              <input placeholder="Extra Image URLs (comma separated)" value={form.images} className="p-4 bg-zinc-50 rounded-xl text-xs sm:col-span-2" onChange={e => setForm({ ...form, images: e.target.value })} />
              <textarea placeholder="Description" value={form.detail} className="p-4 bg-zinc-50 rounded-xl text-xs sm:col-span-2" onChange={e => setForm({ ...form, detail: e.target.value })} required />

              <button type="submit" className="bg-black text-white p-4 rounded-xl font-black text-xs uppercase sm:col-span-2 mt-4">Add Product</button>
            </form>

            <div className="space-y-4">
              {products.map(p => (
                <div key={p._id} className="bg-white p-4 rounded-2xl border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="font-black text-[10px] uppercase">{p.name}</p>
                      <p className="text-[9px] text-black/50">Stock: {p.stock} • ₹{p.price}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p._id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-10">
            <form onSubmit={handleAddSection} className="bg-white p-6 rounded-3xl border flex flex-col sm:flex-row gap-4">
              <input placeholder="Section Name (e.g. Shop, Watches)" value={sectionForm.name} className="flex-1 p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })} required />
              <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase">Add Section</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sections.map(s => (
                <div key={s._id} className="bg-white p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => handleDeleteSection(s._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                  </div>
                  <span className="text-2xl font-black italic">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-10">
            <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-3xl border flex flex-col sm:flex-row gap-4">
              <input placeholder="Category Name (e.g. Shirts)" value={categoryForm.name} className="flex-1 p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              <select value={categoryForm.section} onChange={e => setCategoryForm({ ...categoryForm, section: e.target.value })} className="w-full sm:w-48 p-4 bg-zinc-50 rounded-xl text-xs font-bold" required>
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase">Add</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c._id} className="bg-white p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => handleDeleteCategory(c._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                  </div>
                  <span className="text-2xl font-black italic">{c.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 w-fit px-3 py-1 rounded-full">{c.section}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-10">
            <form onSubmit={handleAddCoupon} className="bg-white p-6 rounded-3xl border flex flex-col sm:flex-row gap-4">
              <input placeholder="CODE (e.g. SUMMER20)" value={couponForm.code} className="flex-1 p-4 bg-zinc-50 rounded-xl text-xs uppercase" onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
              <input placeholder="Discount %" type="number" min="1" max="100" value={couponForm.discountPercent} className="w-full sm:w-32 p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setCouponForm({ ...couponForm, discountPercent: e.target.value })} required />
              <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase">Create</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div key={c._id} className="bg-white p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => handleDeleteCoupon(c._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                  </div>
                  <span className="text-2xl font-black italic">{c.code}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full">{c.discountPercent}% OFF</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-black text-lg">Marketing SMS</h3>
            <input
              placeholder="Enter mobile number"
              className="w-full p-4 bg-zinc-50 rounded-xl text-xs"
              value={smsData.numbers}
              onChange={e => setSmsData({ ...smsData, numbers: e.target.value })}
            />
            <textarea
              placeholder="Message..."
              className="w-full p-4 bg-zinc-50 rounded-xl text-xs h-32"
              value={smsData.message}
              onChange={e => setSmsData({ ...smsData, message: e.target.value })}
            />
            <button onClick={handleSendSMS} className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Send SMS</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
