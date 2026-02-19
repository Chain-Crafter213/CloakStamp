import { create } from 'zustand';

export interface TrackedTx {
  id: string;
  label: string;
  status: 'pending' | 'confirmed' | 'failed';
  submittedAt: number;
  confirmedAt?: number;
  onChainId?: string; // Resolved at1... ID from shield_ temp ID
}

interface TxTrackerState {
  queue: TrackedTx[];
  push: (id: string, label: string) => void;
  markConfirmed: (id: string) => void;
  markFailed: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  pendingCount: () => number;
}

const POLL_INTERVAL = 5_000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

// Track poll attempts per tx
const pollAttempts = new Map<string, number>();

let pollingTimer: ReturnType<typeof setInterval> | null = null;

// We'll store a reference to the wallet's transactionStatus function
let _walletTransactionStatus: ((txId: string) => Promise<{ status: string }>) | null = null;

/** Call this from a component that has wallet context to provide the polling function */
export function setWalletTransactionStatus(
  fn: ((txId: string) => Promise<{ status: string }>) | null
) {
  _walletTransactionStatus = fn;
}

async function pollTransaction(txId: string): Promise<'confirmed' | 'pending' | 'failed'> {
  const attempts = (pollAttempts.get(txId) || 0) + 1;
  pollAttempts.set(txId, attempts);

  // Give up after max attempts
  if (attempts > MAX_POLL_ATTEMPTS) {
    pollAttempts.delete(txId);
    return 'failed';
  }

  // Shield wallet IDs start with "shield_" — use wallet adapter's transactionStatus
  if (txId.startsWith('shield_')) {
    if (_walletTransactionStatus) {
      try {
        const result = await _walletTransactionStatus(txId);
        console.log(`[TxTracker] Shield status for ${txId}:`, JSON.stringify(result));
        const s = (result?.status || '').toLowerCase();
        // Try to extract on-chain tx ID from the result
        const onChainId = (result as any)?.transactionId || (result as any)?.transaction_id;
        if (onChainId && typeof onChainId === 'string' && onChainId.startsWith('at1')) {
          // Store the resolved ID on the tx object
          const store = useTxTracker.getState();
          const tx = store.queue.find(t => t.id === txId);
          if (tx && !tx.onChainId) {
            useTxTracker.setState({
              queue: store.queue.map(t => t.id === txId ? { ...t, onChainId } : t)
            });
          }
          // Once we have the on-chain ID, verify against explorer for accepted/rejected
          try {
            const explorerResp = await fetch(
              `https://api.explorer.provable.com/v1/testnet/transaction/${onChainId}`
            );
            if (explorerResp.ok) {
              const explorerData = await explorerResp.json();
              const txType = explorerData?.type || '';
              // Aleo explorer: "execute" type with status in the response
              // "rejected" transactions still return 200 but have "status": "rejected"
              const explorerStatus = (explorerData?.status || txType || '').toLowerCase();
              console.log(`[TxTracker] Explorer status for ${onChainId}:`, explorerStatus);
              if (explorerStatus.includes('rejected') || explorerStatus.includes('aborted')) {
                return 'failed';
              }
              return 'confirmed';
            }
            // 404 = not yet indexed, fall through to Shield status
          } catch {
            // Explorer check failed, use Shield status
          }
        }
        // Shield statuses: Accepted, Rejected, Executed, Pending, etc.
        if (['accepted', 'confirmed', 'finalized', 'completed'].includes(s)) return 'confirmed';
        if (['failed', 'rejected', 'error', 'aborted'].includes(s)) return 'failed';
        // "executed" is ambiguous on Aleo (can be accepted OR rejected)
        // If we don't have the on-chain ID yet, treat as pending to allow explorer check next poll
        if (s === 'executed') {
          // After several attempts, assume confirmed if we can't verify
          return attempts > 6 ? 'confirmed' : 'pending';
        }
        return 'pending';
      } catch (err) {
        console.warn(`[TxTracker] Error polling ${txId}:`, err);
        return 'pending';
      }
    }
    // No wallet status function available yet — just wait, don't hit explorer
    return attempts > 12 ? 'confirmed' : 'pending';
  }

  // On-chain tx IDs (at1...) — poll the explorer API
  if (txId.startsWith('at1')) {
    try {
      const resp = await fetch(
        `https://api.explorer.provable.com/v1/testnet/transaction/${txId}`
      );
      if (resp.ok) return 'confirmed';
      if (resp.status === 404) return 'pending';
      return 'failed';
    } catch {
      return 'pending';
    }
  }

  // Unknown format — just mark as confirmed after a short wait
  return attempts > 3 ? 'confirmed' : 'pending';
}

function startPolling() {
  if (pollingTimer) return;
  pollingTimer = setInterval(async () => {
    // Always read fresh state — never use a stale closure
    const currentState = useTxTracker.getState();
    const pending = currentState.queue.filter((t) => t.status === 'pending');
    if (pending.length === 0) {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      return;
    }
    for (const tx of pending) {
      const result = await pollTransaction(tx.id);
      if (result === 'confirmed') {
        pollAttempts.delete(tx.id);
        useTxTracker.getState().markConfirmed(tx.id);
      } else if (result === 'failed') {
        pollAttempts.delete(tx.id);
        useTxTracker.getState().markFailed(tx.id);
      }
    }
  }, POLL_INTERVAL);
}

export const useTxTracker = create<TxTrackerState>()((set, get) => ({
  queue: [],

  push: (id, label) => {
    set((s) => ({
      queue: [...s.queue, { id, label, status: 'pending', submittedAt: Date.now() }],
    }));
    startPolling();
  },

  markConfirmed: (id) =>
    set((s) => ({
      queue: s.queue.map((t) =>
        t.id === id ? { ...t, status: 'confirmed', confirmedAt: Date.now() } : t
      ),
    })),

  markFailed: (id) =>
    set((s) => ({
      queue: s.queue.map((t) => (t.id === id ? { ...t, status: 'failed' } : t)),
    })),

  remove: (id) =>
    set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),

  clear: () => set({ queue: [] }),

  pendingCount: () => get().queue.filter((t) => t.status === 'pending').length,
}));
