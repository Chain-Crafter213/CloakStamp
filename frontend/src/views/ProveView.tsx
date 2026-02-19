import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../state/sessionStore';
import { useTxTracker } from '../state/txTracker';
import { ActionButton, GlassCard } from '../fragments/shared';
import { submitProof } from '../toolkit/gateway';
import { useIdentity } from '../composables/useIdentity';

const PROGRAM_ID = import.meta.env.VITE_ALEO_PROGRAM_ID || 'cloakstamp_private_v2.aleo';
const BASE_FEE = 1_000_000; // 1 ALEO in microcredits

/** Extract plaintext string from a record returned by requestRecords() */
function extractRecordPlaintext(rec: any, decryptFn?: (ct: string) => Promise<string>): string | null {
  // 1. Shield Wallet — use recordPlaintext directly
  if (rec.recordPlaintext) return rec.recordPlaintext;

  // 2. Already a plaintext string
  if (typeof rec === 'string' && rec.includes('{')) return rec;

  // 3. Try ciphertext decryption (handled async outside)
  return null;
}

/** Attempt async decryption for records that only have ciphertext */
async function decryptRecord(rec: any, decryptFn?: (ct: string) => Promise<string>): Promise<string | null> {
  const ct = rec.ciphertext || rec.recordCiphertext;
  if (ct && decryptFn) {
    try {
      const pt = await decryptFn(ct);
      if (pt && typeof pt === 'string') return pt;
    } catch { /* skip */ }
  }
  return null;
}

interface ParsedDoc {
  plaintext: string;
  docHash: string;
  issuer: string;
  category: string;
  expiresAt: string;
}

/** Parse a CertifiedDocument plaintext into display fields */
function parseCertifiedDoc(pt: string): ParsedDoc | null {
  if (!pt.includes('doc_hash') || !pt.includes('issuer') || !pt.includes('category')) return null;
  const field = (name: string) => {
    const m = pt.match(new RegExp(`${name}:\\s*([^,}]+)`));
    return m ? m[1].trim() : '';
  };
  return {
    plaintext: pt,
    docHash: field('doc_hash'),
    issuer: field('issuer'),
    category: field('category'),
    expiresAt: field('expires_at'),
  };
}

export default function ProveView() {
  const { connected, executeTransaction, address: walletAddress, requestRecords, decrypt } = useWallet();
  const { session, walletAddr, isAuthed } = useSessionStore();
  const { authenticate, walletAddr: adapterAddr } = useIdentity();
  const { push } = useTxTracker();
  const effectiveAddr = walletAddr || adapterAddr || walletAddress;

  const [docs, setDocs] = useState<ParsedDoc[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [verifierAddr, setVerifierAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Fetch CertifiedDocument records from the wallet */
  const fetchDocuments = useCallback(async () => {
    if (!connected || !requestRecords) return;
    setLoading(true);
    setError(null);
    try {
      const records = await requestRecords(PROGRAM_ID);
      const parsed: ParsedDoc[] = [];
      for (const r of (records || []) as any[]) {
        if (r.spent) continue;

        let pt = extractRecordPlaintext(r);
        if (!pt) pt = await decryptRecord(r, decrypt);
        if (!pt) continue;

        const doc = parseCertifiedDoc(pt);
        if (doc) parsed.push(doc);
      }
      setDocs(parsed);
      if (parsed.length === 1) setSelectedIdx(0);
    } catch (e: any) {
      console.warn('[Prove] Failed to load documents:', e);
      setError('Could not load your CertifiedDocument records. Make sure you own certified documents.');
    } finally {
      setLoading(false);
    }
  }, [connected, requestRecords, decrypt]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  /** Find a credits record plaintext (same pattern as CertifyView) */
  const findCreditsRecord = async (): Promise<string> => {
    if (!requestRecords) throw new Error('Wallet does not support requestRecords');
    const records = await requestRecords('credits.aleo');
    for (const r of (records || []) as any[]) {
      if (r.spent) continue;

      if (r.recordPlaintext) return r.recordPlaintext;
      if (typeof r === 'string' && r.includes('microcredits')) return r;

      const ct = r.ciphertext || r.recordCiphertext;
      if (ct && decrypt) {
        try {
          const pt = await decrypt(ct);
          if (pt && typeof pt === 'string') return pt;
        } catch { /* next */ }
      }

      if (r.owner || r.data?.microcredits) {
        let owner = String(r.owner || '');
        if (!owner.endsWith('.private')) owner += '.private';
        const mcRaw = String(r.data?.microcredits || r.microcredits || '0');
        const mcVal = mcRaw.match(/(\d[\d_]*)/)?.[1]?.replace(/_/g, '') || '0';
        let nonce = String(r.nonce || r._nonce || '0group.public');
        if (!nonce.includes('group')) nonce += 'group.public';
        return `{\n  owner: ${owner},\n  microcredits: ${mcVal}u64.private,\n  _nonce: ${nonce}\n}`;
      }
    }
    throw new Error('No usable credits record found. You need ALEO credits to pay the proof fee.');
  };

  const handleProve = async () => {
    if (!connected || selectedIdx < 0 || !verifierAddr) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      let addr = effectiveAddr;
      let activeSession = session;
      if (!isAuthed || !session || !addr) {
        const ok = await authenticate();
        if (!ok) throw new Error('Authentication failed. Please sign the message in your wallet.');
        const state = useSessionStore.getState();
        addr = state.walletAddr;
        activeSession = state.session;
      }
      if (!activeSession || !addr) throw new Error('Authentication failed');

      const selectedDoc = docs[selectedIdx];
      const creditsPlaintext = await findCreditsRecord();
      const feeAmount = 100_000; // 0.1 ALEO

      // prove_document(doc: CertifiedDocument, verifier: address, pay_record: credits.aleo/credits, fee_amount: u64)
      const txResult = await executeTransaction({
        program: PROGRAM_ID,
        function: 'prove_document',
        inputs: [
          selectedDoc.plaintext,   // CertifiedDocument record plaintext
          verifierAddr,            // verifier address
          creditsPlaintext,        // credits.aleo/credits record plaintext
          `${feeAmount}u64`,       // fee_amount
        ],
        fee: BASE_FEE,
        privateFee: false,
      });

      const txId = String(txResult?.transactionId || txResult);
      push(txId, 'Prove Document Ownership');

      // Record in backend (strip .private suffix from doc_hash)
      const cleanDocHash = selectedDoc.docHash.replace(/\.private$/, '');
      await submitProof(
        { docCommitment: cleanDocHash, inspector: verifierAddr, chainTxRef: txId },
        activeSession
      );

      setResult(txId);
    } catch (e: any) {
      setError(e?.message || 'Proof submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-inter font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-400 font-manrope">
          Connect your wallet to prove document ownership.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-inter font-bold text-white mb-2">Prove Ownership</h1>
        <p className="text-gray-400 font-manrope mb-10">
          Generate a zero-knowledge proof that you hold a certified document, without revealing its content.
        </p>

        <GlassCard>
          <div className="space-y-6">
            {/* Document selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-manrope text-gray-300">
                  Select Certified Document
                </label>
                <button
                  onClick={fetchDocuments}
                  disabled={loading}
                  className="text-xs text-cs-accent hover:text-cs-accent/80 font-manrope transition-colors"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-4 text-gray-500 text-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cs-accent border-t-transparent" />
                  Scanning wallet for certified documents...
                </div>
              ) : docs.length === 0 ? (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-manrope">
                  No CertifiedDocument records found in your wallet. You need a certified document before you can prove ownership.
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {docs.map((doc, idx) => {
                      const truncHash = doc.docHash.length > 20
                        ? `${doc.docHash.slice(0, 12)}...${doc.docHash.slice(-8)}`
                        : doc.docHash;
                      const truncIssuer = doc.issuer.length > 20
                        ? `${doc.issuer.slice(0, 12)}...${doc.issuer.slice(-6)}`
                        : doc.issuer;
                      const isSelected = selectedIdx === idx;
                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedIdx(idx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-cs-accent/60 bg-cs-accent/10'
                              : 'border-cs-border/30 bg-white/5 hover:border-cs-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">Doc #{idx + 1}</span>
                            {isSelected && (
                              <span className="text-xs text-cs-accent font-manrope font-semibold">Selected</span>
                            )}
                          </div>
                          <p className="text-sm text-white font-mono mt-1 truncate" title={doc.docHash}>
                            {truncHash}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500 font-manrope">
                            <span>Issuer: {truncIssuer}</span>
                            <span>Cat: {doc.category}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Verifier address */}
            <div>
              <label className="block text-sm font-manrope text-gray-300 mb-2">
                Verifier Address
              </label>
              <input
                type="text"
                value={verifierAddr}
                onChange={(e) => setVerifierAddr(e.target.value)}
                placeholder="aleo1..."
                className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 font-mono text-sm focus:outline-none focus:border-cs-primary/50 transition-colors"
              />
              <p className="mt-1.5 text-xs text-gray-600 font-manrope">
                The address that will receive the VerificationReceipt, proving you hold this document.
              </p>
            </div>

            <ActionButton
              onClick={handleProve}
              loading={submitting}
              disabled={selectedIdx < 0 || !verifierAddr}
              className="w-full"
              size="lg"
            >
              Generate Proof
            </ActionButton>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                {error}
              </div>
            )}
            {result && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-green-400 text-sm font-manrope mb-1">Proof submitted to chain!</p>
                <p className="text-xs text-gray-400 font-mono break-all">{result}</p>
                <p className="text-xs text-gray-500 mt-2 font-manrope">
                  The verifier will receive a VerificationReceipt record granting verification rights.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
