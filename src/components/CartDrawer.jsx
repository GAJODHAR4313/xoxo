import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import { Link } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/,/g, '')) 
      : item.price;
    return acc + (price * item.qty);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 z-[250] backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white z-[300] p-6 sm:p-10 shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 sm:mb-12">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Your Archive</h2>
              <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Archive is empty</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={`${item._id}-${item.selectedSize || ''}-${idx}`} className="flex gap-6 items-start border-b border-black/5 pb-6">
                    <div className={`w-24 h-28 ${item.color || 'bg-neutral-100'} rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden`}>
                       {item.image ? (
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[8px] font-black opacity-10 italic uppercase">No Image</span>
                       )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[12px] font-black uppercase italic tracking-tight">
                        {item.name} {item.selectedSize && `(${item.selectedSize})`}
                      </h4>
                      <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-widest">{item.category || 'Apparel'}</p>
                      <div className="flex justify-between items-end mt-4">
                        <p className="text-[11px] font-black italic">
                          ₹{Number(item.price).toLocaleString()} 
                          <span className="opacity-20 ml-2">x{item.qty}</span>
                        </p>
                        <button 
                          onClick={() => removeFromCart(item._id, item.selectedSize)}
                          className="text-red-500 hover:scale-110 transition-transform"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="pt-10 space-y-6">
                <div className="flex justify-between items-end border-t-2 border-black pt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Subtotal</span>
                  <span className="text-2xl font-black italic">₹{total.toLocaleString()}</span>
                </div>
                
                <Link 
                  to="/checkout" 
                  onClick={onClose} 
                  className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all italic shadow-xl text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;