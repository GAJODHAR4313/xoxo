import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../Context/cartContext';

const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[250]"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[300] shadow-2xl flex flex-col"
          >
            <div className="p-6 sm:p-8 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Likes</h2>
                <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">{wishlistItems.length} Saved Items</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Heart size={40} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4">Archive is empty</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className={`w-24 h-32 ${item.color || 'bg-neutral-100'} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                        <ShoppingBag size={20} className="opacity-10" />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="text-[12px] font-black uppercase italic tracking-tight">{item.name}</h4>
                        <p className="text-[10px] font-bold opacity-30 italic mb-4">${item.price}</p>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => { addToCart(item); toggleWishlist(item); }}
                            className="text-[9px] font-black uppercase border-b border-black pb-0.5 hover:opacity-50 transition-all"
                          >
                            Add to Bag
                          </button>
                          <button 
                            onClick={() => toggleWishlist(item)}
                            className="text-[9px] font-black uppercase text-red-500 border-b border-red-500 pb-0.5 hover:opacity-50 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;