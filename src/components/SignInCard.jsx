import React, { useState } from 'react';
import axios from 'axios';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';

const SignInCard = ({ onClose, onLoginSuccess, onSwitch, isAdminMode }) => {
  // --- LOGIC (AUTO-FILL REMOVED) ---
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Yahan Render ka link add kiya hai
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      onLoginSuccess(res.data.user);
      onClose();
    } catch (err) { alert(isAdminMode ? "Admin Access Denied" : "Invalid Credentials"); }
    setLoading(false);
  };

  const handleForgotOTP = async () => {
    if(!resetData.email) return alert("ENTER EMAIL");
    setLoading(true);
    try {
      // Yahan Render ka link add kiya hai
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password-otp`, { email: resetData.email });
      setStep(2);
    } catch (err) { alert("USER NOT FOUND"); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      // Yahan Render ka link add kiya hai
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, resetData);
      alert("PASSWORD UPDATED. PLEASE LOGIN.");
      setIsForgotMode(false);
      setStep(1);
    } catch (err) { alert("INVALID OTP"); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md p-10 relative shadow-2xl border border-black/5"
      >
        <button onClick={onClose} className="absolute top-8 right-8 hover:rotate-90 transition-transform">
          <X size={20} strokeWidth={1.5} />
        </button>

        <AnimatePresence mode="wait">
          {!isForgotMode ? (
            <motion.form 
              key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleLogin} className="space-y-10"
            >
              <div>
                <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-30 block mb-2">Member Portal</span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-black">
                  {isAdminMode ? "Admin." : "Sign In."}
                </h2>
              </div>

              <div className="space-y-6">
                <input required type="email" placeholder="EMAIL ADDRESS" className="w-full py-4 border-b border-black/10 text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black transition-all bg-transparent text-black" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required type="password" placeholder="PASSWORD" className="w-full py-4 border-b border-black/10 text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black transition-all bg-transparent text-black" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 px-8 flex justify-between items-center group active:scale-[0.98] transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{loading ? "Processing..." : "Enter Archive"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {!isAdminMode && (
                <div className="flex flex-col items-center gap-4">
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity">Forgot Access Key?</button>
                  <div className="h-[1px] w-full bg-black/5"></div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                    New here? <button type="button" onClick={onSwitch} className="text-black font-black hover:underline ml-1">Join XOXO</button>
                  </p>
                </div>
              )}
            </motion.form>
          ) : (
            <motion.div 
              key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-10"
            >
              <div>
                <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-30 block mb-2">Recovery</span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-black">
                  {step === 1 ? "Verify." : "Reset."}
                </h2>
              </div>

              {step === 1 ? (
                <div className="space-y-8">
                  <input placeholder="REGISTERED EMAIL" className="w-full py-4 border-b border-black/10 text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black text-black" 
                    onChange={e => setResetData({...resetData, email: e.target.value})} />
                  <button onClick={handleForgotOTP} disabled={loading} className="w-full border border-black py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Request OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-zinc-50 border border-black/5 p-6 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mb-3">Identity Code</p>
                    <input maxLength="6" placeholder="000000" className="bg-transparent text-3xl font-black tracking-[0.5em] outline-none text-center w-full text-black" 
                      onChange={e => setResetData({...resetData, otp: e.target.value})} />
                  </div>
                  <input type="password" placeholder="NEW ACCESS KEY" className="w-full py-4 border-b border-black/10 text-[10px] font-bold tracking-[0.2em] outline-none focus:border-black text-black" 
                    onChange={e => setResetData({...resetData, newPassword: e.target.value})} />
                  <button onClick={handleResetPassword} disabled={loading} className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.3em]">
                    {loading ? "Updating..." : "Establish New Key"}
                  </button>
                </div>
              )}
              <button onClick={() => {setIsForgotMode(false); setStep(1);}} className="w-full text-center text-[8px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100">Back to Portal</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignInCard;