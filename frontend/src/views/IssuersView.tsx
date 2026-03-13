import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchIssuerProfiles } from '../toolkit/gateway';
import type { IssuerProfile } from '../toolkit/interfaces';

/* ── SVG Icon Components ─────────────────────────────────── */

const IconBuilding = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" />
    <line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" />
  </svg>
);

const IconUsers = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconShield = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconExternalLink = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconGlobe = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const IconCalendar = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPlus = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconArrowRight = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconChain = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

/* ── Category icons ──────────────────────────────────────── */

const IconAcademic = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
  </svg>
);

const IconProfessional = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

const IconIdentity = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <circle cx="9" cy="10" r="2.5" />
    <path d="M15 8h2M15 12h2" />
    <path d="M6 17c0-2 1.5-3 3-3s3 1 3 3" />
  </svg>
);

const IconMedical = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const IconLegal = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="15" />
    <path d="M5 8l7-5 7 5" />
    <path d="M5 8v4a7 7 0 007 7 7 7 0 007-7V8" />
    <line x1="3" y1="21" x2="21" y2="21" />
  </svg>
);

/* ── Config ──────────────────────────────────────────────── */

const CATEGORIES = ['Academic', 'Professional', 'Identity', 'Medical', 'Legal'] as const;

const CATEGORY_CONFIG: Record<string, { icon: typeof IconAcademic; color: string; bg: string; gradient: string }> = {
  Academic:     { icon: IconAcademic,     color: 'text-violet-400',  bg: 'bg-violet-500/10  border-violet-500/25',  gradient: 'from-violet-500 to-purple-600' },
  Professional: { icon: IconProfessional, color: 'text-sky-400',     bg: 'bg-sky-500/10     border-sky-500/25',     gradient: 'from-sky-500 to-cyan-600' },
  Identity:     { icon: IconIdentity,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', gradient: 'from-emerald-500 to-teal-600' },
  Medical:      { icon: IconMedical,      color: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/25',    gradient: 'from-rose-500 to-pink-600' },
  Legal:        { icon: IconLegal,        color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/25',   gradient: 'from-amber-500 to-orange-600' },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const EXPLORER_TX = 'https://testnet.explorer.provable.com/transaction/';

/* ── Component ───────────────────────────────────────────── */

export default function IssuersView() {
  const [profiles, setProfiles] = useState<IssuerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchIssuerProfiles()
      .then(data => setProfiles(data.profiles || []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? profiles.filter(p => p.categories.includes(filter))
    : profiles;

  return (
    <div className="min-h-screen bg-cs-dark pt-28 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-32 -right-32 h-[450px] w-[450px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-cs-primary/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-cs-primary to-violet-600 flex items-center justify-center shadow-lg shadow-cs-primary/30"
          >
            <IconBuilding className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sora font-bold mb-5">
            <span className="gradient-text">Registered Issuers</span>
          </h1>
          <p className="text-lg text-gray-400 font-manrope max-w-2xl mx-auto leading-relaxed">
            Browse organizations that have self-registered as issuers on CloakStamp.
            Each issuer declared their allowed certification categories on-chain.
          </p>
        </motion.div>

        {/* ── Stats bar ──────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="flex justify-center mb-10">
          <div className="glass-panel rounded-full px-6 py-2.5 flex items-center gap-3">
            <IconUsers className="h-4 w-4 text-cs-accent" />
            <span className="text-sm font-manrope text-gray-300">
              <span className="text-cs-primary font-semibold">{profiles.length}</span> registered issuer{profiles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* ── Category filters ───────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="flex flex-wrap justify-center gap-2.5 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(null)}
            className={`px-5 py-2 rounded-xl text-sm font-manrope font-medium transition-all duration-200 border ${
              !filter
                ? 'bg-cs-primary/20 text-cs-primary border-cs-primary/40 shadow-lg shadow-cs-primary/10'
                : 'glass-panel text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            All
          </motion.button>
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const CatIcon = cfg.icon;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filter === cat ? null : cat)}
                className={`px-5 py-2 rounded-xl text-sm font-manrope font-medium transition-all duration-200 border flex items-center gap-2 ${
                  filter === cat
                    ? `${cfg.bg} ${cfg.color}`
                    : 'glass-panel text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <CatIcon className="h-3.5 w-3.5" />
                {cat}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Loading ────────────────────── */}
        {loading && (
          <div className="text-center py-24">
            <div className="relative mx-auto h-12 w-12 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-cs-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-cs-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400 font-manrope">Loading issuers...</p>
          </div>
        )}

        {/* ── Empty state ────────────────── */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-2xl glass-panel flex items-center justify-center">
              <IconBuilding className="h-10 w-10 text-gray-500" />
            </div>
            <p className="text-lg text-gray-400 font-manrope mb-2">
              {filter ? `No issuers registered for ${filter} category yet.` : 'No issuers have registered a profile yet.'}
            </p>
            <p className="text-sm text-gray-500 font-manrope mb-8">
              Issuers can register on the Certify page to get started.
            </p>
            <Link to="/certify">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cs-primary to-violet-600 text-white font-sora font-semibold rounded-xl shadow-lg shadow-cs-primary/25"
              >
                <IconPlus className="h-4 w-4" />
                Register as Issuer
              </motion.span>
            </Link>
          </motion.div>
        )}

        {/* ── Issuer cards ───────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((issuer, i) => (
            <motion.div
              key={issuer.hashedAddr}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              custom={i}
              whileHover={{
                y: -4,
                boxShadow: '0 20px 40px rgba(123,57,252,0.1)',
                transition: { duration: 0.3 },
              }}
              className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-cs-primary/30"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cs-primary to-violet-600 flex items-center justify-center shadow-lg shadow-cs-primary/20">
                    <IconBuilding className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-sora font-semibold text-white">{issuer.displayName}</h3>
                    <p className="text-sm text-gray-400 font-manrope">{issuer.organization}</p>
                  </div>
                </div>
                {issuer.website && (
                  <a href={issuer.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-cs-accent hover:text-cs-primary font-manrope transition-colors group">
                    <IconGlobe className="h-3.5 w-3.5" />
                    <span className="group-hover:underline">Website</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Description */}
              {issuer.description && (
                <p className="text-sm text-gray-400 font-manrope mb-5 leading-relaxed">{issuer.description}</p>
              )}

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-5">
                {issuer.categories.map(cat => {
                  const cfg = CATEGORY_CONFIG[cat];
                  if (!cfg) return null;
                  const CatIcon = cfg.icon;
                  return (
                    <span key={cat}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-manrope font-medium border ${cfg.bg} ${cfg.color}`}>
                      <CatIcon className="h-3 w-3" />
                      {cat}
                    </span>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-manrope pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Registered {new Date(issuer.enrolledAt).toLocaleDateString()}
                </span>
                {issuer.chainTxRef?.startsWith('at1') && (
                  <a href={`${EXPLORER_TX}${issuer.chainTxRef}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-cs-accent hover:text-cs-primary transition-colors group">
                    <IconChain className="h-3.5 w-3.5" />
                    <span className="group-hover:underline">View TX</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── On-chain enforcement notice ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mt-14 glass-panel rounded-2xl p-6 flex items-start gap-5 border-violet-500/20"
        >
          <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <IconShield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-violet-400 font-sora font-semibold mb-1.5">On-Chain Category Enforcement</p>
            <p className="text-sm text-gray-400 font-manrope leading-relaxed">
              Each issuer&apos;s allowed categories are stored on the Aleo blockchain as a bitfield. The smart contract enforces that
              issuers can only certify documents in categories they registered for. This enforcement happens at the
              protocol level — it cannot be bypassed by any frontend or API.
            </p>
          </div>
        </motion.div>

        {/* ── CTA ────────────────────────── */}
        {!loading && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="mt-8 text-center"
          >
            <Link to="/certify">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-sm text-cs-accent hover:text-cs-primary font-manrope font-medium transition-colors"
              >
                Want to become an issuer?
                <IconArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
