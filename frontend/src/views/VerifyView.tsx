import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActionButton, GlassCard, Spinner } from '../fragments/shared';
import { validateProof, checkDocStatus } from '../toolkit/gateway';

export default function VerifyView() {
  const [commitment, setCommitment] = useState('');
  const [mode, setMode] = useState<'proof' | 'document'>('proof');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    certified?: boolean;
    revoked?: boolean;
    valid?: boolean;
    exists?: boolean;
    tag?: string;
    stampedAt?: string;
    chainTxRef?: string;
    chainConfirmed?: boolean;
    proofCount?: number;
    latestProof?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!commitment) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (mode === 'proof') {
        const data = await validateProof(commitment);
        setResult(data);
      } else {
        const data = await checkDocStatus(commitment);
        setResult({
          exists: data.exists,
          revoked: data.revoked,
          certified: data.exists,
          valid: data.valid,
          tag: data.tag,
          stampedAt: data.stampedAt,
          chainTxRef: data.chainTxRef,
          chainConfirmed: data.chainConfirmed,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!result) return '';
    if (result.revoked) return 'border-red-500/30 bg-red-500/10';
    if (result.valid || result.certified) return 'border-green-500/30 bg-green-500/10';
    return 'border-yellow-500/30 bg-yellow-500/10';
  };

  const getStatusText = () => {
    if (!result) return '';
    if (result.revoked) return 'Revoked';
    if (result.valid) return 'Valid Proof';
    if (result.certified) return 'Certified';
    return 'Not Found';
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.revoked) {
      return (
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (result.valid || result.certified) {
      return (
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-inter font-bold text-white mb-2">Verify</h1>
        <p className="text-gray-400 font-manrope mb-10">
          Validate a document certification or verification proof on-chain. No wallet required.
        </p>

        <GlassCard>
          <div className="space-y-6">
            {/* Mode toggle */}
            <div>
              <label className="block text-sm font-manrope text-gray-300 mb-2">Verification Type</label>
              <div className="flex gap-3">
                {([
                  { key: 'proof', label: 'Proof Validation' },
                  { key: 'document', label: 'Document Status' },
                ] as const).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setMode(m.key); setResult(null); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-cabin font-semibold transition-all ${
                      mode === m.key
                        ? 'bg-cs-primary/20 border border-cs-primary text-white'
                        : 'bg-white/5 border border-cs-border/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commitment input */}
            <div>
              <label className="block text-sm font-manrope text-gray-300 mb-2">
                {mode === 'proof' ? 'Document Commitment' : 'Document Commitment'}
              </label>
              <input
                type="text"
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                placeholder="Paste the document commitment from My Docs..."
                className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 font-mono text-sm focus:outline-none focus:border-cs-primary/50 transition-colors"
              />
              <p className="mt-1.5 text-xs text-gray-600 font-manrope">
                Copy the Document Commitment value from the My Docs page using the copy button.
              </p>
            </div>

            <ActionButton
              onClick={handleVerify}
              loading={loading}
              disabled={!commitment}
              className="w-full"
              size="lg"
            >
              {mode === 'proof' ? 'Validate Proof' : 'Check Document'}
            </ActionButton>

            {loading && <Spinner className="my-4" />}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                {error}
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-xl border ${getStatusColor()}`}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-lg font-inter font-bold text-white">{getStatusText()}</h3>
                    <p className="text-sm text-gray-400 font-manrope mt-1">
                      {result.revoked
                        ? 'This document/proof has been revoked by the issuer.'
                        : result.valid || result.certified
                        ? result.chainConfirmed
                          ? 'Verified: backend record exists and on-chain transaction confirmed.'
                          : 'Backend record found. On-chain confirmation pending.'
                        : 'No matching record found.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <span className="text-xs text-gray-500 font-mono break-all block">{commitment}</span>
                  {result.tag && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-manrope">Category</span>
                      <span className="text-gray-300 font-manrope">{result.tag}</span>
                    </div>
                  )}
                  {result.stampedAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-manrope">Certified</span>
                      <span className="text-gray-300 font-manrope">{new Date(result.stampedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {result.chainTxRef && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-manrope">Chain TX</span>
                      {result.chainTxRef.startsWith('at1') ? (
                        <a
                          href={`https://explorer.provable.com/transaction/${result.chainTxRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cs-accent/80 hover:text-cs-accent font-mono truncate ml-2 transition-colors"
                          title={result.chainTxRef}
                        >
                          {`${result.chainTxRef.slice(0, 16)}...${result.chainTxRef.slice(-8)}`} ↗
                        </a>
                      ) : (
                        <span className="text-gray-300 font-mono truncate ml-2" title={result.chainTxRef}>
                          {result.chainTxRef.length > 30 ? `${result.chainTxRef.slice(0, 16)}...${result.chainTxRef.slice(-8)}` : result.chainTxRef}
                        </span>
                      )}
                    </div>
                  )}
                  {result.chainConfirmed !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-manrope">On-chain</span>
                      <span className={result.chainConfirmed ? 'text-green-400' : 'text-yellow-400'}>
                        {result.chainConfirmed ? 'Confirmed on explorer' : result.chainTxRef?.startsWith('shield_') ? 'Pending finalization' : 'Awaiting confirmation'}
                      </span>
                    </div>
                  )}
                  {(result.proofCount !== undefined && result.proofCount > 0) && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-manrope">Proofs</span>
                      <span className="text-cs-accent">{result.proofCount} proof(s) submitted</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
