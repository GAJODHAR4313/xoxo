import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, User as UserIcon } from 'lucide-react';
import API_BASE_URL from '../config';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if(!savedUser) { window.location.href = "/"; return; }
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/user/${savedUser.id || savedUser._id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setUserData(res.data.user);
        setOrders(res.data.orders);
    } catch(err) {
        console.error("Profile Error", err);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
      e.preventDefault();
      const newAddress = {
          street: e.target.street.value,
          city: e.target.city.value,
          zip: e.target.zip.value
      };
      try {
          const token = localStorage.getItem('token');
          const updatedAddresses = [...(userData.addresses || []), newAddress];
          await axios.put(`${API_BASE_URL}/api/user/${userData._id}`, { addresses: updatedAddresses }, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          setUserData({...userData, addresses: updatedAddresses});
          e.target.reset();
          alert("Address Saved!");
      } catch(err) {
          alert("Error saving address");
      }
  };

  if(loading) return <div className="min-h-screen pt-32 flex justify-center"><p className="font-black italic">LOADING...</p></div>;
  if(!userData) return <div className="min-h-screen pt-32 flex justify-center"><p className="font-black italic text-red-500">Failed to load profile. Please try logging in again.</p></div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 font-primary max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-10">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-64 flex flex-row md:flex-col gap-4 overflow-x-auto">
                <button onClick={() => setActiveTab('orders')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-zinc-100 text-black/50 hover:bg-zinc-200'}`}>
                    <Package size={16}/> Orders
                </button>
                <button onClick={() => setActiveTab('addresses')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === 'addresses' ? 'bg-black text-white' : 'bg-zinc-100 text-black/50 hover:bg-zinc-200'}`}>
                    <MapPin size={16}/> Addresses
                </button>
                <button onClick={() => setActiveTab('details')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === 'details' ? 'bg-black text-white' : 'bg-zinc-100 text-black/50 hover:bg-zinc-200'}`}>
                    <UserIcon size={16}/> Details
                </button>
            </div>

            <div className="flex-1 bg-zinc-50 p-6 md:p-12 rounded-3xl border border-black/5">
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Order History</h2>
                        {orders.length === 0 ? <p className="text-sm text-black/50">No orders yet.</p> : orders.map(o => (
                            <div key={o._id} className="bg-white p-6 rounded-2xl border flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Order #{o._id.slice(-6)}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">{o.status}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{new Date(o.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xl font-black italic mt-1">₹{o.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {o.items.map((item, idx) => (
                                        <img key={idx} src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border"/>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Saved Addresses</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {userData.addresses?.map((addr, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border flex flex-col gap-2">
                                    <p className="font-bold text-sm">{addr.street}</p>
                                    <p className="text-xs text-black/50">{addr.city}, {addr.zip}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleUpdateAddress} className="bg-white p-6 rounded-3xl border flex flex-col gap-4 mt-8">
                            <h3 className="font-black text-xs uppercase tracking-widest mb-2">Add New Address</h3>
                            <input name="street" placeholder="Street Address" className="p-4 bg-zinc-50 rounded-xl text-xs outline-none" required/>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="city" placeholder="City" className="p-4 bg-zinc-50 rounded-xl text-xs outline-none" required/>
                                <input name="zip" placeholder="ZIP Code" className="p-4 bg-zinc-50 rounded-xl text-xs outline-none" required/>
                            </div>
                            <button type="submit" className="bg-black text-white p-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2">Save Address</button>
                        </form>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Account Details</h2>
                        <div className="bg-white p-6 rounded-3xl border space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Email</p>
                                <p className="font-bold">{userData.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Role</p>
                                <p className="font-bold capitalize">{userData.role}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Member Since</p>
                                <p className="font-bold">2026</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
export default Profile;
