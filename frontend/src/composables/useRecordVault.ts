import { useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { parseRecordFields, fetchCiphertextFromBlock } from '../toolkit/chain';

const PROGRAM_ID = import.meta.env.VITE_ALEO_PROGRAM_ID || 'cloakstamp_private_v2.aleo';

export interface DecodedRecord {
  type: string;
  fields: Record<string, string>;
  _raw: Record<string, unknown>;
  _plaintext?: string;
}

function extractField(rec: Record<string, unknown>, fieldName: string): string {
  // Strategy 1: Direct data field (Leo Wallet)
  const data = rec.data as Record<string, string> | undefined;
  if (data?.[fieldName]) {
    return String(data[fieldName]).replace(/\.private$|\.public$/g, '');
  }
  // Strategy 2: Root-level field
  if (rec[fieldName]) {
    return String(rec[fieldName]).replace(/\.private$|\.public$/g, '');
  }
  return '';
}

function classifyRecord(rec: Record<string, unknown>, fields: Record<string, string>): string {
  // Check recordName from Leo Wallet
  if (rec.recordName === 'CertifiedDocument') return 'CertifiedDocument';
  if (rec.recordName === 'VerificationReceipt') return 'VerificationReceipt';
  if (rec.recordName === 'HolderReceipt') return 'HolderReceipt';
  if (rec.recordName === 'IssuerLicense') return 'IssuerLicense';
  if (rec.recordName === 'PaymentReceipt') return 'PaymentReceipt';

  // Check by field presence — most specific first
  if (fields.doc_commitment && fields.holder_commitment) return 'VerificationReceipt';
  if (fields.doc_hash && fields.category && fields.expires_at) return 'CertifiedDocument';
  if (fields.doc_hash && fields.fee_paid) return 'HolderReceipt';
  if (fields.license_commitment) return 'IssuerLicense';
  if (fields.amount && fields.purpose_hash) return 'PaymentReceipt';

  // Check functionName from Shield Wallet
  const fn = rec.functionName as string;
  if (fn === 'certify_document' || fn === 'certify_document_usdcx') {
    if (fields.doc_commitment) return 'VerificationReceipt';
    if (fields.fee_paid) return 'HolderReceipt';
    return 'CertifiedDocument';
  }
  if (fn === 'prove_document') return 'VerificationReceipt';
  if (fn === 'register_issuer' || fn === 'self_register_issuer') return 'IssuerLicense';

  return 'unknown';
}

export function useRecordVault() {
  const wallet = useWallet();

  const fetchAllRecords = useCallback(async (): Promise<DecodedRecord[]> => {
    if (!wallet.connected) return [];

    try {
      const rawRecords = await (wallet as any).requestRecords(PROGRAM_ID, true);
      const results: DecodedRecord[] = [];

      for (const rec of rawRecords) {
        if (rec.spent) continue;

        let fields: Record<string, string> = {};

        // === Strategy 1: Direct field extraction (Leo Wallet) ===
        fields = {
          doc_hash: extractField(rec, 'doc_hash'),
          issuer: extractField(rec, 'issuer'),
          category: extractField(rec, 'category'),
          expires_at: extractField(rec, 'expires_at'),
          doc_commitment: extractField(rec, 'doc_commitment'),
          holder_commitment: extractField(rec, 'holder_commitment'),
          verified_at: extractField(rec, 'verified_at'),
          fee_paid: extractField(rec, 'fee_paid'),
          license_commitment: extractField(rec, 'license_commitment'),
          amount: extractField(rec, 'amount'),
          purpose_hash: extractField(rec, 'purpose_hash'),
          nonce_seed: extractField(rec, 'nonce_seed'),
        };

        const hasData = Object.values(fields).some(v => v !== '');

        // === Strategy 2: Inline ciphertext decrypt ===
        if (!hasData && rec.ciphertext && typeof (wallet as any).decrypt === 'function') {
          try {
            const decrypted = await (wallet as any).decrypt(rec.ciphertext);
            const parsed = parseRecordFields(decrypted);
            fields = { ...fields, ...parsed };
          } catch { /* continue to strategy 3 */ }
        }

        // === Strategy 3: Aleo API + wallet.decrypt (Shield Wallet) ===
        if (!Object.values(fields).some(v => v !== '') && rec.blockHeight && rec.commitment && typeof (wallet as any).decrypt === 'function') {
          try {
            const result = await fetchCiphertextFromBlock(
              rec.blockHeight,
              PROGRAM_ID,
              rec.commitment
            );
            if (result?.ciphertext) {
              const decrypted = await (wallet as any).decrypt(result.ciphertext);
              const parsed = parseRecordFields(decrypted);
              fields = { ...fields, ...parsed };
            }
          } catch { /* skip record */ }
        }

        const recordType = classifyRecord(rec, fields);

        results.push({
          type: recordType,
          fields,
          _raw: rec,
          _plaintext: rec.plaintext || rec.recordPlaintext || undefined,
        });
      }

      return results;
    } catch (err) {
      console.error('[RecordVault] Fetch failed:', err);
      return [];
    }
  }, [wallet]);

  return { fetchAllRecords };
}
