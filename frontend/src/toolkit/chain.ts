const CHAIN_API = 'https://api.explorer.provable.com/v1/testnet';

// Parse decrypted record plaintext into field map
export function parseRecordFields(plaintext: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const pattern = /(\w+)\s*:\s*([^,}\n]+)/g;
  let match;
  while ((match = pattern.exec(plaintext)) !== null) {
    let value = match[2].trim();
    value = value.replace(/\.private$/, '').replace(/\.public$/, '');
    fields[match[1].trim()] = value;
  }
  return fields;
}

// Fetch encrypted record from block (Shield Wallet fix)
export async function fetchCiphertextFromBlock(
  blockHeight: number,
  programId: string,
  commitment: string
): Promise<{ ciphertext: string; transactionId: string } | null> {
  const endpoint = `${CHAIN_API}/block/${blockHeight}/transactions`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const blockTxs = await response.json();

    for (const tx of blockTxs) {
      const transitions = tx?.transaction?.execution?.transitions || [];
      for (const transition of transitions) {
        if (transition.program !== programId) continue;

        for (const output of transition.outputs || []) {
          if (output.type === 'record' && output.id === commitment) {
            return {
              ciphertext: output.value,
              transactionId: tx.id,
            };
          }
        }
      }
    }
  } catch (err) {
    console.error('[Chain] Block fetch failed:', err);
  }
  return null;
}

// Read an on-chain mapping value
export async function readOnChainMapping(
  programId: string,
  mappingName: string,
  key: string
): Promise<string | null> {
  const endpoint = `${CHAIN_API}/program/${programId}/mapping/${mappingName}/${key}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = await response.json();
    if (data === null || data === undefined || data === 'null') return null;

    if (typeof data === 'string') return data;
    return String(data);
  } catch {
    return null;
  }
}

// Find a credits record with sufficient balance
export async function locateCreditsRecord(
  wallet: any,
  minMicrocredits: number
): Promise<string | null> {
  try {
    const rawRecords = await wallet.requestRecords('credits.aleo');

    for (const r of rawRecords) {
      if (r.spent) continue;

      let mc = extractMicrocredits(r);
      let input = buildCreditsPlaintext(r);

      // If plaintext failed, try decrypting
      if (!input && wallet.decrypt) {
        const ct = r.ciphertext || r.recordCiphertext;
        if (ct) {
          try {
            input = await wallet.decrypt(ct);
            mc = extractMicrocredits({ plaintext: input });
          } catch { continue; }
        }
      }

      if (!input) continue;
      if (mc >= minMicrocredits) return input;
    }
  } catch (err) {
    console.error('[Chain] Credits record search failed:', err);
  }
  return null;
}

function extractMicrocredits(rec: Record<string, unknown>): number {
  // Try plaintext
  if (typeof rec.plaintext === 'string') {
    const match = (rec.plaintext as string).match(/microcredits\s*:\s*(\d[\d_]*)/);
    if (match) return parseInt(match[1].replace(/_/g, ''), 10);
  }

  // Try data field
  const data = rec.data as Record<string, unknown> | undefined;
  if (data?.microcredits) {
    const val = String(data.microcredits).replace(/u64|\.private|_/g, '');
    return parseInt(val, 10) || 0;
  }

  // Try root field
  if (rec.microcredits) {
    const val = String(rec.microcredits).replace(/u64|\.private|_/g, '');
    return parseInt(val, 10) || 0;
  }

  return 0;
}

function buildCreditsPlaintext(rec: Record<string, unknown>): string | null {
  try {
    // Already plaintext
    if (typeof rec.plaintext === 'string') return rec.plaintext as string;
    if (typeof rec.recordPlaintext === 'string') return rec.recordPlaintext as string;

    // Construct from parts
    let owner = rec.owner as string;
    if (!owner) return null;
    if (!owner.endsWith('.private')) owner += '.private';

    const data = rec.data as Record<string, unknown>;
    let mcRaw = String(data?.microcredits || rec.microcredits || '');
    const mcValue = mcRaw.match(/(\d[\d_]*)/)?.[1]?.replace(/_/g, '');
    if (!mcValue) return null;

    let nonce = String(rec.nonce || rec._nonce || '0group.public');
    if (!nonce.includes('group')) nonce += 'group.public';

    return `{\n  owner: ${owner},\n  microcredits: ${mcValue}u64.private,\n  _nonce: ${nonce}\n}`;
  } catch {
    return null;
  }
}

// Get record input for transaction (plaintext or ID)
export function getRecordInput(artifact: Record<string, unknown>): string | { id: string } | null {
  const raw = artifact._raw as Record<string, unknown> | undefined;

  if (raw?.id) return { id: raw.id as string };
  if (raw?.recordPlaintext) return raw.recordPlaintext as string;
  if (raw?.recordCiphertext) return raw.recordCiphertext as string;
  if (artifact._plaintext) return artifact._plaintext as string;

  return null;
}
