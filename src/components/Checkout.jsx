import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/cartContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', country: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  useEffect(() => {
      const fetchUser = async () => {
          const savedUser = JSON.parse(localStorage.getItem('user'));
          if(savedUser) {
              try {
                  const token = localStorage.getItem('token');
                  const res = await axios.get(`${API_BASE_URL}/api/user/${savedUser.id || savedUser._id}`, {
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                  });
                  setUserData(res.data.user);
              } catch(e){
                  console.error("Failed to fetch user data:", e);
              }
          }
      };
      fetchUser();
  }, []);

  const subTotal = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
    return acc + (price * item.qty);
  }, 0);

  const discountAmount = (subTotal * discountPercent) / 100;
  const shippingFee = subTotal > 1000 ? 0 : 100;
  const finalTotal = subTotal - discountAmount + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
  };

  const handleApplyCoupon = async () => {
      if(!couponCode.trim()) return;
      setApplyingCoupon(true);
      try {
          const res = await axios.post(`${API_BASE_URL}/api/coupons/validate`, { code: couponCode });
          setDiscountPercent(res.data.discountPercent);
          alert(`Coupon Applied! ${res.data.discountPercent}% OFF`);
      } catch(err) {
          setDiscountPercent(0);
          alert(err.response?.data?.message || "Invalid coupon");
      } finally {
          setApplyingCoupon(false);
      }
  };

  const handleAddressSelect = (addr) => {
      setFormData({
          ...formData,
          address: addr.street,
          city: addr.city,
          zip: addr.zip
      });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    if (!formData.email || !formData.phone || !formData.address) {
        alert("Please fill in Email, Phone, and Address");
        return;
    }

    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const userId = savedUser?.id || savedUser?._id;

    if (!userId) {
        alert("User not found. Please Login again.");
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            userId,
            items: cartItems,
            totalAmount: finalTotal,
            discountAmount,
            shippingFee,
            shippingDetails: formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`ORDER PLACED! ID: ${data.orderId}`);
        setCartItems([]);
        localStorage.removeItem('localCart');
        navigate("/orders"); 
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.message}`);
      }
    } catch (error) {
      alert("Network Error: Backend is not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-28 md:pt-40 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen text-black dark:text-xoxo-cream transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        <div className="space-y-12">
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-2">Checkout</h1>
          
          {userData?.addresses?.length > 0 && (
              <div className="bg-zinc-50 dark:bg-xoxo-dark-card p-6 rounded-3xl border border-black/5 dark:border-xoxo-dark-border transition-colors duration-300">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-neutral-400 dark:text-zinc-500">Saved Addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userData.addresses.map((addr, i) => (
                          <button key={i} onClick={() => handleAddressSelect(addr)} className="bg-white dark:bg-xoxo-dark-bg p-4 rounded-xl border border-black/10 dark:border-xoxo-dark-border text-left hover:border-black/50 dark:hover:border-xoxo-gold transition-colors text-black dark:text-xoxo-cream">
                              <p className="font-bold text-xs">{addr.street}</p>
                              <p className="text-[10px] text-black/50 dark:text-xoxo-cream/50 mt-1">{addr.city}, {addr.zip}</p>
                          </button>
                      ))}
                  </div>
              </div>
          )}

          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="FIRST NAME" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
              <input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="LAST NAME" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <input name="email" value={formData.email} onChange={handleInputChange} placeholder="EMAIL" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
              <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="PHONE" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
            </div>
            <input name="address" value={formData.address} onChange={handleInputChange} placeholder="ADDRESS" className="w-full border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <input name="city" value={formData.city} onChange={handleInputChange} placeholder="CITY" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
              <input name="zip" value={formData.zip} onChange={handleInputChange} placeholder="ZIP" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
              <input name="country" value={formData.country} onChange={handleInputChange} placeholder="COUNTRY" className="border-b border-black/10 dark:border-xoxo-dark-border py-2 outline-none text-[11px] font-bold bg-transparent text-black dark:text-xoxo-cream focus:border-black dark:focus:border-xoxo-gold placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30" />
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="sticky top-28 md:top-40 bg-black dark:bg-xoxo-dark-card text-white dark:text-xoxo-cream p-6 sm:p-12 rounded-[24px] sm:rounded-[40px] shadow-2xl border border-transparent dark:border-xoxo-dark-border transition-colors duration-300">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] mb-10 border-b border-white/10 dark:border-xoxo-dark-border pb-4">Summary</h2>
            
            <div className="space-y-6 mb-8">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase italic">
                  <span>{item.name} {item.selectedSize && `(${item.selectedSize})`} x{item.qty}</span>
                  <span>₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-8 border-t border-white/10 dark:border-xoxo-dark-border pt-8">
                <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 bg-white/10 dark:bg-xoxo-dark-bg border border-white/20 dark:border-xoxo-dark-border rounded-xl px-4 py-3 text-[10px] font-black outline-none placeholder:text-white/30 dark:placeholder:text-xoxo-cream/30 uppercase text-white dark:text-xoxo-cream" />
                <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="bg-white dark:bg-xoxo-gold text-black dark:text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-95">{applyingCoupon ? '...' : 'Apply'}</button>
            </div>

            <div className="space-y-4 mb-8 text-[11px] font-bold uppercase tracking-widest opacity-60">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subTotal.toLocaleString()}</span>
                </div>
                {discountPercent > 0 && (
                    <div className="flex justify-between text-green-400 dark:text-xoxo-gold">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
            </div>

            <div className="pt-8 border-t border-white/10 dark:border-xoxo-dark-border flex justify-between items-end">
              <span className="text-[12px] font-black uppercase italic opacity-40">Total</span>
              <span className="text-4xl font-black italic">₹{finalTotal.toLocaleString()}</span>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-white dark:bg-xoxo-gold text-black dark:text-black py-6 mt-10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 dark:hover:opacity-90 disabled:opacity-20 transition-colors border border-transparent dark:border-white/10">
              {loading ? "PROCESSING..." : "CONFIRM ORDER"}
            </button>
            {shippingFee > 0 && <p className="text-center text-[9px] text-white/40 mt-4 uppercase tracking-widest">Free shipping on orders over ₹1,000</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;