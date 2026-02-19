import type { ProtocolMetrics, ProtocolFees, CertificationRecord, ProofRecord, DocStatus } from './interfaces';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function headers(session?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session) h['Authorization'] = `Bearer ${session}`;
  return h;
}

// Identity
export async function requestChallenge(address: string): Promise<{ token: string; challenge: string }> {
  const resp = await fetch(`${API_BASE}/identity/challenge`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ address }),
  });
  return resp.json();
}

export async function confirmIdentity(
  address: string,
  signedPayload: string,
  token: string
): Promise<{ success: boolean; session: string; address: string }> {
  const resp = await fetch(`${API_BASE}/identity/confirm`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ address, signedPayload, token }),
  });
  return resp.json();
}

// Protocol
export async function fetchProtocolMetrics(): Promise<ProtocolMetrics> {
  const resp = await fetch(`${API_BASE}/protocol/metrics`);
  return resp.json();
}

export async function fetchProtocolFees(): Promise<ProtocolFees> {
  const resp = await fetch(`${API_BASE}/protocol/fees`);
  return resp.json();
}

// Authorities
export async function enrollAuthority(
  authority: string,
  chainTxRef: string,
  session: string
): Promise<{ success: boolean; authorityHash: string }> {
  const resp = await fetch(`${API_BASE}/authorities/enroll`, {
    method: 'POST',
    headers: headers(session),
    body: JSON.stringify({ authority, chainTxRef }),
  });
  return resp.json();
}

export async function checkAuthority(address: string): Promise<{ enrolled: boolean; state: string | null }> {
  const resp = await fetch(`${API_BASE}/authorities/check/${address}`);
  return resp.json();
}

export async function fetchAuthorityCount(): Promise<{ total: number }> {
  const resp = await fetch(`${API_BASE}/authorities/count`);
  return resp.json();
}

// Certifications
export async function stampDocument(
  data: {
    docDigest: string;
    recipient: string;
    tag: string;
    expiryBlock?: number;
    feeValue: number;
    payMethod: 'aleo' | 'usdcx';
    chainTxRef: string;
  },
  session: string
): Promise<{ success: boolean; certId: string }> {
  const resp = await fetch(`${API_BASE}/certifications/stamp`, {
    method: 'POST',
    headers: headers(session),
    body: JSON.stringify(data),
  });
  return resp.json();
}

export async function revokeCertification(
  docDigest: string,
  chainTxRef: string,
  session: string
): Promise<{ success: boolean; certId: string }> {
  const resp = await fetch(`${API_BASE}/certifications/revoke`, {
    method: 'POST',
    headers: headers(session),
    body: JSON.stringify({ docDigest, chainTxRef }),
  });
  return resp.json();
}

export async function fetchHolderCerts(address: string, session: string): Promise<{ certifications: CertificationRecord[] }> {
  const resp = await fetch(`${API_BASE}/certifications/holder/${address}`, {
    headers: headers(session),
  });
  return resp.json();
}

export async function checkDocStatus(commitment: string): Promise<DocStatus> {
  const resp = await fetch(`${API_BASE}/certifications/status/${commitment}`);
  return resp.json();
}

// Proofs
export async function submitProof(
  data: { docCommitment: string; inspector: string; chainTxRef: string },
  session: string
): Promise<{ success: boolean; proofId: string }> {
  const resp = await fetch(`${API_BASE}/proofs/submit`, {
    method: 'POST',
    headers: headers(session),
    body: JSON.stringify(data),
  });
  return resp.json();
}

export async function fetchInspectorProofs(address: string, session: string): Promise<{ proofEntries: ProofRecord[] }> {
  const resp = await fetch(`${API_BASE}/proofs/inspector/${address}`, {
    headers: headers(session),
  });
  return resp.json();
}

export async function validateProof(commitment: string): Promise<{ certified: boolean; revoked: boolean; valid: boolean }> {
  const resp = await fetch(`${API_BASE}/proofs/validate/${commitment}`);
  return resp.json();
}

// Digest (BHP256)
export async function computeDigest(fieldValue: string): Promise<{ input: string; commitment: string } | null> {
  try {
    const resp = await fetch(`${API_BASE}/digest/compute/${fieldValue}`);
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}
