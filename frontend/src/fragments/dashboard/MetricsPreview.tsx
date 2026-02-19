import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchProtocolMetrics, fetchProtocolFees } from '../../toolkit/gateway';
import type { ProtocolMetrics, ProtocolFees } from '../../toolkit/interfaces';
import { MetricCard, GlassCard } from '../shared';

export default function MetricsPreview() {
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(null);
  const [fees, setFees] = useState<ProtocolFees | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, f] = await Promise.all([fetchProtocolMetrics(), fetchProtocolFees()]);
        if (!cancelled) {
          setMetrics(m);
          setFees(f);
        }
      } catch {
        // Silently fail on landing — metrics are optional
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-5 h-24 animate-pulse bg-white/[0.02]"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-3">
          Protocol at a Glance
        </h2>
        <p className="text-gray-400 font-manrope max-w-lg mx-auto">
          Live on-chain statistics from the CloakStamp protocol on Aleo Testnet.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Certifications"
          value={metrics?.totalStamped ?? '—'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accent
        />
        <MetricCard
          label="Total Verifications"
          value={metrics?.totalProved ?? '—'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <MetricCard
          label="Registered Issuers"
          value={metrics?.enrolledAuthorities ?? '—'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Issuance Fee"
          value={fees ? `${(fees.issuanceFee / 1_000_000).toFixed(2)} ALEO` : '—'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          {
            step: '01',
            title: 'Issue',
            desc: 'Registered issuers certify documents on-chain using BHP256 commitments. The document content never touches the blockchain.',
          },
          {
            step: '02',
            title: 'Hold',
            desc: 'Holders receive encrypted records proving ownership. Only the holder can decrypt and present their certified documents.',
          },
          {
            step: '03',
            title: 'Verify',
            desc: 'Verifiers confirm document validity through zero-knowledge proofs. No document content is revealed during verification.',
          },
        ].map((item) => (
          <GlassCard key={item.step} hover>
            <span className="text-cs-primary font-mono text-sm font-bold">{item.step}</span>
            <h3 className="text-xl font-inter font-bold text-white mt-2 mb-3">{item.title}</h3>
            <p className="text-sm text-gray-400 font-manrope leading-relaxed">{item.desc}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
