/**
 * Client-side BHP256 digest computation.
 * Uses @provablehq/sdk WASM when available, falls back to backend /digest/compute endpoint.
 */

let wasmAccount: any = null;
let wasmReady = false;

async function bootWasm(): Promise<boolean> {
  if (wasmReady) return true;
  try {
    const sdk = await import('@provablehq/sdk');
    await sdk.initializeWasm?.();
    wasmAccount = sdk.Account;
    wasmReady = true;
    return true;
  } catch {
    console.warn('[CloakStamp] WASM BHP256 unavailable, using backend fallback');
    return false;
  }
}

/**
 * Hash a single field element (e.g. "123field") into a BHP256 commitment.
 * Attempts local WASM first, then backend fallback.
 */
export async function digestField(input: string): Promise<string> {
  // Try WASM
  const hasWasm = await bootWasm();
  if (hasWasm && wasmAccount) {
    try {
      // Use Aleo SDK to hash
      const sdk = await import('@provablehq/sdk');
      const hashFn = (sdk as any).hashBhp256 ?? (sdk as any).default?.hashBhp256;
      if (typeof hashFn === 'function') {
        return hashFn(input);
      }
    } catch {
      // fall through to backend
    }
  }

  // Backend fallback
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const resp = await fetch(`${API_BASE}/digest/compute/${encodeURIComponent(input)}`);
  if (!resp.ok) throw new Error('Failed to compute BHP256 digest');
  const data = await resp.json();
  return data.commitment;
}

/**
 * Compute on-chain–style document commitment from raw doc hash string.
 * Converts string to field element, then applies BHP256.
 */
export async function computeDocCommitment(docHashHex: string): Promise<string> {
  // Convert hex string to a field-compatible numeric string
  const numeric = BigInt('0x' + docHashHex.replace(/^0x/, '').slice(0, 60));
  return digestField(`${numeric}field`);
}

/**
 * Hash a raw file to hex string (SHA-256), suitable for on-chain commitment.
 */
export async function hashFileToHex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
