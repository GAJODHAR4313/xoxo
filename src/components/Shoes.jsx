import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import { useTheme } from '../Context/themeContext';
import API_BASE_URL from '../config';

const Shoes = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const shoeBrands = ["Nike", "Adidas", "New Balance", "Asics"];

  // Modal specific state
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.filter(p => shoeBrands.includes(p.category)));
    } catch (err) { console.error("Shoes load error", err); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStockUpdate = (productId) => {
    setProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );
    setSelectedShoe(prev =>
      prev && prev._id === productId ? { ...prev, stock: Math.max(0, prev.stock - 1) } : prev
    );
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert("Please select a size first!");
        return;
    }
    const cartItem = { ...product, selectedSize };
    const success = await addToCart(cartItem, handleStockUpdate);
    if (success && selectedShoe?._id === product._id) {
      setSelectedShoe(null);
    }
  };

  const submitReview = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if(!savedUser) return alert("Please login to review");
      if(!reviewText.trim()) return alert("Enter review text");
      setSubmittingReview(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_BASE_URL}/api/products/${selectedShoe._id}/reviews`, {
              userId: savedUser.id || savedUser._id,
              rating: reviewRating,
              text: reviewText
          }, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          setSelectedShoe(res.data);
          setProducts(prev => prev.map(p => p._id === res.data._id ? res.data : p));
          setReviewText("");
          setReviewRating(5);
      } catch(err) {
          alert("Error submitting review");
      } finally {
          setSubmittingReview(false);
      }
  };

  const brandOptions = ["All", ...shoeBrands];
  const filteredShoes = activeBrand === "All" ? products : products.filter(s => s.category === activeBrand);

  const allImages = selectedShoe ? Array.from(new Set([selectedShoe.image, ...(selectedShoe.images || [])])).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-xoxo-dark-bg text-black dark:text-xoxo-cream transition-colors duration-300">
      <div className="pt-24 pb-12 px-6 border-b border-neutral-100 dark:border-xoxo-dark-border">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.5em] uppercase text-neutral-400 dark:text-zinc-500 mb-4">Footwear Archive</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase italic">
            Sole <span className="text-neutral-200 dark:text-zinc-800">Search.</span>
          </motion.h1>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white/90 dark:bg-xoxo-dark-bg/90 backdrop-blur-md border-b border-neutral-100 dark:border-xoxo-dark-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto no-scrollbar gap-8">
          {brandOptions.map(brand => (
            <button key={brand} onClick={() => setActiveBrand(brand)}
              className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeBrand === brand ? "text-black dark:text-xoxo-gold border-b-2 border-black dark:border-xoxo-gold pb-1" : "text-neutral-300 hover:text-black dark:hover:text-xoxo-cream"}`}>
              {brand}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredShoes.map(shoe => {
            const isLiked = wishlistItems.some(w => w._id === shoe._id);
            return (
              <motion.div layout key={shoe._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group relative">
                {shoe.stock <= 0 ? (
                  <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">SOLD OUT</div>
                ) : shoe.stock < 5 ? (
                  <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">Only {shoe.stock} left</div>
                ) : null}
                <div className={`aspect-[3/4] ${shoe.color || 'bg-zinc-100 dark:bg-xoxo-dark-card'} rounded-2xl overflow-hidden flex items-center justify-center relative ${shoe.stock <= 0 ? 'grayscale opacity-50' : ''}`}>
                  <img src={shoe.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={shoe.name} />
                  
                  <button onClick={() => toggleWishlist(shoe)} className="absolute top-4 left-4 z-20 p-2 bg-white/80 dark:bg-xoxo-dark-card/85 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                    <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : (theme === 'dark' ? "#d4af37" : "black")} />
                  </button>

                  {shoe.stock > 0 && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500">
                      <button onClick={() => { setSelectedShoe(shoe); setSelectedSize(""); setCurrentImageIndex(0); }} className="bg-white dark:bg-xoxo-dark-bg text-black dark:text-xoxo-cream p-4 rounded-full shadow-xl hover:scale-110 transition-all"><Eye size={20} /></button>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between items-center font-black uppercase italic text-[11px] tracking-tighter px-1">
                  <span className={shoe.stock <= 0 ? "text-zinc-300 dark:text-zinc-700" : ""}>{shoe.name}</span>
                  <div className="flex gap-2 items-center">
                      {shoe.rating > 0 && <span className="flex items-center gap-1 text-xs"><Star size={10} fill="#d4af37" color="#d4af37"/> {shoe.rating.toFixed(1)}</span>}
                      <span className="bg-zinc-100 dark:bg-xoxo-dark-card text-zinc-800 dark:text-xoxo-cream/80 px-2 py-1 rounded-md text-[10px] font-bold not-italic tracking-normal border border-transparent dark:border-xoxo-dark-border">₹{shoe.price}</span>
                  </div>
                </div>
                {shoe.stock > 0 && shoe.stock < 5 && <p className="text-[8px] font-black text-orange-500 uppercase mt-2 tracking-widest px-1">Limited: Only {shoe.stock} Left</p>}
                {shoe.stock <= 0 && <p className="text-[8px] font-black text-red-500 uppercase mt-2 tracking-widest px-1">Out of Stock</p>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedShoe && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto py-10"
            onClick={() => setSelectedShoe(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white dark:bg-xoxo-dark-card w-full max-w-5xl rounded-[24px] md:rounded-[40px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl my-4 md:my-auto border border-black/5 dark:border-xoxo-dark-border text-black dark:text-xoxo-cream"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedShoe(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2.5 md:p-3 bg-white/50 dark:bg-xoxo-dark-bg/50 backdrop-blur-md md:bg-black md:dark:bg-xoxo-gold text-black dark:text-black md:text-white md:dark:text-black rounded-full hover:rotate-90 transition-all shadow-lg border border-transparent dark:border-xoxo-dark-border">
                <X size={20} />
              </button>
              
              {/* Left Side: Images */}
              <div className={`w-full md:w-1/2 min-h-[250px] md:min-h-[300px] ${selectedShoe.color || 'bg-zinc-100 dark:bg-xoxo-dark-bg'} flex flex-col p-4 md:p-8 relative`}>
                <div className="flex-1 flex items-center justify-center relative">
                    <img src={allImages[currentImageIndex]} alt="" className="w-full h-full max-h-[40vh] md:max-h-none object-contain mix-blend-multiply dark:mix-blend-normal" />
                    {allImages.length > 1 && (
                        <>
                            <button onClick={() => setCurrentImageIndex(i => i === 0 ? allImages.length-1 : i-1)} className="absolute left-4 p-2 bg-white/50 dark:bg-xoxo-dark-bg/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-xoxo-dark-card border border-transparent dark:border-xoxo-dark-border"><ChevronLeft className="text-black dark:text-white" /></button>
                            <button onClick={() => setCurrentImageIndex(i => i === allImages.length-1 ? 0 : i+1)} className="absolute right-4 p-2 bg-white/50 dark:bg-xoxo-dark-bg/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-xoxo-dark-card border border-transparent dark:border-xoxo-dark-border"><ChevronRight className="text-black dark:text-white" /></button>
                        </>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 justify-center overflow-x-auto no-scrollbar">
                        {allImages.map((img, idx) => (
                            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded-xl border-2 overflow-hidden ${idx === currentImageIndex ? 'border-black dark:border-xoxo-gold' : 'border-transparent opacity-50'}`}>
                                <img src={img} className="w-full h-full object-cover" alt=""/>
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* Right Side: Details & Reviews */}
              <div className="flex-1 p-6 md:p-12 bg-white dark:bg-xoxo-dark-card flex flex-col h-[60vh] md:h-auto overflow-y-auto no-scrollbar">
                <div className="flex gap-4 items-center mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 dark:text-zinc-500">{selectedShoe.category}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-600">Stock: {selectedShoe.stock}</p>
                    {selectedShoe.rating > 0 && <p className="text-[10px] font-black flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/10 px-2 py-1 rounded-md text-yellow-600 dark:text-xoxo-gold"><Star size={10} fill="currentColor"/> {selectedShoe.rating.toFixed(1)}</p>}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">{selectedShoe.name}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-6">{selectedShoe.detail}</p>
                
                {selectedShoe.sizes?.length > 0 && (
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mb-3">Select Size</p>
                        <div className="flex gap-3">
                            {selectedShoe.sizes.map(size => {
                                const isOutOfStock = selectedShoe.sizeStocks && typeof selectedShoe.sizeStocks[size] === 'number' && selectedShoe.sizeStocks[size] <= 0;
                                return (
                                    <button 
                                        key={size} 
                                        disabled={isOutOfStock}
                                        onClick={() => setSelectedSize(size)} 
                                        className={`w-12 h-12 rounded-xl font-black border transition-all ${isOutOfStock ? 'opacity-30 border-dashed cursor-not-allowed bg-zinc-50 dark:bg-xoxo-dark-bg text-zinc-300 dark:text-zinc-600 border-zinc-100 dark:border-xoxo-dark-border' : selectedSize === size ? 'border-black dark:border-xoxo-gold bg-black dark:bg-xoxo-gold text-white dark:text-black' : 'border-black/10 dark:border-xoxo-dark-border hover:border-black/50 dark:hover:border-xoxo-gold text-black dark:text-xoxo-cream'}`}>
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                 <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-between border-t border-neutral-100 dark:border-xoxo-dark-border pt-6 mt-auto">
                  <span className="text-3xl font-black italic tracking-tighter text-center sm:text-left">₹{selectedShoe.price}</span>
                  <button
                    disabled={selectedShoe.stock <= 0}
                    onClick={() => handleAddToCart(selectedShoe)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase italic text-xs tracking-[0.2em] transition-all shadow-lg ${selectedShoe.stock <= 0 ? 'bg-zinc-100 dark:bg-xoxo-dark-bg text-zinc-300 dark:text-zinc-600 cursor-not-allowed' : 'bg-black dark:bg-xoxo-gold text-white dark:text-black hover:shadow-2xl hover:-translate-y-1 border border-transparent dark:border-white/10'}`}
                  >
                    {selectedShoe.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                {selectedShoe.stock > 0 && selectedShoe.stock < 5 && (
                  <p className="text-[9px] font-black text-orange-500 uppercase mt-3 tracking-widest">Only {selectedShoe.stock} left!</p>
                )}

                {/* Reviews Section */}
                <div className="mt-12 border-t border-neutral-100 dark:border-xoxo-dark-border pt-8">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Customer Reviews</h3>
                    <div className="space-y-4 mb-8">
                        {selectedShoe.reviews?.length > 0 ? selectedShoe.reviews.map((r, i) => (
                            <div key={i} className="bg-zinc-50 dark:bg-xoxo-dark-bg p-4 rounded-2xl border border-transparent dark:border-xoxo-dark-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < r.rating ? "currentColor" : "none"} color={idx < r.rating ? "currentColor" : (theme === 'dark' ? "#24201b" : "#ccc")}/>)}
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium">{r.text}</p>
                            </div>
                        )) : <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">No reviews yet. Be the first to review!</p>}
                    </div>
                    
                    <div className="bg-zinc-50 dark:bg-xoxo-dark-bg p-6 rounded-3xl border border-black/5 dark:border-xoxo-dark-border">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-xoxo-cream/60 mb-3">Write a Review</p>
                        <div className="flex items-center gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setReviewRating(star)}>
                                    <Star size={20} fill={star <= reviewRating ? "#d4af37" : "none"} color={star <= reviewRating ? "#d4af37" : (theme === 'dark' ? "#24201b" : "#ccc")}/>
                                </button>
                            ))}
                        </div>
                        <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Your review..." className="w-full p-4 rounded-xl text-xs outline-none bg-white dark:bg-xoxo-dark-card border border-black/5 dark:border-xoxo-dark-border text-black dark:text-xoxo-cream mb-4 resize-none h-24 focus:border-black dark:focus:border-xoxo-gold"/>
                        <button disabled={submittingReview} onClick={submitReview} className="bg-black dark:bg-xoxo-gold text-white dark:text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 border border-transparent dark:border-white/10">
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shoes;