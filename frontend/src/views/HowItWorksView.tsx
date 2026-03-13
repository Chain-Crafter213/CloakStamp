import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── SVG Icon Components ─────────────────────────────────── */

const IconUpload = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 12 15 15" />
  </svg>
);

const IconHash = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconChain = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const IconShield = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconLock = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconEyeOff = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCreditCard = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconCpu = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const IconBuilding = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" />
    <line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" />
  </svg>
);

const IconFile = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconCheck = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconX = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const IconArrowRight = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Animations ──────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(123,57,252,0.0)',
      '0 0 30px rgba(123,57,252,0.15)',
      '0 0 20px rgba(123,57,252,0.0)',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

/* ── Data ────────────────────────────────────────────────── */

const LIFECYCLE_STEPS = [
  {
    Icon: IconUpload,
    title: 'Upload File',
    desc: 'You select a document (PDF, image, certificate). The file stays on your device — it is never uploaded to any server.',
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
  {
    Icon: IconHash,
    title: 'SHA-256 Hash',
    desc: 'A cryptographic hash (SHA-256) of your file is computed locally in your browser. This produces a unique fingerprint of the document.',
    gradient: 'from-violet-500 to-violet-600',
    glow: 'shadow-violet-500/20',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    Icon: IconChain,
    title: 'BHP256 Commitment',
    desc: 'The SHA-256 hash is converted into an Aleo BHP256 field commitment — a one-way function that cannot be reversed to recover the original document.',
    gradient: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    Icon: IconShield,
    title: 'On-Chain Record',
    desc: 'Only the commitment (a boolean flag) is stored on the Aleo blockchain. Your document content, identity, and payment amount remain fully private.',
    gradient: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
];

type StorageStatus = 'nowhere' | 'chain' | 'encrypted';

const STORAGE_TABLE: { item: string; stored: string; status: StorageStatus }[] = [
  { item: 'Document file (PDF, image)', stored: 'Nowhere — stays on your device', status: 'nowhere' },
  { item: 'Document content / text', stored: 'Nowhere — never leaves your browser', status: 'nowhere' },
  { item: 'SHA-256 hash', stored: 'Temporarily in browser (never sent to server)', status: 'nowhere' },
  { item: 'BHP256 commitment', stored: 'On-chain as boolean flag (document_exists)', status: 'chain' },
  { item: 'Certificate record', stored: 'Encrypted in your wallet (only you can read it)', status: 'encrypted' },
  { item: 'Issuer identity', stored: 'Inside encrypted record (not public)', status: 'encrypted' },
  { item: 'Holder identity', stored: 'Inside encrypted record (not public)', status: 'encrypted' },
  { item: 'Payment amount', stored: 'Inside encrypted record (not public)', status: 'encrypted' },
  { item: 'Revocation status', stored: 'On-chain boolean flag (no content revealed)', status: 'chain' },
];

const STATUS_CONFIG: Record<StorageStatus, { icon: typeof IconX; color: string; bg: string; label: string }> = {
  nowhere:   { icon: IconX,     color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Not stored' },
  chain:     { icon: IconChain, color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'On-chain' },
  encrypted: { icon: IconLock,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Encrypted' },
};

const PARTY_VIEWS = [
  {
    role: 'Issuer',
    Icon: IconBuilding,
    gradient: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/20',
    glowColor: 'rgba(139,92,246,0.15)',
    sees: ['Document commitment (hash)', 'Holder address (to send record)', 'Category and expiry'],
    never: ['Document content', 'Other issuers\' records', 'Who verifies the document later'],
  },
  {
    role: 'Holder',
    Icon: IconFile,
    gradient: 'from-blue-500 to-cyan-600',
    border: 'border-blue-500/20',
    glowColor: 'rgba(59,130,246,0.15)',
    sees: ['Full encrypted certificate (in wallet)', 'Issuer address', 'Category and expiry', 'Who they prove to'],
    never: ['Other holders\' certificates', 'Verification results from verifiers'],
  },
  {
    role: 'Verifier',
    Icon: IconCheck,
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/20',
    glowColor: 'rgba(16,185,129,0.15)',
    sees: ['Verification receipt (valid / revoked / expired)', 'Document commitment (hash only)'],
    never: ['Document content', 'Holder identity', 'Issuer identity', 'Payment amount', 'Other verifiers\' results'],
  },
];

const PRIVACY_ITEMS = [
  { Icon: IconLock,       title: 'Encrypted Records',       text: 'All 5 record types are encrypted on-chain. Only the record owner can decrypt them.' },
  { Icon: IconChain,      title: 'Minimal Public State',    text: 'On-chain mappings store only BHP256 hash commitments and boolean flags — never raw data.' },
  { Icon: IconShield,     title: 'Zero-Knowledge Proofs',   text: 'Holders prove document validity without revealing the document, their identity, or any private data.' },
  { Icon: IconCreditCard, title: 'Hidden Payments',         text: 'Payment amounts are hidden inside encrypted PaymentReceipt records. Only the payer knows.' },
  { Icon: IconEyeOff,     title: 'Unlinkable Parties',      text: 'Connections between issuer, holder, and verifier are unlinkable by external observers.' },
  { Icon: IconCpu,        title: 'Client-Side Hashing',     text: 'Document hashing runs entirely in your browser via WebAssembly. No data is ever sent to a server.' },
];

/* ── Component ───────────────────────────────────────────── */

export default function HowItWorksView() {
  return (
    <div className="min-h-screen bg-cs-dark pt-28 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-cs-primary/5 blur-[120px]" />
        <div className="absolute bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-cs-primary to-violet-600 flex items-center justify-center shadow-lg shadow-cs-primary/30"
          >
            <IconShield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sora font-bold mb-5">
            <span className="gradient-text">How CloakStamp Works</span>
          </h1>
          <p className="text-lg text-gray-400 font-manrope max-w-2xl mx-auto leading-relaxed">
            Your document never leaves your device. Only a cryptographic commitment reaches the blockchain.
            Here is exactly what happens at every step.
          </p>
        </motion.div>

        {/* ── Section 1: Document Lifecycle ──── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="mb-24">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-sora font-semibold text-white mb-10 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-cs-primary to-violet-600" />
            Document Lifecycle
          </motion.h2>

          <div className="relative">
            {/* Animated connection line */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-px">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500/30 via-violet-500/40 to-emerald-500/30 origin-left"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LIFECYCLE_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  custom={i + 1}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className={`relative glass-panel rounded-2xl p-6 text-center transition-all duration-300 ${step.border} ${step.glow} hover:shadow-lg`}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-cs-deep border border-cs-border/30 flex items-center justify-center">
                    <span className="text-xs font-sora font-bold text-gray-400">{i + 1}</span>
                  </div>

                  {/* Icon */}
                  <div className={`mx-auto mb-4 h-14 w-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.glow}`}>
                    <step.Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="font-sora font-semibold text-white mb-2 text-base">{step.title}</h3>
                  <p className="text-sm text-gray-400 font-manrope leading-relaxed">{step.desc}</p>

                  {/* Arrow connector */}
                  {i < 3 && (
                    <div className="hidden lg:flex absolute -right-4 top-24 z-10">
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                      >
                        <IconArrowRight className="h-5 w-5 text-gray-600" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key callout */}
          <motion.div
            variants={fadeUp}
            custom={6}
            {...pulseGlow}
            className="mt-10 glass-panel rounded-2xl p-6 flex items-start gap-5 border-emerald-500/20"
          >
            <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <IconShield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-emerald-400 font-sora font-semibold mb-1">Your file never leaves your device</p>
              <p className="text-sm text-gray-400 font-manrope leading-relaxed">
                The SHA-256 hash and BHP256 commitment are computed entirely in your browser using WebAssembly.
                No file data is ever sent to our servers or the blockchain. The original document exists only on your machine.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ── Section 2: What's Stored Where ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="mb-24">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-sora font-semibold text-white mb-10 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-cs-accent to-violet-500" />
            What's Stored Where
          </motion.h2>

          <motion.div variants={fadeUp} custom={1} className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider">Storage</th>
                    <th className="px-6 py-4 text-xs font-manrope font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {STORAGE_TABLE.map((row, i) => {
                    const cfg = STATUS_CONFIG[row.status];
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3.5 text-sm text-white font-manrope font-medium">{row.item}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-400 font-manrope">{row.stored}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-manrope font-medium ${cfg.bg} ${cfg.color}`}>
                            <cfg.icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>

        {/* ── Section 3: What Each Party Sees ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="mb-24">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-sora font-semibold text-white mb-10 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
            What Each Party Sees
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {PARTY_VIEWS.map((party, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                custom={i + 1}
                whileHover={{
                  y: -4,
                  boxShadow: `0 20px 40px ${party.glowColor}`,
                  transition: { duration: 0.3 },
                }}
                className={`glass-panel rounded-2xl p-6 ${party.border} transition-all duration-300`}
              >
                {/* Role header */}
                <div className={`mb-5 h-12 w-12 rounded-xl bg-gradient-to-br ${party.gradient} flex items-center justify-center shadow-lg`}>
                  <party.Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-sora font-semibold text-white mb-5">{party.role}</h3>

                {/* Can See */}
                <div className="mb-5">
                  <p className="text-xs font-manrope font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <IconCheck className="h-3.5 w-3.5" /> Can See
                  </p>
                  <ul className="space-y-2">
                    {party.sees.map((s, j) => (
                      <li key={j} className="text-sm text-gray-300 font-manrope flex items-start gap-2.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Never Sees */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs font-manrope font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <IconEyeOff className="h-3.5 w-3.5" /> Never Sees
                  </p>
                  <ul className="space-y-2">
                    {party.never.map((n, j) => (
                      <li key={j} className="text-sm text-gray-500 font-manrope flex items-start gap-2.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400/60 shrink-0" /> {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 4: Privacy Guarantees ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="mb-20">
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-sora font-semibold text-white mb-10 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            Privacy Guarantees
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRIVACY_ITEMS.map((g, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                custom={i + 1}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:border-cs-primary/30"
              >
                <div className="mb-3 h-10 w-10 rounded-lg bg-cs-primary/10 border border-cs-primary/20 flex items-center justify-center">
                  <g.Icon className="h-5 w-5 text-cs-accent" />
                </div>
                <h4 className="text-sm font-sora font-semibold text-white mb-1.5">{g.title}</h4>
                <p className="text-sm text-gray-400 font-manrope leading-relaxed">{g.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ──────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="glass-panel rounded-2xl p-10 text-center border-cs-primary/20"
        >
          <h3 className="text-2xl font-sora font-bold text-white mb-3">Ready to certify your first document?</h3>
          <p className="text-gray-400 font-manrope mb-8 max-w-md mx-auto">
            Start certifying with zero-knowledge privacy, or verify an existing document&apos;s authenticity.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/certify">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cs-primary to-violet-600 text-white font-sora font-semibold rounded-xl shadow-lg shadow-cs-primary/25 transition-all hover:shadow-xl hover:shadow-cs-primary/30"
              >
                Start Certifying
                <IconArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <Link to="/verify">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 text-white font-sora font-semibold rounded-xl border border-cs-border/30 hover:bg-white/10 transition-all"
              >
                Verify a Document
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
