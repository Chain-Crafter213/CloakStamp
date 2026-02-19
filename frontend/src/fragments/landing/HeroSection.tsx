import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ActionButton from '../shared/ActionButton';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260215_121759_424f8e9c-d8bd-4974-9567-52709dfb6842.mp4';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
      />

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

      {/* Blur accent element - top right */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-cs-primary/20 rounded-full blur-[128px] pointer-events-none" />
      {/* Blur accent element - bottom left */}
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-cs-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-cs-border/30 backdrop-blur-sm mb-8"
        >
          <span className="h-2 w-2 rounded-full bg-cs-primary animate-pulse" />
          <span className="text-xs font-manrope text-gray-300 tracking-wide">
            Powered by Aleo Zero-Knowledge Proofs
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-inter font-bold text-white leading-[1.05] mb-2"
        >
          Certify anything.
        </motion.h1>

        <motion.h1
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-cs-primary to-cs-accent leading-[1.05] mb-8"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Reveal nothing.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-lg sm:text-xl text-gray-400 font-manrope max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Issue, hold, and verify documents on-chain without ever exposing
          their content. Privacy-first certification powered by zero-knowledge
          cryptography.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/certify">
            <ActionButton size="lg" variant="primary">
              Start Certifying
            </ActionButton>
          </Link>
          <Link to="/verify">
            <ActionButton size="lg" variant="outline">
              Verify a Document
            </ActionButton>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 font-manrope"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cs-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            On-chain verification
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cs-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Zero-knowledge privacy
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cs-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            ALEO & USDCx payments
          </div>
        </motion.div>
      </div>

      {/* Bottom fade to black */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
