import React, { useState } from 'react'; 
import { motion } from 'framer-motion';
import { X, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const SignUpCard = ({ onClose, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); // OTP section toggle
  const [loading, setLoading] = useState(false); 
  const [status, setStatus] = useState({ type: '', msg: '' }); 

  // STEP 1: Pehle sirf OTP bhejne ka kaam hoga
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const response = await fetch('http://localhost:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true); // OTP box show karo
        setStatus({ type: 'success', msg: 'CODE SENT TO YOUR EMAIL' });
      } else {
        setStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'SERVER ERROR' });
    } finally { setLoading(false); }
  };

  // STEP 2: OTP milne ke baad hi account create hoga
  const handleFinalSignUp = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: 'success', msg: 'VERIFIED! WELCOME TO XOXO.' });
        setTimeout(() => { onSwitch(); }, 2000);
      } else {
        setStatus({ type: 'error', msg: data.message || 'INVALID OTP' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'SIGNUP FAILED' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative w-full max-w-md bg-white p-10 shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-1 z-20 hover:rotate-90 transition-transform">
          <X size={20} />
        </button>

        <div className="relative z-10">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 block">Identity Verification</span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
            {isOtpSent ? "Enter Code" : "Join the XOXO."}
          </h2>

          {status.msg && (
            <div className={`text-[10px] font-bold uppercase mb-4 p-3 border ${status.type === 'error' ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
              {status.msg}
            </div>
          )}

          <form className="space-y-5" onSubmit={isOtpSent ? handleFinalSignUp : handleSendOtp}>
            {!isOtpSent ? (
              // Phase 1: Details Entry
              <>
                <input required type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full py-3 bg-transparent text-[10px] font-bold tracking-widest border-b border-black/10 focus:border-black outline-none" />
                <input required type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full py-3 bg-transparent text-[10px] font-bold tracking-widest border-b border-black/10 focus:border-black outline-none" />
              </>
            ) : (
              // Phase 2: OTP Verification Section
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-[9px] font-bold opacity-50 mb-2 uppercase">Check your inbox for 6-digit code</p>
                <input required type="text" maxLength="6" placeholder="VERIFICATION CODE" value={otp} onChange={(e) => setOtp(e.target.value)} 
                  className="w-full py-4 bg-zinc-50 px-4 text-lg font-black tracking-[0.5em] border border-black/5 focus:border-black outline-none" />
              </motion.div>
            )}
            
            <motion.button 
              type="submit" 
              disabled={loading} 
              whileHover={{ x: 5 }} 
              className="w-full bg-black text-white py-4 px-6 flex justify-between items-center disabled:opacity-50"
            >
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">
                {loading ? 'Verifying...' : (isOtpSent ? 'Complete Signup' : 'Get Verification Code')}
              </span>
              {loading ? <Loader2 size={16} className="animate-spin" /> : (isOtpSent ? <ShieldCheck size={16} /> : <ArrowRight size={16} />)}
            </motion.button>
          </form>

          <p className="mt-6 text-[9px] font-bold text-black/40 uppercase tracking-widest text-center">
            {isOtpSent && <button onClick={() => setIsOtpSent(false)} className="block mx-auto mb-4 text-black underline">Edit Details</button>}
            Already a member? <button onClick={onSwitch} className="text-black underline underline-offset-4 hover:opacity-70">Sign in</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpCard;