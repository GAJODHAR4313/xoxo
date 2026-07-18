import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Globe } from 'lucide-react';

// Added 'onOpenArchive' prop here
const Hero = ({ onOpenArchive }) => {

  // --- SCROLL ANIMATIONS ---
  const { scrollY } = useScroll();

  const textMove = useTransform(scrollY, [0, 800], [0, -300]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (

    <div className="w-full bg-[#F9F9F9] dark:bg-xoxo-dark-bg antialiased text-black dark:text-xoxo-cream overflow-x-hidden transition-colors duration-300">

      {/* GLOBAL STYLE */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');

        :root {
          font-family: 'Inter', sans-serif;
        }

        .hero-title {
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1.05;
        }

        .hero-label {
          font-weight: 700;
          letter-spacing: 0.4em;
          font-size: 11px;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* SECTION 1 HERO - Fixed height for mobile */}
      <section className="relative w-full min-h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden bg-[#F2F0E9] dark:bg-xoxo-dark-card border-b border-black/5 dark:border-xoxo-dark-border transition-colors duration-300">

        {/* LEFT */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-24 py-16 md:py-0">

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >

            <motion.span
              variants={fadeInUp}
              className="hero-label uppercase mb-6 md:mb-8 block opacity-80"
            >
              THIS WEEK'S HIGHLIGHTS
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="hero-title text-[15vw] sm:text-[12vw] md:text-[4.5vw] text-black dark:text-xoxo-cream mb-6 md:mb-8"
            >
              Limited Edition For <br />
              The Elite Style
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-[13px] md:text-[15px] opacity-40 mb-8 md:mb-10 max-w-sm font-medium leading-relaxed"
            >
              Awesome products for the dynamic urban lifestyles.
              <br />
              Curated for the modern royalty.
            </motion.p>

            {/* BUTTON */}
            <motion.div variants={fadeInUp}>

              <motion.button
                onClick={onOpenArchive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-black dark:bg-xoxo-gold text-white dark:text-black px-7 md:px-10 py-4 md:py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] md:tracking-[0.3em] overflow-hidden transition-all duration-500 border border-black dark:border-xoxo-gold shadow-lg flex items-center gap-4 italic"
              >

                <div className="absolute inset-0 bg-white dark:bg-xoxo-dark-bg translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

                <span className="relative z-10 group-hover:text-black dark:group-hover:text-xoxo-gold transition-colors duration-500">
                  ENTER ARCHIVE
                </span>

                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative z-10 group-hover:text-black dark:group-hover:text-xoxo-gold transition-colors duration-500"
                >
                  <ArrowUpRight size={18} />
                </motion.div>

              </motion.button>

            </motion.div>

          </motion.div>

        </div>

        {/* RIGHT VIDEO - Fixed to contain video */}
        <motion.div
          initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
          className="flex-1 relative h-[30vh] md:h-full bg-gray-200 dark:bg-xoxo-dark-card"
        >

          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
          >
            <source src="/0305 (1).mov" type="video/quicktime" />
            <source src="/0305 (1).mp4" type="video/mp4" />
          </video>

        </motion.div>

      </section>

      {/* FLOATING TEXT */}
      <div className="py-12 md:py-20 bg-white dark:bg-xoxo-dark-bg overflow-hidden border-b border-black/5 dark:border-xoxo-dark-border transition-colors duration-300">

        <motion.div
          style={{ x: textMove }}
          className="flex whitespace-nowrap"
        >

          <h2 className="text-[18vw] md:text-[10vw] font-black uppercase italic leading-none opacity-5 tracking-tighter">
            New Archive 2026 • Limited Drops • Luxury Streetwear • XOXO Styles •
          </h2>

        </motion.div>

      </div>

      {/* SECTION 3 */}
      <section className="py-16 md:py-32 px-5 md:px-20 max-w-[1600px] mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10">

          {/* LEFT IMAGE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="md:col-span-5 group"
          >

            <div className="relative aspect-[3/4] bg-[#EDEDED] dark:bg-xoxo-dark-card overflow-hidden rounded-2xl transition-colors duration-300">

              <img
                src="/Ellipse 4.png"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                alt="product"
              />

              <div className="absolute top-5 left-5 md:top-8 md:left-8">

                <span className="text-[9px] md:text-[10px] font-black tracking-widest bg-black dark:bg-xoxo-gold text-white dark:text-black px-3 py-2 md:px-4 rounded-full uppercase">
                  The Legend Series
                </span>

              </div>

            </div>

            <div className="mt-6 md:mt-8">

              <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
                Concrete Runner v1
              </h4>

              <p className="text-xs md:text-sm opacity-40 mt-2 font-bold uppercase tracking-widest italic">
                Accessories / Shoes
              </p>

            </div>

          </motion.div>

          {/* RIGHT */}
          <div className="md:col-span-7 flex flex-col justify-end md:pl-20">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-md space-y-8 mb-12 md:mb-20"
            >

              <motion.h3
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter"
              >
                Crafted For <br />
                The New Royalty.
              </motion.h3>

              <motion.p
                variants={fadeInUp}
                className="text-[10px] md:text-xs font-bold opacity-30 leading-loose tracking-[0.2em] uppercase italic"
              >
                We don't follow trends. We set the standard for urban luxury.
                Designed in London, recognized worldwide.
              </motion.p>

              <Link to="/shop" className="inline-block">

                <motion.button
                  variants={fadeInUp}
                  className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black dark:border-xoxo-gold pb-2 hover:opacity-50 transition-all italic text-black dark:text-xoxo-gold"
                >
                  Discover Collection
                  <ArrowUpRight size={16} />
                </motion.button>

              </Link>

            </motion.div>

            {/* CIRCLE */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-square bg-black rounded-full overflow-hidden w-48 h-48 md:w-80 md:h-80 self-center md:self-end group shadow-2xl cursor-pointer"
            >

              <Link to="/shoes">

                <img
                  src="/Ellipse 2.png"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110"
                  alt="shoes"
                />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                  <span className="text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                    View Shoes
                  </span>

                </div>

              </Link>

            </motion.div>

          </div>

        </div>

      </section>

      {/* SECTION 4 */}
      <section className="py-16 md:py-40 bg-white dark:bg-xoxo-dark-bg relative transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-5 md:px-6">

          <div className="flex flex-col md:flex-row items-start gap-14 md:gap-20">

            {/* BIG IMAGE */}
            <div className="w-full md:w-7/12 relative group">

              <motion.div
                initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f0f0f0] dark:bg-xoxo-dark-card"
              >

                <img
                  src="/Ellipse 16.png"
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  alt="Editorial"
                />

              </motion.div>

            </div>

            {/* RIGHT */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="w-full md:w-5/12 pt-0 md:pt-32 space-y-10 md:space-y-12"
            >

              <div className="space-y-6">

                <motion.h3
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9]"
                >
                  Beyond <br />
                  Conventional <br />
                  <span className="text-black/20 dark:text-white/20">
                    Design.
                  </span>
                </motion.h3>

              </div>

              {/* SMALL IMAGE */}
              <Link to="/watches" className="block">

                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -20, rotate: 2 }}
                  className="relative aspect-square w-56 md:w-2/3 bg-[#F2F0E9] dark:bg-xoxo-dark-card mx-auto md:ml-0 shadow-2xl border-8 border-white dark:border-xoxo-dark-border overflow-hidden group cursor-pointer"
                >

                  <img
                    src="/Ellipse 7.png"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    alt="Detail"
                  />

                </motion.div>

              </Link>

            </motion.div>

          </div>

        </div>

      </section>

      {/* SECTION 5 */}
      <section className="py-20 md:py-32 bg-black dark:bg-xoxo-dark-card text-white rounded-t-[2rem] md:rounded-t-[4rem] border-t border-transparent dark:border-xoxo-dark-border transition-colors duration-300">

        <div className="px-5 md:px-20 mb-12 flex justify-between items-end">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            The <br />
            Archive
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto px-5 md:px-20 no-scrollbar pb-10">

          {[16, 7, 4, 2].map((imgNum, i) => (

            <motion.div
              key={i}
              className="min-w-[260px] md:min-w-[400px] group cursor-pointer"
            >

              <div className="relative aspect-[4/5] bg-[#111] overflow-hidden rounded-[2rem] mb-6 border border-white/5">

                <img
                  src={`/Ellipse ${imgNum}.png`}
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                  alt="item"
                />

              </div>

            </motion.div>

          ))}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-xoxo-dark-bg py-16 px-6 md:px-8 border-t border-black/5 dark:border-xoxo-dark-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-black dark:text-xoxo-gold animate-pulse">XOXO.</h2>
          <div className="grid grid-cols-2 gap-10">
             <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-black dark:text-xoxo-cream">Explore</p>
              {['Collection', 'Archives', 'About'].map(link => <p key={link} className="text-[10px] font-bold text-black/40 dark:text-xoxo-cream/40 italic">{link}</p>)}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Hero;