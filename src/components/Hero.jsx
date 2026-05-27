import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Globe } from 'lucide-react';

// Added 'onOpenArchive' prop here
const Hero = ({ onOpenArchive }) => {
  // --- SCROLL ANIMATIONS ---
  const { scrollY } = useScroll();
  const rotateBadge = useTransform(scrollY, [0, 2000], [0, 360]);
  const textMove = useTransform(scrollY, [500, 1500], [0, -200]);

  // Animation Constants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="w-full bg-[#F9F9F9] antialiased text-black overflow-x-hidden">
      
      {/* 1. GLOBAL STYLE */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
        :root { font-family: 'Inter', sans-serif; }
        .hero-title { font-weight: 800; letter-spacing: -0.05em; line-height: 1.05; }
        .hero-label { font-weight: 700; letter-spacing: 0.4em; font-size: 11px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative w-full h-[80vh] flex flex-col md:flex-row overflow-hidden bg-[#F2F0E9] border-b border-black/5">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-24 h-full">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={fadeInUp} className="hero-label uppercase mb-8 block opacity-80">THIS WEEK'S HIGHLIGHTS</motion.span>
            <motion.h1 variants={fadeInUp} className="hero-title text-[9vw] md:text-[4.5vw] text-black mb-8">Limited Edition For <br /> The Elite Style</motion.h1>
            <motion.p variants={fadeInUp} className="text-[15px] opacity-40 mb-10 max-w-sm font-medium leading-relaxed">
              Awesome products for the dynamic urban lifestyles. <br /> Curated for the modern royalty.
            </motion.p>
            
            {/* UPDATED SHOP NOW BUTTON - Linked to Global Archive */}
            <motion.div variants={fadeInUp}>
                <motion.button 
                  onClick={onOpenArchive} // Trigger the drawer
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-black text-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 border border-black shadow-lg flex items-center gap-4 italic"
                >
                  {/* Background Hover Invert Effect */}
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  
                  <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                    ENTER ARCHIVE
                  </span>

                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="relative z-10 group-hover:text-black transition-colors duration-500"
                  >
                    <ArrowUpRight size={18} />
                  </motion.div>
                </motion.button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="flex-1 relative h-full bg-gray-200"
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000">
            <source src="/0305 (1).mov" type="video/quicktime" /><source src="/0305 (1).mp4" type="video/mp4" />
          </video>
        </motion.div>
      </section>

      {/* --- SECTION 2: FLOATING TEXT --- */}
      <div className="py-20 bg-white overflow-hidden border-b border-black/5">
        <motion.div style={{ x: textMove }} className="flex whitespace-nowrap">
            <h2 className="text-[10vw] font-black uppercase italic leading-none opacity-5 tracking-tighter">
                New Archive 2026 • Limited Drops • Luxury Streetwear • XOXO Styles •
            </h2>
        </motion.div>
      </div>

      {/* --- SECTION 3: ASYMMETRICAL ART GRID --- */}
<section className="py-32 px-6 md:px-20 max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* BADI IMAGE (NO LINK - JUST DISPLAY) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="md:col-span-5 group"
        >
            <div className="relative aspect-[3/4] bg-[#EDEDED] overflow-hidden rounded-2xl">
                <img src="/Ellipse 4.png" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="product" />
                <div className="absolute top-8 left-8">
                    <span className="text-[10px] font-black tracking-widest bg-black text-white px-4 py-2 rounded-full uppercase">The Legend Series</span>
                </div>
            </div>
            <div className="mt-8">
                <h4 className="text-3xl font-black italic uppercase tracking-tighter">Concrete Runner v1</h4>
                <p className="text-sm opacity-40 mt-2 font-bold uppercase tracking-widest italic">Accessories / Shoes</p>
            </div>
        </motion.div>

        <div className="md:col-span-7 flex flex-col justify-end md:pl-20">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-md space-y-8 mb-20"
            >
                <motion.h3 variants={fadeInUp} className="text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">Crafted For <br /> The New Royalty.</motion.h3>
                <motion.p variants={fadeInUp} className="text-xs font-bold opacity-30 leading-loose tracking-[0.2em] uppercase italic">We don't follow trends. We set the standard for urban luxury. Designed in London, recognized worldwide.</motion.p>
                
                {/* DISCOVER COLLECTION LINKED TO SHOP */}
                <Link to="/shop" className="inline-block">
                    <motion.button 
                      variants={fadeInUp} 
                      className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-2 hover:opacity-50 transition-all italic"
                    >
                      Discover Collection <ArrowUpRight size={16}/>
                    </motion.button>
                </Link>
            </motion.div>

            {/* CIRCLE IMAGE LINKED TO SHOES */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-square bg-black rounded-full overflow-hidden w-80 h-80 self-end group shadow-2xl cursor-pointer"
            >
                <Link to="/shoes">
                    <img 
                      src="/Ellipse 2.png" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110" 
                      alt="shoes" 
                    />
                    {/* Subtle Overlay on Circle */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[9px] font-black uppercase tracking-[0.5em] border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">View Shoes</span>
                    </div>
                </Link>
            </motion.div>
        </div>
    </div>
</section>

   {/* --- SECTION 4: EDITORIAL LOOKBOOK --- */}
<section className="py-40 bg-white relative">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row items-start gap-20">
      
      {/* BADI VERTICAL IMAGE (KEEPING IT CLEAN) */}
      <div className="w-full md:w-7/12 relative group">
        <motion.div 
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f0f0f0]"
        >
          <img src="/Ellipse 16.png" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="Editorial" />
        </motion.div>
        <div className="absolute -right-12 top-20 rotate-90 origin-left hidden md:block">
          <span className="text-[10px] font-black tracking-[0.8em] uppercase opacity-20 whitespace-nowrap">AUTUMN WINTER ARCHIVE 2026</span>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="w-full md:w-5/12 pt-0 md:pt-32 space-y-12"
      >
        <div className="space-y-6">
          <motion.h3 variants={fadeInUp} className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">Beyond <br /> Conventional <br /> <span className="text-black/20">Design.</span></motion.h3>
          <motion.p variants={fadeInUp} className="text-xs font-bold opacity-40 leading-loose tracking-widest uppercase italic max-w-xs">Our pieces are not just garments; they are artifacts of a subculture that refuses to be quiet.</motion.p>
        </div>

        {/* CHOTI SQUARE IMAGE -> LINKED TO WATCHES */}
        <Link to="/watches" className="block">
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -20, rotate: 2 }} 
            className="relative aspect-square w-2/3 bg-[#F2F0E9] ml-auto md:ml-0 shadow-2xl border-8 border-white overflow-hidden group cursor-pointer"
          >
            <img src="/Ellipse 7.png" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="Detail" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] font-black uppercase tracking-widest">View Watches</span>
            </div>
          </motion.div>
        </Link>

        {/* READ THE STORY BUTTON -> LINKED TO WATCHES */}
        <motion.div variants={fadeInUp} className="pt-8">
          <Link to="/watches">
            <button className="group flex items-center gap-6">
              <span className="w-12 h-[1px] bg-black group-hover:w-20 transition-all duration-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore Watches</span>
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </div>
</section>
      {/* --- SECTION 5: HORIZONTAL GALLERY --- */}
      <section className="py-32 bg-black text-white rounded-t-[4rem]">
          <div className="px-6 md:px-20 mb-16 flex justify-between items-end">
              <motion.h2 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-7xl font-black italic uppercase tracking-tighter leading-none"
              >
                The <br /> Archive
              </motion.h2>
          </div>
          <div className="flex gap-12 overflow-x-auto px-6 md:px-20 no-scrollbar pb-10">
              {[16, 7, 4, 2].map((imgNum, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="min-w-[400px] group cursor-pointer"
                  >
                      <div className="relative aspect-[4/5] bg-[#111] overflow-hidden rounded-[3rem] mb-8 border border-white/5">
                          <img src={`/Ellipse ${imgNum}.png`} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" alt="item" />
                          <div className="absolute bottom-10 right-10 translate-y-20 group-hover:translate-y-0 transition-all duration-500">
                             <button className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><Plus size={24}/></button>
                          </div>
                      </div>
                      <div className="flex justify-between items-center px-4">
                          <span className="text-[11px] font-black tracking-widest uppercase italic">Drop #00{i+1}</span>
                          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest italic">Explore Case</span>
                      </div>
                  </motion.div>
              ))}
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-24 px-8 border-t border-black/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="space-y-6"
              >
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase">XOXO.</h2>
                  <p className="text-[9px] font-bold text-black/30 tracking-[0.4em] uppercase">Est 2026 • London Boutique</p>
              </motion.div>
              <div className="grid grid-cols-2 gap-20">
                  <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-6">Explore</p>
                      {['Collection', 'Archives', 'About'].map(link => <p key={link} className="text-[10px] font-bold text-black/40 hover:text-black cursor-pointer italic transition-colors">{link}</p>)}
                  </div>
                  <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-6">Connect</p>
                      {['Instagram', 'TikTok', 'Newsletter'].map(link => <p key={link} className="text-[10px] font-bold text-black/40 hover:text-black cursor-pointer italic transition-colors">{link}</p>)}
                  </div>
              </div>
          </div>
          <div className="mt-24 pt-10 border-t border-black/[0.03] flex justify-between items-center">
              <p className="text-[8px] font-bold text-black/20 uppercase tracking-[0.3em]">© 2026 LIMITED EDITION FOR XOXO FASHION</p>
              <Globe size={14} className="opacity-10" />
          </div>
      </footer>

      {/* STICKY BADGE */}
      <motion.div style={{ rotate: rotateBadge }} className="fixed bottom-10 right-10 w-24 h-24 z-50 pointer-events-none hidden md:flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-20">
          <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
          <text className="text-[9px] font-black uppercase tracking-[4px] fill-black italic">
            <textPath xlinkHref="#circlePath">• XOXO PREMIUM • EST 2026 •</textPath>
          </text>
        </svg>
      </motion.div>

    </div>
  );
};

export default Hero;