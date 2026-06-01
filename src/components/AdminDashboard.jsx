import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Package, Plus, Trash2, CreditCard } from 'lucide-react';
import API_BASE_URL from '../config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: 'Tees', image: '', detail: '', color: 'bg-zinc-100', stock: 0 });

  useEffect(() => { 
    fetchOrders(); 
    fetchProducts(); 
  }, []);

  const fetchOrders = async () => { 
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/orders`); 
      setOrders(res.data); 
    } catch (err) { console.error("Orders load failed"); }
  };

  const fetchProducts = async () => { 
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`); 
      setProducts(res.data); 
    } catch (err) { console.error("Products load failed"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/products/add`, form);
      alert(`Product Added! ✅`);
      setForm({ name: '', price: '', category: 'Tees', image: '', detail: '', color: 'bg-zinc-100', stock: 0 });
      fetchProducts();
    } catch (err) { alert("Error: Server check karo"); }
  };

  const handleDelete = async (id) => { 
    if(window.confirm("Delete?")) { 
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`); 
        fetchProducts(); 
      } catch (err) { alert("Delete failed"); }
    } 
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-primary pt-20 md:pt-0">
      <div className="w-full md:w-64 bg-black text-white p-6 flex flex-row md:flex-col gap-4 items-center md:items-stretch overflow-x-auto md:overflow-x-visible sticky top-20 md:top-0 z-30">
        <h2 className="font-black text-xl italic md:mb-10 text-center tracking-tighter mr-6 md:mr-0 flex-shrink-0">XOXO ADMIN</h2>
        <div className="flex flex-row md:flex-col gap-3 w-full">
          <button onClick={() => setActiveTab('orders')} className={`p-3 md:p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-black' : 'hover:bg-white/10 text-white/70'}`}>Orders</button>
          <button onClick={() => setActiveTab('products')} className={`p-3 md:p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-black' : 'hover:bg-white/10 text-white/70'}`}>Inventory</button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-10">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o._id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div>
                    <p className="font-black uppercase text-[10px] italic">Order: {o.shippingDetails?.name || 'Customer'}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-[0.2em]">${o.totalAmount} — {o.status}</p>
                </div>
                <select 
                  value={o.status}
                  onChange={(e) => axios.put(`${API_BASE_URL}/api/admin/orders/${o._id}`, {status: e.target.value}).then(fetchOrders)} 
                  className="bg-black text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg outline-none cursor-pointer w-full sm:w-auto text-center"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <form onSubmit={handleAdd} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-black/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input placeholder="Name" className="p-4 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input placeholder="Price" className="p-4 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              <input type="number" placeholder="Stock" className="p-4 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              
              <select className="p-4 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="Tees">Tees</option><option value="Bottoms">Bottoms</option><option value="Outerwear">Outerwear</option><option value="Accessories">Accessories</option>
                <option value="Nike">Nike</option><option value="Adidas">Adidas</option><option value="Rolex">Rolex</option><option value="Casio">Casio</option>
              </select>

              <input placeholder="Image URL" className="p-4 bg-zinc-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-black/10 lg:col-span-2" value={form.image} onChange={e => setForm({...form, image: e.target.value})} required />
              <textarea placeholder="Detail" className="p-4 bg-zinc-50 rounded-xl col-span-full text-xs font-bold outline-none border border-transparent focus:border-black/10 h-32" value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} required />
              <button type="submit" className="col-span-full bg-black text-white p-5 rounded-2xl font-black uppercase italic text-xs tracking-[0.3em] hover:bg-zinc-800 transition-all active:scale-95">Add Product</button>
            </form>

            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-black/5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-black/5">
                        <th className="pb-6">Product</th>
                        <th className="pb-6">Category</th>
                        <th className="pb-6">Stock</th>
                        <th className="pb-6">Price</th>
                        <th className="pb-6 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b border-black/5 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 font-black text-xs uppercase italic tracking-tighter">{p.name}</td>
                      <td className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{p.category}</td>
                      <td className={`text-xs font-black ${p.stock < 5 ? 'text-red-500' : 'text-black'}`}>{p.stock}</td>
                      <td className="font-black text-xs italic">${p.price}</td>
                      <td className="text-right"><Trash2 onClick={() => handleDelete(p._id)} className="text-red-500 cursor-pointer inline hover:scale-125 transition-transform" size={16} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;