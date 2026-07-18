import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config';

const SignUpCard = ({ onClose, onSwitch, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: 'success', msg: 'WELCOME TO XOXO.' });
        if (data.token && data.user && onLoginSuccess) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setTimeout(() => { onLoginSuccess(data.user, data.token); onClose(); }, 1200);
        } else {
          setTimeout(() => { onSwitch(); }, 1500);
        }
      } else {
        setStatus({ type: 'error', msg: data.message || 'SIGNUP FAILED' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'SERVER ERROR' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white p-8 sm:p-10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 hover:rotate-90 transition-transform">
          <X size={20} />
        </button>

        <div className="relative z-10">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-30 block mb-2">New Member</span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-8">Join XOXO.</h2>

          {status.msg && (
            <div className={`text-[10px] font-bold uppercase mb-4 p-3 border ${status.type === 'error' ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
              {status.msg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSignUp}>
            <input
              required type="email" placeholder="EMAIL"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 bg-transparent text-base lg:text-[10px] font-bold tracking-widest border-b border-black/10 outline-none focus:border-black transition-all"
            />
            <input
              required type="password" placeholder="PASSWORD"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 bg-transparent text-base lg:text-[10px] font-bold tracking-widest border-b border-black/10 outline-none focus:border-black transition-all"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 px-6 flex justify-between items-center disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase">{loading ? 'Creating...' : 'Create Account'}</span>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-[9px] font-bold text-black/40 text-center uppercase tracking-widest">
            Already a member?{' '}
            <button onClick={onSwitch} className="text-black underline font-black">Sign in</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpCard;