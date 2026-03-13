import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../fragments/landing/HeroSection';
import MetricsPreview from '../fragments/dashboard/MetricsPreview';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

function PrivacySummary() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-sora font-bold text-white mb-4">
            Where Are Your Documents Stored?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-gray-400 font-manrope max-w-2xl mx-auto">
            Nowhere. Your documents never leave your device. Here's exactly what happens.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: '📄', title: 'Your File', desc: 'Stays on your device. Never uploaded to any server or the blockchain.', color: 'border-blue-500/20 bg-blue-500/5' },
            { icon: '🔐', title: 'Hash Only', desc: 'A one-way cryptographic hash (BHP256) is computed in your browser.', color: 'border-violet-500/20 bg-violet-500/5' },
            { icon: '⛓️', title: 'On-Chain Flag', desc: 'Only a boolean flag (exists: true/false) is stored on the Aleo blockchain.', color: 'border-emerald-500/20 bg-emerald-500/5' },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 2}
              className={`rounded-xl border p-6 text-center ${item.color}`}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-white font-sora font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 font-manrope">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5}
          className="text-center">
          <Link to="/how-it-works"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-cs-border/30 text-sm font-manrope text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            Learn the full privacy model →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomeView() {
  return (
    <>
      <HeroSection />
      <MetricsPreview />
      <PrivacySummary />
    </>
  );
}
