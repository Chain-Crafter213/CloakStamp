import { useCallback, useRef } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { useSessionStore } from '../state/sessionStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Module-level lock to prevent double auth from React StrictMode
let _authPending: Promise<boolean> | null = null;

export function useIdentity() {
  const wallet = useWallet();
  const { signIn } = useSessionStore();

  // address is a top-level property on WalletContextState
  const walletAddr = wallet.address ?? null;

  const tokenRef = useRef<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('cs_session') : null
  );

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!wallet.connected || !walletAddr) {
      console.warn('[Identity] Cannot authenticate — connected:', wallet.connected, 'addr:', walletAddr);
      return false;
    }

    // If we already have a session token, sync the store and return
    if (tokenRef.current) {
      signIn(walletAddr, tokenRef.current);
      return true;
    }

    // Prevent concurrent auth calls
    if (_authPending) return _authPending;

    _authPending = (async () => {
      try {
        // Step 1: Request challenge
        const chalResp = await fetch(`${API_BASE}/identity/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddr }),
        });
        const { token, challenge } = await chalResp.json();

        // Step 2: Sign with wallet
        const encoded = new TextEncoder().encode(challenge);
        const signResult = await wallet.signMessage(encoded);

        let signedPayload: string;
        if (typeof signResult === 'string') {
          signedPayload = signResult;
        } else if (signResult instanceof Uint8Array) {
          signedPayload = btoa(String.fromCharCode(...signResult));
        } else if (typeof signResult === 'object' && signResult !== null && 'signature' in signResult) {
          const sig = (signResult as Record<string, unknown>).signature;
          if (sig instanceof Uint8Array) {
            signedPayload = btoa(String.fromCharCode(...sig));
          } else {
            signedPayload = String(sig);
          }
        } else {
          signedPayload = JSON.stringify(signResult);
        }

        // Step 3: Confirm identity
        const confirmResp = await fetch(`${API_BASE}/identity/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddr, signedPayload, token }),
        });
        const result = await confirmResp.json();

        if (result.session) {
          tokenRef.current = result.session;
          localStorage.setItem('cs_session', result.session);
          signIn(walletAddr!, result.session);
          return true;
        }
        return false;
      } catch (err) {
        console.error('[Identity] Auth failed:', err);
        return false;
      }
    })();

    try {
      return await _authPending;
    } finally {
      _authPending = null;
    }
  }, [wallet, walletAddr, signIn]);

  const logout = useCallback(() => {
    tokenRef.current = null;
    localStorage.removeItem('cs_session');
  }, []);

  const getSession = useCallback(() => tokenRef.current, []);

  return {
    wallet,
    walletAddr,
    isConnected: wallet.connected,
    authenticate,
    logout,
    getSession,
  };
}
