import React, { useState } from 'react';
import axios from 'axios';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config';

const SignInCard = ({ onClose, onLoginSuccess, onSwitch, isAdminMode }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      if (isAdminMode && res.data.user.role !== 'admin') {
        alert("Admin Access Denied");
        setLoading(false);
        return;
      }
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user, res.data.token);
      onClose();
    } catch (err) {
      alert(isAdminMode ? "Admin Access Denied" : "Invalid Credentials");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-xoxo-dark-card w-full max-w-md p-8 sm:p-10 relative shadow-2xl border border-black/5 dark:border-xoxo-dark-border text-black dark:text-xoxo-cream transition-colors duration-300"
      >
        <button onClick={onClose} className="absolute top-8 right-8 hover:rotate-90 transition-transform">
          <X size={20} strokeWidth={1.5} />
        </button>

        <motion.form onSubmit={handleLogin} className="space-y-10">
          <div>
            <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-30 dark:opacity-60 block mb-2">
              {isAdminMode ? 'Admin Portal' : 'Member Portal'}
            </span>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-black dark:text-xoxo-cream">
              {isAdminMode ? "Admin." : "Sign In."}
            </h2>
          </div>

          <div className="space-y-6">
            <input
              required type="email" placeholder="EMAIL ADDRESS"
              className="w-full py-4 border-b border-black/10 dark:border-xoxo-dark-border text-base lg:text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black dark:focus:border-xoxo-gold transition-all bg-transparent text-black dark:text-xoxo-cream placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              required type="password" placeholder="PASSWORD"
              className="w-full py-4 border-b border-black/10 dark:border-xoxo-dark-border text-base lg:text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black dark:focus:border-xoxo-gold transition-all bg-transparent text-black dark:text-xoxo-cream placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black dark:bg-xoxo-gold text-white dark:text-black py-5 px-8 flex justify-between items-center group active:scale-[0.98] transition-all disabled:opacity-50 border border-transparent dark:border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{loading ? "Processing..." : "Enter Archive"}</span>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          {!isAdminMode && (
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-xoxo-cream/40">
                New here?{' '}
                <button type="button" onClick={onSwitch} className="text-black dark:text-xoxo-gold font-black hover:underline ml-1">
                  Join XOXO
                </button>
              </p>
            </div>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
};

export default SignInCard;