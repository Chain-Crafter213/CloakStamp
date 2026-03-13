// CloakStamp — frontend interface definitions

export interface ProtocolMetrics {
  totalStamped: number;
  totalProved: number;
  enrolledAuthorities: number;
  localCertifications: number;
  localProofs: number;
}

export interface ProtocolFees {
  issuanceFee: number;
  verificationFee: number;
}

export interface CertificationRecord {
  id: string;
  uid: string;
  tag: string;
  state: string;
  revoked: boolean;
  stampedAt: string;
  expiryBlock: number;
  docDigest: string;
  issuer: string;
  payMethod: string;
  chainTxRef?: string;
}

export interface ProofRecord {
  uid: string;
  docCommitment: string;
  stampedAt: string;
}

export interface DocStatus {
  exists: boolean;
  revoked: boolean;
  valid: boolean;
  tag?: string;
  stampedAt?: string;
  chainTxRef?: string;
  chainConfirmed?: boolean;
}

export interface IssuerProfile {
  hashedAddr: string;
  displayName: string;
  organization: string;
  description: string;
  categories: string[];
  website: string;
  enrolledAt: string;
  chainTxRef: string;
}

export type WalletExecutor = {
  executeTransaction: (params: {
    program: string;
    function: string;
    inputs: string[];
    fee: number;
    privateFee: boolean;
  }) => Promise<{ transactionId: string }>;
};
