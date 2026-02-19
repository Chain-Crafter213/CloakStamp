/**
 * USDCx stablecoin utilities for CloakStamp.
 * Handles MerkleProof construction, record discovery, and amount scaling.
 *
 * CRITICAL: leaf_index must be 1u32 (NOT 0u32) for test_usdcx_stablecoin.aleo
 * CRITICAL: USDCx amounts are u128 (not u64)
 */

import type { WalletExecutor } from './interfaces';

const USDCX_PROGRAM = 'test_usdcx_stablecoin.aleo';
const USDCX_DECIMALS = 6;

/** Scale a human-readable dollar amount to USDCx micro-units (u128). */
export function scaleUsdcx(humanAmount: number): bigint {
  return BigInt(Math.round(humanAmount * 10 ** USDCX_DECIMALS));
}

/** Format USDCx micro-units back to human-readable dollars. */
export function formatUsdcx(microAmount: bigint | string): string {
  const raw = typeof microAmount === 'string' ? BigInt(microAmount.replace('u128', '')) : microAmount;
  const whole = raw / BigInt(10 ** USDCX_DECIMALS);
  const frac = raw % BigInt(10 ** USDCX_DECIMALS);
  const fracStr = frac.toString().padStart(USDCX_DECIMALS, '0').replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

/**
 * Build a default MerkleProof for USDCx transfer_private.
 * Uses leaf_index = 1u32 as per test_usdcx_stablecoin requirements.
 */
export function buildDefaultMerkleProof(): string {
  // MerkleProof { leaf_index: 1u32, sibling_path: [ 0field, 0field, 0field, 0field ] }
  return JSON.stringify({
    leaf_index: '1u32',
    sibling_path: ['0field', '0field', '0field', '0field'],
  });
}

/**
 * Execute a USDCx transfer_private via Shield Wallet.
 * Transfers USDCx from sender to the program's escrow address for fee payment.
 */
export async function transferUsdcxPrivate(
  executor: WalletExecutor,
  recipientAddress: string,
  amountMicro: bigint,
  usdcxRecordPlaintext: string,
): Promise<string> {
  const merkleProof = buildDefaultMerkleProof();

  const result = await executor.executeTransaction({
    program: USDCX_PROGRAM,
    function: 'transfer_private',
    inputs: [usdcxRecordPlaintext, recipientAddress, `${amountMicro}u128`, merkleProof],
    fee: 0,
    privateFee: false, // MANDATORY for Shield Wallet
  });
  const txId = result.transactionId;

  return txId;
}

/**
 * Find USDCx records in a set of decrypted records.
 * Looks for records from test_usdcx_stablecoin.aleo with sufficient balance.
 */
export function findUsdcxRecord(
  records: Array<{ plaintext: string; programId?: string; functionName?: string }>,
  requiredAmount: bigint,
): { plaintext: string; balance: bigint } | null {
  for (const rec of records) {
    if (rec.programId !== USDCX_PROGRAM) continue;

    // Parse amount from plaintext
    const amountMatch = rec.plaintext.match(/amount\s*:\s*(\d+)u128/);
    if (!amountMatch) continue;

    const balance = BigInt(amountMatch[1]);
    if (balance >= requiredAmount) {
      return { plaintext: rec.plaintext, balance };
    }
  }
  return null;
}

export { USDCX_PROGRAM, USDCX_DECIMALS };
