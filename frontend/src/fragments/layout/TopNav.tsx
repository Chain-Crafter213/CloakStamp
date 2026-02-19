import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { useSessionStore } from '../../state/sessionStore';
import { useIdentity } from '../../composables/useIdentity';
import ActionButton from '../shared/ActionButton';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/certify', label: 'Certify' },
  { to: '/documents', label: 'My Docs' },
  { to: '/prove', label: 'Prove' },
  { to: '/verify', label: 'Verify' },
];

export default function TopNav() {
  const location = useLocation();
  const { connected, disconnect } = useWallet();
  const { isAuthed, signOut, walletAddr } = useSessionStore();
  const { authenticate } = useIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleDisconnect = async () => {
    signOut();
    localStorage.removeItem('cs_session');
    await disconnect();
  };

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      const ok = await authenticate();
      if (!ok) {
        console.warn('[TopNav] Sign-in returned false — wallet may not be ready');
      }
    } catch (err) {
      console.error('[TopNav] Sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const truncAddr = walletAddr
    ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`
    : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-cs-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-6 w-6" />
            <span className="font-inter font-bold text-lg text-white">
              CloakStamp
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-manrope transition-colors ${
                    active ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-cs-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {connected && isAuthed && walletAddr ? (
              /* State 3: Connected + Authenticated — show address + disconnect */
              <>
                <span className="hidden sm:block text-xs text-cs-accent font-mono bg-white/5 px-3 py-1 rounded-lg">
                  {truncAddr}
                </span>
                <ActionButton
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </ActionButton>
              </>
            ) : connected ? (
              /* State 2: Connected but not authenticated — show sign-in */
              <>
                <ActionButton
                  size="sm"
                  variant="primary"
                  onClick={handleSignIn}
                  loading={signingIn}
                >
                  {signingIn ? 'Signing In…' : 'Sign In'}
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </ActionButton>
              </>
            ) : (
              /* State 1: Not connected — show wallet modal button */
              <WalletMultiButton className="!bg-cs-primary hover:!bg-cs-primary/80 !rounded-xl !h-9 !text-sm !font-cabin" />
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-cs-border/20"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-manrope ${
                    location.pathname === link.to
                      ? 'text-white bg-cs-primary/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
