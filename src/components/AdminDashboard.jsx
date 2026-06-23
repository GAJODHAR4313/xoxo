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
  
  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: 10 });

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
  }, []);

  const fetchOrders = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/orders`); setOrders(res.data); } catch (err) { console.error(err); } };
  const fetchProducts = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/products`); setProducts(res.data); } catch (err) { console.error(err); } };
  const fetchCoupons = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/coupons`); setCoupons(res.data); } catch (err) { console.error(err); } };
  const fetchAnalytics = async () => { try { const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`); setAnalytics(res.data); } catch (err) { console.error(err); } };

  const handleAddProduct = async (e) => { 
    e.preventDefault(); 
    const payload = {
        ...form,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
        stock: parseInt(form.stock) || 0
    };
    if(payload.images.length === 0 && payload.image) {
        payload.images = [payload.image];
    } else if (payload.images.length > 0 && !payload.image) {
        payload.image = payload.images[0];
    }
    await axios.post(`${API_BASE_URL}/api/products/add`, payload); 
    alert("Product Added!"); 
    fetchProducts(); 
    fetchAnalytics();
  };
  
  const handleDeleteProduct = async (id) => { if(window.confirm("Delete Product?")) { await axios.delete(`${API_BASE_URL}/api/products/${id}`); fetchProducts(); fetchAnalytics(); } };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/admin/coupons`, couponForm);
        alert("Coupon Created!");
        fetchCoupons();
        setCouponForm({ code: '', discountPercent: 10 });
    } catch(err) {
        alert("Failed to create coupon.");
    }
  };
  
  const handleDeleteCoupon = async (id) => { if(window.confirm("Delete Coupon?")) { await axios.delete(`${API_BASE_URL}/api/admin/coupons/${id}`); fetchCoupons(); } };

  const handleSendSMS = async () => {
    if (!smsData.numbers || !smsData.message) return alert("Enter details");
    try {
      await axios.post(`${API_BASE_URL}/api/admin/send-sms`, smsData);
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
                    <span className="text-3xl font-black italic">${analytics.totalRevenue.toLocaleString()}</span>
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
                <p className="text-[10px] text-black/50">${o.totalAmount} • {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <select value={o.status} onChange={(e) => axios.put(`${API_BASE_URL}/api/admin/orders/${o._id}`, {status: e.target.value}).then(() => { fetchOrders(); fetchAnalytics(); })} className="bg-black text-white text-[9px] p-2 rounded-lg">
                <option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option>
              </select>
            </div>
          ))}</div>
        )}

        {activeTab === 'products' && (
            <div className="space-y-10">
                <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Name" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, name: e.target.value})} required />
                  <input placeholder="Price" type="number" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, price: e.target.value})} required />
                  <select className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="Tees">Tees</option><option value="Bottoms">Bottoms</option><option value="Outerwear">Outerwear</option><option value="Accessories">Accessories</option>
                  </select>
                  <input placeholder="Stock Quantity" type="number" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, stock: e.target.value})} required />
                  <input placeholder="Sizes (comma separated: S, M, L)" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, sizes: e.target.value})} />
                  <input placeholder="Main Image URL" className="p-4 bg-zinc-50 rounded-xl text-xs" onChange={e => setForm({...form, image: e.target.value})} required />
                  <input placeholder="Extra Image URLs (comma separated)" className="p-4 bg-zinc-50 rounded-xl text-xs sm:col-span-2" onChange={e => setForm({...form, images: e.target.value})} />
                  <textarea placeholder="Description" className="p-4 bg-zinc-50 rounded-xl text-xs sm:col-span-2" onChange={e => setForm({...form, detail: e.target.value})} required />
                  
                  <button type="submit" className="bg-black text-white p-4 rounded-xl font-black text-xs uppercase sm:col-span-2 mt-4">Add Product</button>
                </form>

                <div className="space-y-4">
                  {products.map(p => (
                      <div key={p._id} className="bg-white p-4 rounded-2xl border flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                  <p className="font-black text-[10px] uppercase">{p.name}</p>
                                  <p className="text-[9px] text-black/50">Stock: {p.stock} • ${p.price}</p>
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
