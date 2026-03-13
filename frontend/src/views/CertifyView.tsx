import { useState, useEffect } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { motion } from 'framer-motion';
import { useSessionStore } from '../state/sessionStore';
import { useTxTracker } from '../state/txTracker';
import { ActionButton, GlassCard, Spinner } from '../fragments/shared';
import { hashFileToHex, computeDocCommitment } from '../toolkit/digest';
import { scaleUsdcx } from '../toolkit/stablecoin';
import { stampDocument, enrollAuthority, checkAuthority, fetchHolderCerts } from '../toolkit/gateway';
import { useIdentity } from '../composables/useIdentity';

const PROGRAM_ID = import.meta.env.VITE_ALEO_PROGRAM_ID || 'cloakstamp_private_v3.aleo';
const BASE_FEE = 1_000_000; // 1 ALEO in microcredits — Shield Wallet requires non-zero fee
const CATEGORIES = [
  { value: 1, label: 'Academic Credential', bit: 1 },
  { value: 2, label: 'Professional License', bit: 2 },
  { value: 3, label: 'Identity Document', bit: 4 },
  { value: 4, label: 'Medical Record', bit: 8 },
  { value: 5, label: 'Legal Certificate', bit: 16 },
];

export default function CertifyView() {
  const { connected, executeTransaction, address: walletAddress, requestRecords, decrypt } = useWallet();
  const { session, walletAddr, isAuthed } = useSessionStore();
  const { authenticate, walletAddr: adapterAddr } = useIdentity();
  const { push } = useTxTracker();

  // The effective address: prefer session store, fall back to adapter or context
  const effectiveAddr = walletAddr || adapterAddr || walletAddress;

  const [isIssuer, setIsIssuer] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Issuer profile fields (collected during registration)
  const [profileName, setProfileName] = useState('');
  const [profileOrg, setProfileOrg] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileCategories, setProfileCategories] = useState<string[]>(['Academic']);

  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState(1);
  const [payMethod, setPayMethod] = useState<'aleo' | 'usdcx'>('aleo');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && !isAuthed) {
      authenticate().catch(() => {});
    }
  }, [connected, isAuthed, authenticate]);

  // Check issuer status
  const checkIssuerStatus = async () => {
    // Ensure authenticated first
    let addr = effectiveAddr;
    if (!addr) {
      const ok = await authenticate();
      if (!ok) {
        setError('Please sign the authentication message in your wallet first.');
        return;
      }
      addr = useSessionStore.getState().walletAddr;
    }
    if (!addr) {
      setError('Could not determine wallet address. Please reconnect.');
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const { enrolled } = await checkAuthority(addr);
      setIsIssuer(enrolled);
    } catch {
      setError('Failed to check issuer status');
    } finally {
      setChecking(false);
    }
  };

  // Register as issuer — self-registration, any user can do this
  const registerAsIssuer = async () => {
    const addr = effectiveAddr || useSessionStore.getState().walletAddr;
    const sess = session || useSessionStore.getState().session;
    if (!connected || !addr || !sess) {
      setError('Please authenticate first.');
      return;
    }
    setRegistering(true);
    setError(null);
    try {
      // Find a credits record for the registration fee
      let recordPlaintext: string | null = null;
      try {
        const records = await requestRecords('credits.aleo');
        for (const r of (records || []) as any[]) {
          if (r.spent) continue;
          if (r.recordPlaintext) { recordPlaintext = r.recordPlaintext; break; }
          if (typeof r === 'string' && r.includes('microcredits')) { recordPlaintext = r; break; }
          const ct = r.ciphertext || r.recordCiphertext;
          if (ct && decrypt) {
            try { const pt = await decrypt(ct); if (pt && typeof pt === 'string') { recordPlaintext = pt; break; } } catch { /* try next */ }
          }
          if (r.owner || r.data?.microcredits) {
            let owner = String(r.owner || '');
            if (!owner.endsWith('.private')) owner += '.private';
            const mcRaw = String(r.data?.microcredits || r.microcredits || '0');
            const mcVal = mcRaw.match(/(\d[\d_]*)/)?.[1]?.replace(/_/g, '') || '0';
            let nonce = String(r.nonce || r._nonce || '0group.public');
            if (!nonce.includes('group')) nonce += 'group.public';
            recordPlaintext = `{\n  owner: ${owner},\n  microcredits: ${mcVal}u64.private,\n  _nonce: ${nonce}\n}`;
            break;
          }
        }
      } catch (e) {
        console.warn('[Register] Could not fetch credits records:', e);
      }

      if (!recordPlaintext) {
        throw new Error('No usable credits record found. You need ALEO credits to pay the registration fee (0.05 ALEO). Try shielding more credits in your Shield Wallet.');
      }

      const regFee = 50_000; // 0.05 ALEO registration fee in microcredits

      // Compute category bitfield from selected profile categories
      const categoryBitfield = profileCategories.reduce((bits, cat) => {
        const found = CATEGORIES.find(c => c.label.startsWith(cat));
        return bits | (found?.bit || 0);
      }, 0);

      // self_register_issuer — permissionless, any user can call this
      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: 'self_register_issuer',
        inputs: [recordPlaintext, `${regFee}u64`, `${categoryBitfield}field`],
        fee: BASE_FEE,
        privateFee: false,
      });

      const txId = result?.transactionId || result;
      push(String(txId), 'Register as Issuer');
      await enrollAuthority(addr, String(txId), sess, {
        displayName: profileName,
        organization: profileOrg,
        description: profileDesc,
        categories: profileCategories,
        website: profileWebsite,
      });
      setIsIssuer(true);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  // Submit certification
  const handleCertify = async () => {
    const addr = effectiveAddr || useSessionStore.getState().walletAddr;
    const sess = session || useSessionStore.getState().session;
    if (!connected || !file || !recipient || !sess || !addr) {
      setError('Please authenticate and fill all fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      // Ensure authenticated
      if (!isAuthed) await authenticate();

      // Hash the file
      const docHex = await hashFileToHex(file);
      const docCommitment = await computeDocCommitment(docHex);

      // Pre-flight: check if this document was already certified (backend DB check)
      try {
        const existingCerts = await fetchHolderCerts(addr, sess);
        const isDuplicate = existingCerts?.certifications?.some(
          (c: any) => c.commitment === docCommitment || c.docDigest === docCommitment
        );
        if (isDuplicate) {
          throw new Error(
            'This document has already been certified. Each document can only be certified once per issuer. Please select a different file.'
          );
        }
      } catch (dupErr: any) {
        if (dupErr?.message?.includes('already been certified')) throw dupErr;
        // Ignore other errors (backend might be down)
      }

      let txResult: any;
      const feeAmount = 100_000; // 0.1 ALEO in microcredits

      if (payMethod === 'aleo') {
        // Find a credits record in plaintext format
        let recordPlaintext: string | null = null;
        try {
          const records = await requestRecords('credits.aleo');
          for (const r of (records || []) as any[]) {
            if (r.spent) continue;

            // 1. Shield Wallet — use recordPlaintext directly
            if (r.recordPlaintext) {
              recordPlaintext = r.recordPlaintext;
              break;
            }

            // 2. If it's already a plaintext string
            if (typeof r === 'string' && r.includes('microcredits')) {
              recordPlaintext = r;
              break;
            }

            // 3. Try decrypting ciphertext
            const ct = r.ciphertext || r.recordCiphertext;
            if (ct && decrypt) {
              try {
                const pt = await decrypt(ct);
                if (pt && typeof pt === 'string') {
                  recordPlaintext = pt;
                  break;
                }
              } catch { /* try next */ }
            }

            // 4. Construct plaintext from fields (Leo Wallet format)
            if (r.owner || r.data?.microcredits) {
              let owner = String(r.owner || '');
              if (!owner.endsWith('.private')) owner += '.private';
              const mcRaw = String(r.data?.microcredits || r.microcredits || '0');
              const mcVal = mcRaw.match(/(\d[\d_]*)/)?.[1]?.replace(/_/g, '') || '0';
              let nonce = String(r.nonce || r._nonce || '0group.public');
              if (!nonce.includes('group')) nonce += 'group.public';
              recordPlaintext = `{\n  owner: ${owner},\n  microcredits: ${mcVal}u64.private,\n  _nonce: ${nonce}\n}`;
              break;
            }
          }
        } catch (e) {
          console.warn('[Certify] Could not fetch credits records:', e);
        }

        if (!recordPlaintext) {
          throw new Error('No usable credits record found. You need ALEO credits to pay the certification fee. Try shielding more credits in your Shield Wallet.');
        }

        // certify_document with ALEO payment
        txResult = await executeTransaction({
          program: PROGRAM_ID,
          function: 'certify_document',
          inputs: [
            recipient,            // holder (address)
            `${docCommitment}`,   // doc_hash (field)
            `${category}field`,   // category (field type in Leo)
            `0u64`,               // expires_at — 0 = no expiry (permanent document)
            recordPlaintext,      // pay_record — MUST be plaintext string
            `${feeAmount}u64`,    // fee_amount (u64)
          ],
          fee: BASE_FEE,
          privateFee: false,
        });
      } else {
        // certify_document_usdcx with USDCx payment
        const usdcxAmount = scaleUsdcx(1); // $1.00
        txResult = await executeTransaction({
          program: PROGRAM_ID,
          function: 'certify_document_usdcx',
          inputs: [
            recipient,
            `${docCommitment}`,
            `${category}field`,
            `0u64`,
            `${usdcxAmount}u128`,
          ],
          fee: BASE_FEE,
          privateFee: false,
        });
      }

      const txId = String(txResult?.transactionId || txResult);
      push(txId, `Certify: ${file.name}`);

      // Record in backend
      await stampDocument(
        {
          docDigest: docCommitment,
          recipient,
          tag: CATEGORIES.find((c) => c.value === category)?.label || 'Unknown',
          feeValue: feeAmount,
          payMethod,
          chainTxRef: txId,
        },
        sess
      );

      setResult(txId);
    } catch (e: any) {
      setError(e?.message || 'Certification failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth guard
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-inter font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-400 font-manrope">
          Connect your Shield Wallet to start certifying documents.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-inter font-bold text-white mb-2">Certify Document</h1>
        <p className="text-gray-400 font-manrope mb-6">
          Issue a privacy-preserving certification for any document on Aleo.
        </p>

        {/* Privacy banner */}
        <div className="mb-8 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🔒</span>
          <div>
            <p className="text-emerald-400 font-sora font-semibold text-sm mb-1">Your file never leaves your device</p>
            <p className="text-xs text-gray-400 font-manrope leading-relaxed">
              When you upload a document, only its cryptographic hash (SHA-256 → BHP256) is computed in your browser.
              The original file is never sent to our servers or the blockchain. Only a one-way commitment is stored on-chain as a boolean flag.
            </p>
          </div>
        </div>

        {/* Issuer check */}
        {isIssuer === null && !checking && (
          <GlassCard className="mb-8">
            <p className="text-gray-300 font-manrope mb-4">
              First, verify your issuer status on the protocol.
            </p>
            <ActionButton onClick={checkIssuerStatus} loading={checking}>
              Check Issuer Status
            </ActionButton>
          </GlassCard>
        )}

        {checking && <Spinner className="my-8" />}

        {isIssuer === false && (
          <GlassCard className="mb-8">
            <p className="text-yellow-400 font-manrope mb-2">
              You are not yet registered as an issuer on the protocol.
            </p>
            <p className="text-gray-400 font-manrope text-sm mb-6">
              Registration costs 0.05 ALEO (one-time fee). Fill in your issuer profile and select the categories you'll certify.
              Your allowed categories are enforced on-chain — you can only certify documents in selected categories.
            </p>

            <div className="space-y-4 mb-6">
              {/* Display name */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-1">Display Name *</label>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith" className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 font-manrope text-sm focus:outline-none focus:border-cs-primary/50" />
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-1">Organization *</label>
                <input type="text" value={profileOrg} onChange={e => setProfileOrg(e.target.value)}
                  placeholder="e.g. MIT, General Hospital, Acme Corp" className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 font-manrope text-sm focus:outline-none focus:border-cs-primary/50" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-1">Description</label>
                <textarea value={profileDesc} onChange={e => setProfileDesc(e.target.value)}
                  placeholder="Brief description of your issuing authority..."
                  rows={2} className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 font-manrope text-sm focus:outline-none focus:border-cs-primary/50 resize-none" />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-1">Website</label>
                <input type="url" value={profileWebsite} onChange={e => setProfileWebsite(e.target.value)}
                  placeholder="https://..." className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 font-manrope text-sm focus:outline-none focus:border-cs-primary/50" />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-2">Certification Categories *</label>
                <p className="text-xs text-gray-500 font-manrope mb-2">Select which types of documents you will certify. This is enforced on-chain.</p>
                <div className="flex flex-wrap gap-2">
                  {['Academic', 'Professional', 'Identity', 'Medical', 'Legal'].map(cat => (
                    <button key={cat} type="button"
                      onClick={() => setProfileCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      )}
                      className={`px-3 py-1.5 rounded-full text-xs font-manrope transition-all border ${
                        profileCategories.includes(cat)
                          ? 'bg-cs-primary/20 text-cs-primary border-cs-primary/40'
                          : 'bg-white/5 text-gray-400 border-cs-border/30 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ActionButton
              onClick={registerAsIssuer}
              loading={registering}
              disabled={!profileName || !profileOrg || profileCategories.length === 0}
            >
              Register as Issuer (0.05 ALEO)
            </ActionButton>
          </GlassCard>
        )}

        {(isIssuer === true) && (
          <GlassCard>
            <div className="space-y-6">
              {/* File upload */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-2">Document File</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cs-primary/20 file:text-cs-accent file:font-cabin file:cursor-pointer hover:file:bg-cs-primary/30"
                  />
                  {file && (
                    <p className="mt-2 text-xs text-gray-500 font-mono">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-2">Holder Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="aleo1..."
                  className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 font-mono text-sm focus:outline-none focus:border-cs-primary/50 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(Number(e.target.value))}
                  className="w-full bg-white/5 border border-cs-border/30 rounded-xl px-4 py-3 text-white font-manrope text-sm focus:outline-none focus:border-cs-primary/50 transition-colors appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-cs-deep">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-sm font-manrope text-gray-300 mb-2">Payment Method</label>
                <div className="flex gap-3">
                  {(['aleo', 'usdcx'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className={`flex-1 py-3 rounded-xl text-sm font-cabin font-semibold transition-all ${
                        payMethod === method
                          ? 'bg-cs-primary/20 border border-cs-primary text-white'
                          : 'bg-white/5 border border-cs-border/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {method === 'aleo' ? 'ALEO' : 'USDCx'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <ActionButton
                onClick={handleCertify}
                loading={submitting}
                disabled={!file || !recipient}
                className="w-full"
                size="lg"
              >
                Certify Document
              </ActionButton>

              {/* Results */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                  {error}
                </div>
              )}
              {result && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm font-manrope mb-1">Certification submitted!</p>
                  <p className="text-xs text-gray-400 font-mono break-all mb-2">{result}</p>
                  <p className="text-xs text-emerald-400/70 font-manrope">
                    🔒 Your document is NOT stored on any server. Only you and the holder have the encrypted certificate record in your wallets.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
