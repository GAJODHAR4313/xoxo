import React, { useState } from 'react';
import { useCart } from '../Context/cartContext';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cartItems, setCartItems } = useCart();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', country: ''
  });

  const finalTotal = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/,/g, '')) 
      : item.price;
    return acc + (price * item.qty);
  }, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'email' ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: finalValue });
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
      // Dhyan de: URL bilkul yehi hona chahiye
      const response = await fetch('http://localhost:5001/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            items: cartItems,
            totalAmount: finalTotal,
            shippingDetails: formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`ORDER PLACED! ID: ${data.orderId}`);
        setCartItems([]); // Cart khali karo
        window.location.href = "/"; 
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.message}`);
      }
    } catch (error) {
      alert("Network Error: Backend is not reachable on port 5001");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Shipping Form */}
        <div className="space-y-12">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">Checkout</h1>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <input name="firstName" onChange={handleInputChange} placeholder="FIRST NAME" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
              <input name="lastName" onChange={handleInputChange} placeholder="LAST NAME" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <input name="email" value={formData.email} onChange={handleInputChange} placeholder="EMAIL" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
              <input name="phone" onChange={handleInputChange} placeholder="PHONE" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
            </div>
            <input name="address" onChange={handleInputChange} placeholder="ADDRESS" className="w-full border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
            <div className="grid grid-cols-3 gap-8">
              <input name="city" onChange={handleInputChange} placeholder="CITY" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
              <input name="zip" onChange={handleInputChange} placeholder="ZIP" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
              <input name="country" onChange={handleInputChange} placeholder="COUNTRY" className="border-b border-black/10 py-2 outline-none text-[11px] font-bold" />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="relative">
          <div className="sticky top-40 bg-black text-white p-12 rounded-[40px] shadow-2xl">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] mb-10 border-b border-white/10 pb-4">Summary</h2>
            <div className="space-y-6 mb-10">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-[11px] font-black uppercase italic">
                  <span>{item.name} x{item.qty}</span>
                  <span>${(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-white/10 flex justify-between items-end">
              <span className="text-[12px] font-black uppercase italic opacity-40">Total</span>
              <span className="text-3xl font-black italic">${finalTotal.toLocaleString()}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-white text-black py-6 mt-10 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 disabled:opacity-20">
              {loading ? "PROCESSING..." : "CONFIRM ORDER"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;