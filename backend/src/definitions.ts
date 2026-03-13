// CloakStamp — core type definitions for the certification protocol

export interface CertAuthority {
  hashedAddr: string;
  state: 'pending' | 'active' | 'revoked';
  enrolledAt: string;
  chainTxRef: string;
}

export interface Certification {
  uid: string;
  commitment: string;
  authorityHash: string;
  recipientHash: string;
  tag: string;
  state: 'active' | 'revoked';
  chainTxRef: string;
  stampedAt: string;
  expiryBlock: number;
}

export interface ProofEntry {
  uid: string;
  docCommitment: string;
  inspectorHash: string;
  recipientHash: string;
  chainTxRef: string;
  stampedAt: string;
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

export interface AuditEntry {
  uid: string;
  kind: 'authority_enrolled' | 'doc_certified' | 'doc_revoked' | 'doc_proved' | 'proof_recorded';
  actorHash: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface Datastore {
  authorities: Record<string, CertAuthority>;
  issuerProfiles: Record<string, IssuerProfile>;
  certifications: Record<string, Certification>;
  proofEntries: Record<string, ProofEntry>;
  challengeTokens: Record<string, string>;
  auditLog: AuditEntry[];
}

export interface TokenClaims {
  address: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      walletAddr?: string;
    }
  }
}
