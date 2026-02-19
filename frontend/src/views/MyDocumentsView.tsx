import { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../state/sessionStore';
import { Spinner } from '../fragments/shared';
import { fetchHolderCerts } from '../toolkit/gateway';
import { useIdentity } from '../composables/useIdentity';
import type { CertificationRecord } from '../toolkit/interfaces';

/* ──────────────────────────── helpers ──────────────────────────── */

const EXPLORER_TX = 'https://testnet.explorer.provable.com/transaction/';

/** Category → icon SVG + accent  */
const CATEGORY_META: Record<string, { icon: JSX.Element; accent: string; bg: string; border: string; glow: string; topGrad: string; orb: string }> = {
  'Academic Credential': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-violet-500/20',
    topGrad: 'from-violet-600 via-purple-500 to-violet-600',
    orb: 'bg-violet-600',
  },
  'Professional License': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'hover:shadow-sky-500/20',
    topGrad: 'from-sky-600 via-blue-500 to-sky-600',
    orb: 'bg-sky-600',
  },
  'Identity Document': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
      </svg>
    ),
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/20',
    topGrad: 'from-emerald-600 via-green-500 to-emerald-600',
    orb: 'bg-emerald-600',
  },
  'Medical Record': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'hover:shadow-rose-500/20',
    topGrad: 'from-rose-600 via-pink-500 to-rose-600',
    orb: 'bg-rose-600',
  },
  'Legal Certificate': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
      </svg>
    ),
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/20',
    topGrad: 'from-amber-600 via-yellow-500 to-amber-600',
    orb: 'bg-amber-600',
  },
};

const DEFAULT_META = {
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  accent: 'text-gray-400',
  bg: 'bg-gray-500/10',
  border: 'border-gray-500/20',
  glow: 'hover:shadow-gray-500/10',
  topGrad: 'from-gray-600 via-gray-500 to-gray-600',
  orb: 'bg-gray-600',
};

function getMeta(tag: string) {
  return CATEGORY_META[tag] || DEFAULT_META;
}

/* ──────────────────────────── copy button ──────────────────────── */

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }, [text]);
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="ml-1 shrink-0 p-1 rounded-md text-white/30 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
}

/* ──────────────── resolve shield_ → real tx IDs ───────────────── */

function useResolvedTxIds(certs: CertificationRecord[]) {
  const { transactionStatus } = useWallet() as any;
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const attemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!transactionStatus) return;
    const shieldIds = certs
      .filter(c => c.chainTxRef?.startsWith('shield_') && !attemptedRef.current.has(c.chainTxRef!))
      .map(c => c.chainTxRef!);

    if (shieldIds.length === 0) return;

    let cancelled = false;

    const resolve = async () => {
      for (const sid of shieldIds) {
        attemptedRef.current.add(sid);
        try {
          const result = await transactionStatus(sid);
          const txId = result?.transactionId || result?.transaction_id;
          if (txId && typeof txId === 'string' && txId.startsWith('at1') && !cancelled) {
            setResolved(prev => ({ ...prev, [sid]: txId }));
          }
        } catch { /* wallet may not support this yet */ }
      }
    };

    resolve();
    const timer = setTimeout(resolve, 10_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [certs, transactionStatus]);

  return resolved;
}

/* ─────────────────────── document card ─────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3 } },
};

function DocumentCard({ cert, index, resolvedTxId }: { cert: CertificationRecord; index: number; resolvedTxId?: string }) {
  const meta = getMeta(cert.tag);
  const isRevoked = cert.revoked;

  const displayTx = resolvedTxId || (cert.chainTxRef?.startsWith('at1') ? cert.chainTxRef : null);
  const isOnChain = !!displayTx;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      className={`
        relative group rounded-2xl overflow-hidden
        bg-[#0c0c14] border
        ${isRevoked ? 'border-red-500/25' : 'border-white/[0.06]'}
        hover:border-white/[0.12] transition-all duration-500
        shadow-xl shadow-black/40 ${meta.glow} hover:shadow-2xl
        cursor-default
      `}
    >
      {/* ---- Top gradient band ---- */}
      <div className={`h-1 w-full bg-gradient-to-r ${isRevoked ? 'from-red-600 via-red-500 to-red-600' : meta.topGrad}`} />

      {/* ---- Background glow orb on hover ---- */}
      <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 ${meta.orb}`} />

      <div className="relative z-10 p-5">
        {/* ════════ Header ════════ */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Category icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${meta.bg} ${meta.accent} ring-1 ${meta.border} group-hover:scale-110 transition-transform duration-300`}>
              {meta.icon}
            </div>
            <div>
              <h3 className="text-[15px] font-inter font-semibold text-white leading-tight">
                {cert.tag || 'Document'}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${isRevoked ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'}`} />
                <span className={`text-[11px] font-cabin font-bold tracking-wider uppercase ${isRevoked ? 'text-red-400' : 'text-green-400'}`}>
                  {isRevoked ? 'Revoked' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* ALEO badge with real logo */}
          <div className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.07] transition-colors duration-300">
            <img src="/aleo.png" alt="Aleo" className="w-4 h-4 object-contain" />
            <span className="text-[11px] font-inter font-semibold text-white/70">
              {(cert.payMethod || 'ALEO').toUpperCase()}
            </span>
          </div>
        </div>

        {/* ════════ Data fields ════════ */}
        <div className="space-y-3.5 mb-5">
          {/* Document Commitment */}
          <div>
            <label className="block text-[10px] font-manrope font-semibold text-white/25 uppercase tracking-[0.15em] mb-1.5">
              Document Commitment
            </label>
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]">
              <code className="text-[13px] text-white/80 font-mono truncate flex-1" title={cert.docDigest}>
                {cert.docDigest ? `${cert.docDigest.slice(0, 20)}...${cert.docDigest.slice(-12)}` : '—'}
              </code>
              {cert.docDigest && <CopyBtn text={cert.docDigest} />}
            </div>
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-[10px] font-manrope font-semibold text-white/25 uppercase tracking-[0.15em] mb-1.5">
              Issuer
            </label>
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]">
              <code className="text-[13px] text-white/60 font-mono truncate flex-1" title={cert.issuer}>
                {cert.issuer ? `${cert.issuer.slice(0, 16)}...${cert.issuer.slice(-8)}` : '—'}
              </code>
              {cert.issuer && <CopyBtn text={cert.issuer} />}
            </div>
          </div>

          {/* Transaction */}
          <div>
            <label className="block text-[10px] font-manrope font-semibold text-white/25 uppercase tracking-[0.15em] mb-1.5">
              Transaction
            </label>
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]">
              {isOnChain ? (
                <a
                  href={`${EXPLORER_TX}${displayTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-cs-accent hover:text-white font-mono transition-colors duration-200 group/tx truncate flex-1"
                  title={displayTx!}
                >
                  <span className="truncate">{`${displayTx!.slice(0, 16)}...${displayTx!.slice(-8)}`}</span>
                  <svg className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover/tx:opacity-100 group-hover/tx:translate-x-0.5 group-hover/tx:-translate-y-0.5 transition-all duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-[13px] text-yellow-500/60 font-mono flex-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500/60"></span>
                  </span>
                  Pending finalization…
                </span>
              )}
              {displayTx && <CopyBtn text={displayTx} />}
            </div>
          </div>
        </div>

        {/* ════════ Footer ════════ */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 text-white/30">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="text-xs font-manrope">
              {cert.stampedAt ? new Date(cert.stampedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </span>
          </div>

          {/* Chain status pill */}
          <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-inter font-bold tracking-wider uppercase
            ${isOnChain
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-yellow-500/10 text-yellow-500/70 border border-yellow-500/15'
            }
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnChain ? 'bg-green-400' : 'bg-yellow-500/70 animate-pulse'}`} />
            {isOnChain ? 'Confirmed' : 'Pending'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────── main view ──────────────────────────── */

export default function MyDocumentsView() {
  const { connected } = useWallet();
  const { session, walletAddr, isAuthed } = useSessionStore();
  const { authenticate, walletAddr: adapterAddr } = useIdentity();
  const effectiveAddr = walletAddr || adapterAddr;

  const [certs, setCerts] = useState<CertificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedTxIds = useResolvedTxIds(certs);

  useEffect(() => {
    if (!connected) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let addr = effectiveAddr;
        let activeSession = session;
        if (!isAuthed || !session || !addr) {
          const ok = await authenticate();
          if (!ok) {
            setError('Please sign the authentication message in your wallet.');
            setLoading(false);
            return;
          }
          const state = useSessionStore.getState();
          addr = state.walletAddr;
          activeSession = state.session;
        }
        if (!activeSession || !addr) return;
        const data = await fetchHolderCerts(addr, activeSession);
        const sorted = (data.certifications || []).sort(
          (a, b) => new Date(b.stampedAt).getTime() - new Date(a.stampedAt).getTime()
        );
        setCerts(sorted);
      } catch (e: any) {
        setError(e?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [connected, effectiveAddr]);

  /* ──── Not connected state ──── */
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cs-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-cs-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
            </svg>
          </div>
          <h2 className="text-3xl font-inter font-bold text-white mb-3">Connect Wallet</h2>
          <p className="text-white/40 font-manrope">
            Connect your wallet to view your certified documents.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* ──── Header ──── */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.h1
              className="text-4xl md:text-5xl font-inter font-bold text-white mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              My Documents
            </motion.h1>
            <motion.p
              className="text-white/40 font-manrope text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              View all certified documents held by your wallet.
            </motion.p>
          </div>

          {certs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="hidden sm:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0c0c14] border border-white/[0.06]"
            >
              <span className="text-3xl font-inter font-bold text-white">{certs.length}</span>
              <div className="text-xs text-white/30 font-manrope leading-tight">
                Certified<br />Documents
              </div>
            </motion.div>
          )}
        </div>

        {/* ──── Loading ──── */}
        {loading && <Spinner className="my-12" />}

        {/* ──── Error ──── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono mb-6 flex items-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* ──── Empty state ──── */}
        {!loading && certs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14] py-20 px-8 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cs-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="text-white/40 font-manrope text-lg mb-2">No certified documents found</p>
              <p className="text-sm text-white/20 max-w-md mx-auto">
                Documents will appear here after an issuer certifies them to your wallet address.
              </p>
            </div>
          </motion.div>
        )}

        {/* ──── Document grid ──── */}
        {!loading && certs.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {certs.map((cert, idx) => (
                <DocumentCard
                  key={cert.id || cert.uid || idx}
                  cert={cert}
                  index={idx}
                  resolvedTxId={cert.chainTxRef ? resolvedTxIds[cert.chainTxRef] : undefined}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
