import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, TrendingUp, Users, Package, Tag } from 'lucide-react';
import API_BASE_URL from '../config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [smsData, setSmsData] = useState({ numbers: '', message: '' });
  
  const [form, setForm] = useState({ 
    name: '', price: '', category: 'Tees', image: '', images: '', 
    detail: '', color: 'bg-zinc-100', sizes: '', stock: 0 
  });

  const [imagesList, setImagesList] = useState(['']);
  const [sizeStocks, setSizeStocks] = useState({});

  const handleImageChange = (idx, value) => {
    setImagesList(prev => prev.map((url, i) => i === idx ? value : url));
  };

  const handleAddImageUrl = () => {
    setImagesList(prev => [...prev, '']);
  };

  const handleRemoveImageUrl = (idx) => {
    setImagesList(prev => prev.filter((_, i) => i !== idx));
  };

  const getSizesForCategory = (cat) => {
    const footwear = ["Nike", "Adidas", "New Balance", "Asics"];
    const watches = ["Rolex", "Omega", "Cartier", "Seiko", "Casio", "Accessories"];
    if (footwear.includes(cat)) {
      return ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
    }
    if (watches.includes(cat)) {
      return ["Standard"];
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  };

  const handleCategoryChange = (cat) => {
    setForm({ ...form, category: cat });
    setSizeStocks({});
  };
  
  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: 10 });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => { 
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!savedUser || savedUser.role !== 'admin' || !token) {
      alert("Access Denied: Admins Only");
      window.location.href = "/";
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchOrders(); 
    fetchProducts(); 
    fetchCoupons();
    fetchAnalytics();
  }, []);

  const fetchOrders = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/orders`, { headers: getAuthHeaders() }); setOrders(res.data); } catch (err) { console.error(err); } };
  const fetchProducts = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/products`); setProducts(res.data); } catch (err) { console.error(err); } };
  const fetchCoupons = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/coupons`, { headers: getAuthHeaders() }); setCoupons(res.data); } catch (err) { console.error(err); } };
  const fetchAnalytics = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, { headers: getAuthHeaders() }); setAnalytics(res.data); } catch (err) { console.error(err); } };

  const handleAddProduct = async (e) => { 
    e.preventDefault(); 
    const filteredImages = imagesList.map(s => s.trim()).filter(Boolean);
    const activeSizes = Object.keys(sizeStocks).filter(size => sizeStocks[size] > 0);
    const totalStock = Object.values(sizeStocks).reduce((acc, val) => acc + val, 0);

    const payload = {
        ...form,
        image: filteredImages[0] || '',
        images: filteredImages,
        sizes: activeSizes,
        sizeStocks: sizeStocks,
        stock: totalStock
    };
    try {
      await axios.post(`${API_BASE_URL}/api/products/add`, payload, { headers: getAuthHeaders() }); 
      alert("Product Added!"); 
      setForm({ 
        name: '', price: '', category: 'Tees', image: '', images: '', 
        detail: '', color: 'bg-zinc-100', sizes: '', stock: 0 
      });
      setImagesList(['']);
      setSizeStocks({});
      fetchProducts(); 
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    }
  };
  
  const handleDeleteProduct = async (id) => { if(window.confirm("Delete Product?")) { await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers: getAuthHeaders() }); fetchProducts(); fetchAnalytics(); } };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/admin/coupons`, couponForm, { headers: getAuthHeaders() });
        alert("Coupon Created!");
        fetchCoupons();
        setCouponForm({ code: '', discountPercent: 10 });
    } catch(err) {
        alert("Failed to create coupon.");
    }
  };
  
  const handleDeleteCoupon = async (id) => { if(window.confirm("Delete Coupon?")) { await axios.delete(`${API_BASE_URL}/api/admin/coupons/${id}`, { headers: getAuthHeaders() }); fetchCoupons(); } };

  const handleSendSMS = async () => {
    if (!smsData.numbers || !smsData.message) return alert("Enter details");
    try {
      await axios.post(`${API_BASE_URL}/api/admin/send-sms`, smsData, { headers: getAuthHeaders() });
      alert("SMS Sent Successfully!");
      setSmsData({ numbers: '', message: '' }); 
    } catch (err) { 
      alert("Failed to send SMS."); 
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
              <select value={o.status} onChange={(e) => axios.put(`${API_BASE_URL}/api/admin/orders/${o._id}`, {status: e.target.value}, { headers: getAuthHeaders() }).then(() => { fetchOrders(); fetchAnalytics(); })} className="bg-black text-white text-[9px] p-2 rounded-lg">
                <option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option>
              </select>
            </div>
          ))}</div>
        )}

        {activeTab === 'products' && (
            <div className="space-y-10">
                <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Name" value={form.name} className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, name: e.target.value})} required />
                  <input placeholder="Price" value={form.price} type="number" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, price: e.target.value})} required />
                  <select className="p-4 bg-zinc-50 rounded-xl text-xs font-bold" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                      <optgroup label="Apparel & Accessories">
                          <option value="Tees">Tees / T-Shirts</option>
                          <option value="Shirts">Shirts</option>
                          <option value="Bottoms">Bottoms</option>
                          <option value="Outerwear">Outerwear</option>
                          <option value="Accessories">Accessories</option>
                      </optgroup>
                      <optgroup label="Footwear Brands">
                          <option value="Nike">Nike</option>
                          <option value="Adidas">Adidas</option>
                          <option value="New Balance">New Balance</option>
                          <option value="Asics">Asics</option>
                      </optgroup>
                      <optgroup label="Watches Brands">
                          <option value="Rolex">Rolex</option>
                          <option value="Omega">Omega</option>
                          <option value="Cartier">Cartier</option>
                          <option value="Seiko">Seiko</option>
                          <option value="Casio">Casio</option>
                      </optgroup>
                  </select>

                  <div className="sm:col-span-2 bg-zinc-50/50 p-6 rounded-3xl border border-black/5 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/50 block">Sizes & Stock Quantities</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {getSizesForCategory(form.category).map(size => (
                        <div key={size} className="bg-white p-3 rounded-2xl border border-black/5 flex items-center justify-between gap-2">
                          <span className="text-xs font-black italic">{size}</span>
                          <input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            value={sizeStocks[size] || ''} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setSizeStocks(prev => ({ ...prev, [size]: val }));
                            }}
                            className="w-16 p-2 bg-zinc-50 rounded-lg text-xs text-right outline-none font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/50 block animate-pulse">Product Images Carousel</span>
                    {imagesList.map((url, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <input 
                            placeholder={`Image URL ${idx + 1} ${idx === 0 ? '(Main Image)' : ''}`} 
                            value={url} 
                            onChange={(e) => handleImageChange(idx, e.target.value)} 
                            className="w-full p-4 bg-zinc-50 rounded-xl text-xs outline-none border border-black/5 focus:border-black transition-all" 
                            required={idx === 0}
                          />
                          {url && (
                            <div className="absolute right-3 top-2 w-10 h-10 rounded-lg overflow-hidden border border-black/5 bg-white shadow-sm flex items-center justify-center">
                              <img src={url} className="w-full h-full object-cover" alt="preview" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                          )}
                        </div>
                        {imagesList.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImageUrl(idx)} 
                            className="px-4 py-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={handleAddImageUrl} 
                      className="w-full py-3 bg-zinc-100 text-black border border-black/10 rounded-xl hover:bg-zinc-200 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      + Add More Carousel Images
                    </button>
                  </div>

                  <textarea placeholder="Description" value={form.detail} className="p-4 bg-zinc-50 rounded-xl text-xs sm:col-span-2" onChange={e => setForm({...form, detail: e.target.value})} required />
                  
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
                          <button onClick={() => handleDeleteProduct(p._id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                  ))}
                </div>
            </div>
        )}

        {activeTab === 'coupons' && (
            <div className="space-y-10">
                <form onSubmit={handleAddCoupon} className="bg-white p-6 rounded-3xl border flex flex-col sm:flex-row gap-4">
                    <input placeholder="CODE (e.g. SUMMER20)" value={couponForm.code} className="flex-1 p-4 bg-zinc-50 rounded-xl text-xs uppercase" onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required />
                    <input placeholder="Discount %" type="number" min="1" max="100" value={couponForm.discountPercent} className="w-full sm:w-32 p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setCouponForm({...couponForm, discountPercent: e.target.value})} required />
                    <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase">Create</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {coupons.map(c => (
                        <div key={c._id} className="bg-white p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={() => handleDeleteCoupon(c._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16}/></button>
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
                onChange={e => setSmsData({...smsData, numbers: e.target.value})} 
            />
            <textarea 
                placeholder="Message..." 
                className="w-full p-4 bg-zinc-50 rounded-xl text-xs h-32" 
                value={smsData.message} 
                onChange={e => setSmsData({...smsData, message: e.target.value})} 
            />
            <button onClick={handleSendSMS} className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase">Send SMS</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
