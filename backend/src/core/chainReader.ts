const CHAIN_API = process.env.PROVABLE_API_BASE || 'https://api.explorer.provable.com/v1/testnet';
const CONTRACT_ID = process.env.ALEO_PROGRAM_ID || 'cloakstamp_private_v3.aleo';

export async function readMapping(
  mappingName: string,
  key: string,
  programId?: string
): Promise<string | null> {
  const pid = programId || CONTRACT_ID;
  const endpoint = `${CHAIN_API}/program/${pid}/mapping/${mappingName}/${key}`;

  try {
    const resp = await fetch(endpoint);
    if (!resp.ok) return null;

    const payload = await resp.json();
    if (payload === null || payload === undefined || payload === 'null') return null;

    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object' && 'value' in payload) return String(payload.value);
    return String(payload);
  } catch {
    return null;
  }
}

export async function confirmTransaction(txRef: string): Promise<boolean> {
  // Shield wallet temp IDs cannot be confirmed on-chain
  if (txRef.startsWith('shield_')) return false;

  const endpoint = `${CHAIN_API}/transaction/${txRef}`;
  try {
    const resp = await fetch(endpoint);
    if (!resp.ok) return false;

    const payload = (await resp.json()) as Record<string, unknown>;
    return payload.status === 'accepted' || payload.type === 'execute' || !!payload.execution;
  } catch {
    return false;
  }
}

export async function fetchBlockRecords(height: number): Promise<unknown[]> {
  const endpoint = `${CHAIN_API}/block/${height}/transactions`;
  try {
    const resp = await fetch(endpoint);
    if (!resp.ok) return [];
    return (await resp.json()) as unknown[];
  } catch {
    return [];
  }
}

export async function gatherProtocolMetrics(): Promise<{
  totalStamped: number;
  totalProved: number;
  enrolledAuthorities: number;
}> {
  const [stampRaw, proveRaw] = await Promise.all([
    readMapping('total_certifications', '0u8'),
    readMapping('total_verifications', '0u8'),
  ]);

  const extractNum = (raw: string | null): number => {
    if (!raw) return 0;
    const cleaned = raw.replace(/u64|u128|"/g, '').trim();
    return parseInt(cleaned, 10) || 0;
  };

  return {
    totalStamped: extractNum(stampRaw),
    totalProved: extractNum(proveRaw),
    enrolledAuthorities: 0,
  };
}
