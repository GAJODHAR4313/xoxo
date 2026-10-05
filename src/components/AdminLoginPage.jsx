import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      if (res.data.user.role !== 'admin') {
        alert("Admin Access Denied");
        setLoading(false);
        return;
      }
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Force refresh or redirect directly
      window.location.href = '/xoxo-admin';
    } catch (err) {
      alert("Invalid Credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-xoxo-dark-bg flex items-center justify-center p-6 text-black dark:text-xoxo-cream transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.form onSubmit={handleLogin} className="space-y-10 bg-zinc-50 dark:bg-xoxo-dark-card p-10 sm:p-14 rounded-3xl border border-black/5 dark:border-xoxo-dark-border shadow-2xl">
          <div className="text-center">
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-amber-600 dark:text-amber-500 block mb-3">
              XOXO Secure
            </span>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-black dark:text-xoxo-cream">
              Admin.
            </h2>
          </div>

          <div className="space-y-6">
            <input
              required type="email" placeholder="ADMIN EMAIL"
              className="w-full py-4 border-b border-black/10 dark:border-xoxo-dark-border text-base lg:text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black dark:focus:border-xoxo-gold transition-all bg-transparent text-black dark:text-xoxo-cream placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30 text-center"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              required type="password" placeholder="PASSWORD"
              className="w-full py-4 border-b border-black/10 dark:border-xoxo-dark-border text-base lg:text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black dark:focus:border-xoxo-gold transition-all bg-transparent text-black dark:text-xoxo-cream placeholder:text-black/30 dark:placeholder:text-xoxo-cream/30 text-center"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black dark:bg-xoxo-gold text-white dark:text-black py-5 px-8 flex justify-center items-center gap-4 group active:scale-[0.98] transition-all disabled:opacity-50 border border-transparent dark:border-white/10 rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{loading ? "Processing..." : "Authenticate"}</span>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
