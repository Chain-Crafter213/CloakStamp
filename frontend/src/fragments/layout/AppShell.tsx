import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import TopNav from './TopNav';
import SiteFooter from './SiteFooter';
import { useTxTracker, setWalletTransactionStatus } from '../../state/txTracker';
import { AnimatePresence, motion } from 'framer-motion';

function TxToast({ tx, onDismiss }: { tx: import('../../state/txTracker').TrackedTx; onDismiss: () => void }) {
  const isPending = tx.status === 'pending';
  const isConfirmed = tx.status === 'confirmed';
  const isFailed = tx.status === 'failed';

  // Auto-dismiss confirmed/failed after 6s
  useEffect(() => {
    if (!isPending) {
      const t = setTimeout(onDismiss, 6_000);
      return () => clearTimeout(t);
    }
  }, [isPending, onDismiss]);

  const borderColor = isPending
    ? 'border-cs-primary/50'
    : isConfirmed
    ? 'border-green-500/50'
    : 'border-red-500/50';

  const bgColor = isPending
    ? 'bg-cs-deep/95'
    : isConfirmed
    ? 'bg-green-950/95'
    : 'bg-red-950/95';

  const dotColor = isPending
    ? 'bg-cs-primary animate-pulse'
    : isConfirmed
    ? 'bg-green-400'
    : 'bg-red-400';

  const statusText = isPending
    ? 'Pending...'
    : isConfirmed
    ? 'Confirmed'
    : 'Failed';

  const displayId = tx.onChainId || tx.id;
  const truncId = displayId.length > 20
    ? `${displayId.slice(0, 10)}...${displayId.slice(-6)}`
    : displayId;

  const explorerUrl = displayId.startsWith('at1')
    ? `https://explorer.provable.com/transaction/${displayId}`
    : null;

  return (
    <motion.div
      layout
      initial={{ x: 360, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 360, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`pointer-events-auto w-80 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-xl shadow-2xl shadow-black/40 p-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-sm font-cabin font-semibold text-white truncate">
            {tx.label}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-white transition-colors text-xs shrink-0"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cs-accent/70 font-mono truncate hover:text-cs-accent transition-colors"
          >
            {truncId} ↗
          </a>
        ) : (
          <span className="text-xs text-gray-500 font-mono truncate">{truncId}</span>
        )}
        <span className={`text-xs font-manrope font-semibold ml-2 shrink-0 ${
          isPending ? 'text-cs-accent' : isConfirmed ? 'text-green-400' : 'text-red-400'
        }`}>
          {statusText}
        </span>
      </div>
    </motion.div>
  );
}

export default function AppShell() {
  const queue = useTxTracker((s) => s.queue);
  const remove = useTxTracker((s) => s.remove);
  const { transactionStatus } = useWallet();

  // Provide the wallet's transactionStatus to the polling system
  useEffect(() => {
    setWalletTransactionStatus(transactionStatus as any);
    return () => setWalletTransactionStatus(null);
  }, [transactionStatus]);

  // Show the latest 4 transactions
  const visible = queue.slice(-4);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopNav />

      {/* Toast stack — bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {visible.map((tx) => (
            <TxToast key={tx.id} tx={tx} onDismiss={() => remove(tx.id)} />
          ))}
        </AnimatePresence>
      </div>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
