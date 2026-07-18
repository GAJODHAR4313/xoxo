import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import API_BASE_URL from '../config';

const Watches = () => {
  const [products, setProducts] = useState([]);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const watchBrands = ["Rolex", "Omega", "Cartier", "Seiko", "Casio"];

  // Modal specific state
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.filter(p => watchBrands.includes(p.category)));
    } catch (err) { console.error("Watches load error", err); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStockUpdate = (productId) => {
    setProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );
    setSelectedWatch(prev =>
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
    if (success && selectedWatch?._id === product._id) {
      setSelectedWatch(null);
    }
  };

  const submitReview = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if(!savedUser) return alert("Please login to review");
      if(!reviewText.trim()) return alert("Enter review text");
      setSubmittingReview(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_BASE_URL}/api/products/${selectedWatch._id}/reviews`, {
              userId: savedUser.id || savedUser._id,
              rating: reviewRating,
              text: reviewText
          }, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          setSelectedWatch(res.data);
          setProducts(prev => prev.map(p => p._id === res.data._id ? res.data : p));
          setReviewText("");
          setReviewRating(5);
      } catch(err) {
          alert("Error submitting review");
      } finally {
          setSubmittingReview(false);
      }
  };

  const brandOptions = ["All", ...watchBrands];
  const filteredWatches = activeBrand === "All" ? products : products.filter(w => w.category === activeBrand);

  const allImages = selectedWatch ? Array.from(new Set([selectedWatch.image, ...(selectedWatch.images || [])])).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12 pb-12 px-6 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black tracking-[0.5em] uppercase text-neutral-300 mb-4 italic">Precision Timing</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[9vw] font-black tracking-tighter leading-[0.8] uppercase italic">Chrono <span className="text-neutral-200">Lab.</span></motion.h1>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto no-scrollbar gap-10">
          {brandOptions.map((brand) => (
            <button key={brand} onClick={() => setActiveBrand(brand)} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeBrand === brand ? "text-black border-b-2 border-black pb-1 italic scale-110" : "text-neutral-300 hover:text-black"}`}>{brand}</button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredWatches.map((watch) => {
            const isLiked = wishlistItems.some(w => w._id === watch._id);
            return (
              <motion.div layout key={watch._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group relative">
                {watch.stock <= 0 ? (
                  <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">SOLD OUT</div>
                ) : watch.stock < 5 ? (
                  <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">Only {watch.stock} left</div>
                ) : null}
                <div className={`aspect-[3/4] ${watch.color || 'bg-stone-50'} rounded-2xl overflow-hidden flex items-center justify-center relative ${watch.stock <= 0 ? 'grayscale opacity-50' : ''}`}>
                  <img src={watch.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={watch.name} />
                  
                  <button onClick={() => toggleWishlist(watch)} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                    <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                  </button>

                  {watch.stock > 0 && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500">
                      <button onClick={() => { setSelectedWatch(watch); setSelectedSize(""); setCurrentImageIndex(0); }} className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-all"><Eye size={20} /></button>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between items-center font-black uppercase italic text-[11px] tracking-tighter px-1">
                  <span className={watch.stock <= 0 ? "text-zinc-300" : ""}>{watch.name}</span>
                  <div className="flex gap-2 items-center">
                      {watch.rating > 0 && <span className="flex items-center gap-1 text-xs"><Star size={10} fill="gold" color="gold"/> {watch.rating.toFixed(1)}</span>}
                      <span className="bg-zinc-100 px-2 py-1 rounded-md text-[10px] font-bold not-italic tracking-normal">₹{watch.price}</span>
                  </div>
                </div>
                {watch.stock > 0 && watch.stock < 5 && <p className="text-[8px] font-black text-orange-500 uppercase mt-2 tracking-widest px-1">Limited: Only {watch.stock} Left</p>}
                {watch.stock <= 0 && <p className="text-[8px] font-black text-red-500 uppercase mt-2 tracking-widest px-1">Out of Stock</p>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedWatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedWatch(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-5xl rounded-[24px] md:rounded-[40px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl my-auto"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedWatch(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2.5 md:p-3 bg-white/50 backdrop-blur-md md:bg-black text-black md:text-white rounded-full hover:rotate-90 transition-all shadow-lg">
                <X size={20} />
              </button>
              
              {/* Left Side: Images */}
              <div className={`w-full md:w-[45%] min-h-[250px] md:min-h-[300px] ${selectedWatch.color || 'bg-stone-50'} flex flex-col p-4 md:p-8 relative`}>
                <div className="flex-1 flex items-center justify-center relative">
                    <img src={allImages[currentImageIndex]} alt="" className="w-full h-full max-h-[40vh] md:max-h-none object-contain mix-blend-multiply" />
                    {allImages.length > 1 && (
                        <>
                            <button onClick={() => setCurrentImageIndex(i => i === 0 ? allImages.length-1 : i-1)} className="absolute left-4 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white"><ChevronLeft/></button>
                            <button onClick={() => setCurrentImageIndex(i => i === allImages.length-1 ? 0 : i+1)} className="absolute right-4 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white"><ChevronRight/></button>
                        </>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 justify-center overflow-x-auto no-scrollbar">
                        {allImages.map((img, idx) => (
                            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded-xl border-2 overflow-hidden ${idx === currentImageIndex ? 'border-black' : 'border-transparent opacity-50'}`}>
                                <img src={img} className="w-full h-full object-cover" alt=""/>
                            </button>
                        ))}
                    </div>
                )}
              </div>
              
              {/* Right Side: Details & Reviews */}
              <div className="flex-1 p-6 md:p-12 bg-white flex flex-col h-[60vh] md:h-auto overflow-y-auto no-scrollbar">
                <div className="flex gap-4 items-center mb-4">
                    <span className="text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">{selectedWatch.category}</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-600">Stock: {selectedWatch.stock}</p>
                    {selectedWatch.rating > 0 && <p className="text-[10px] font-black flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md text-yellow-600"><Star size={10} fill="currentColor"/> {selectedWatch.rating.toFixed(1)}</p>}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 mt-2">{selectedWatch.name}</h2>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.1em] leading-relaxed mb-10">{selectedWatch.detail}</p>
                
                {selectedWatch.sizes?.length > 0 && (
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">Select Size</p>
                        <div className="flex gap-3">
                            {selectedWatch.sizes.map(size => {
                                const isOutOfStock = selectedWatch.sizeStocks && typeof selectedWatch.sizeStocks[size] === 'number' && selectedWatch.sizeStocks[size] <= 0;
                                return (
                                    <button 
                                        key={size} 
                                        disabled={isOutOfStock}
                                        onClick={() => setSelectedSize(size)} 
                                        className={`w-12 h-12 rounded-xl font-black border transition-all ${isOutOfStock ? 'opacity-30 border-dashed cursor-not-allowed bg-zinc-50 text-zinc-300' : selectedSize === size ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/50'}`}>
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-neutral-100">
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Price (INR)</span><span className="text-2xl sm:text-3xl font-black italic tracking-tighter">₹{selectedWatch.price}</span></div>
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Availability</span><span className={`text-xs font-black uppercase italic ${selectedWatch.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>{selectedWatch.stock <= 0 ? 'Out of stock' : 'Ships in 24h'}</span></div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-auto">
                  <button
                    disabled={selectedWatch.stock <= 0}
                    onClick={() => handleAddToCart(selectedWatch)}
                    className={`w-full py-4 md:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-opacity flex items-center justify-center gap-3 ${selectedWatch.stock <= 0 ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-black text-white hover:opacity-90'}`}>
                    <ShoppingCart size={18} /> {selectedWatch.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                {selectedWatch.stock > 0 && selectedWatch.stock < 5 && (
                  <p className="text-[9px] font-black text-orange-500 uppercase mt-3 tracking-widest text-center">Only {selectedWatch.stock} left!</p>
                )}

                {/* Reviews Section */}
                <div className="mt-12 border-t border-zinc-100 pt-8">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Customer Reviews</h3>
                    <div className="space-y-4 mb-8">
                        {selectedWatch.reviews?.length > 0 ? selectedWatch.reviews.map((r, i) => (
                            <div key={i} className="bg-zinc-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < r.rating ? "currentColor" : "none"} color={idx < r.rating ? "currentColor" : "#ccc"}/>)}
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium">{r.text}</p>
                            </div>
                        )) : <p className="text-xs text-zinc-400 font-medium">No reviews yet. Be the first to review!</p>}
                    </div>
                    
                    <div className="bg-zinc-50 p-6 rounded-3xl border">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-3">Write a Review</p>
                        <div className="flex items-center gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setReviewRating(star)}>
                                    <Star size={20} fill={star <= reviewRating ? "gold" : "none"} color={star <= reviewRating ? "gold" : "#ccc"}/>
                                </button>
                            ))}
                        </div>
                        <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Your review..." className="w-full p-4 rounded-xl text-xs outline-none bg-white border border-black/5 mb-4 resize-none h-24"/>
                        <button disabled={submittingReview} onClick={submitReview} className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
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
export default Watches;