import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      // Checking for both id and _id to be safe
      const userId = savedUser?.id || savedUser?._id;

      if (userId) {
        try {
          const response = await fetch(`http://localhost:5001/api/orders/user/${userId}`);
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching orders:", error);
          setOrders([]);
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pt-40 pb-20 px-6 max-w-5xl mx-auto min-h-screen"
    >
      <div className="mb-20">
        <h1 className="text-7xl font-black italic uppercase tracking-tighter">Your Orders</h1>
        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em]">Archive Acquisition History</p>
      </div>

      {loading ? (
        <p className="text-[11px] font-black uppercase italic opacity-20">Loading archive records...</p>
      ) : orders.length === 0 ? (
        <div className="py-20 border-t border-black/5">
          <p className="text-[11px] font-black uppercase italic opacity-20">No orders found in your history.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="group p-10 bg-neutral-50 rounded-[40px] border border-transparent hover:border-black/5 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">
                      {order.status}
                    </span>
                    <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
                      ID: {order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-[13px] font-black uppercase italic">
                        {item.name} <span className="text-[9px] opacity-40 not-italic ml-2">x{item.qty}</span>
                      </p>
                    ))}
                  </div>
                  
                  <p className="text-[10px] font-bold opacity-40 uppercase">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="md:text-right flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-4xl font-black italic tracking-tighter">
                        ${Number(order.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[9px] font-black uppercase mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Orders;