import { FC, ReactNode, useMemo } from 'react';
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { Network } from '@provablehq/aleo-types';
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css';

const PROGRAM_ID = import.meta.env.VITE_ALEO_PROGRAM_ID || 'cloakstamp_private_v1.aleo';

interface Props {
  children: ReactNode;
}

export const ChainProvider: FC<Props> = ({ children }) => {
  const adapters = useMemo(() => [
    new ShieldWalletAdapter(),
    new LeoWalletAdapter({ appName: 'CloakStamp' }),
  ], []);

  return (
    <AleoWalletProvider
      wallets={adapters}
      decryptPermission={DecryptPermission.AutoDecrypt}
      programs={[PROGRAM_ID, 'credits.aleo', 'test_usdcx_stablecoin.aleo']}
      network={Network.TESTNET}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
};
