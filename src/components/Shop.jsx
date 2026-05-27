import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Heart } from 'lucide-react';
import { useCart } from '../Context/cartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();
  const shopCategories = ["Tees", "Bottoms", "Outerwear", "Accessories"];

  useEffect(() => {
    axios.get('http://localhost:5001/api/products').then(res => {
      const onlyShopItems = res.data.filter(p => shopCategories.includes(p.category));
      setProducts(onlyShopItems);
    });
  }, []);

  const categories = ["All", ...shopCategories];
  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-6 mb-8 flex gap-8 overflow-x-auto no-scrollbar border-b border-black/5 pb-4">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeCategory === cat ? 'text-black' : 'text-black/30 hover:text-black'}`}>{cat}</button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {filtered.map(p => (
          <div key={p._id} className="group relative">
            {p.stock <= 0 && (
                <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest">SOLD OUT</div>
            )}
            <div className={`aspect-[3/4] ${p.color || 'bg-zinc-100'} rounded-2xl overflow-hidden flex items-center justify-center relative ${p.stock <= 0 ? 'grayscale opacity-50' : ''}`}>
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
              {p.stock > 0 && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500">
                    <button onClick={() => setSelectedProduct(p)} className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-all"><Eye size={20}/></button>
                    <button onClick={() => addToCart(p)} className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-all"><ShoppingCart size={20}/></button>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between items-center font-black uppercase italic text-[11px] tracking-tighter px-1">
              <span className={p.stock <= 0 ? "text-zinc-300" : ""}>{p.name}</span>
              <span className="bg-zinc-100 px-2 py-1 rounded-md text-[10px] font-bold not-italic tracking-normal">${p.price}</span>
            </div>
            {p.stock > 0 && p.stock < 5 && <p className="text-[8px] font-black text-red-500 uppercase mt-2 tracking-widest px-1">Limited: Only {p.stock} Left</p>}
          </div>
        ))}
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white w-full max-w-5xl rounded-[40px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 z-20 p-3 bg-black text-white rounded-full hover:rotate-90 transition-all"><X size={24}/></button>
              <div className={`flex-1 ${selectedProduct.color} flex items-center justify-center p-16`}>
                <img src={selectedProduct.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1 p-16 flex flex-col justify-center bg-white">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-4">{selectedProduct.category} // Stock: {selectedProduct.stock}</p>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">{selectedProduct.name}</h2>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-10 max-w-sm">{selectedProduct.detail}</p>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-10">
                  <span className="text-4xl font-black italic tracking-tighter">${selectedProduct.price}</span>
                  <button 
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className={`px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-[0.2em] transition-all shadow-lg ${selectedProduct.stock <= 0 ? 'bg-zinc-100 text-zinc-300' : 'bg-black text-white hover:shadow-2xl hover:-translate-y-1'}`}
                  >
                    {selectedProduct.stock <= 0 ? 'Out of Stock' : 'Secure Item'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Shop;