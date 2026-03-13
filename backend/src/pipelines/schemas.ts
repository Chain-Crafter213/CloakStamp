import { z } from 'zod';

const aleoAddr = z.string().regex(/^aleo1[a-z0-9]{58}$/, 'Invalid Aleo address');
const chainRef = z.string().min(1, 'Transaction reference required');

const VALID_CATEGORIES = ['Academic', 'Professional', 'Identity', 'Medical', 'Legal'] as const;

export const enrollAuthoritySchema = z.object({
  authority: aleoAddr,
  chainTxRef: chainRef,
  displayName: z.string().min(1).max(100).optional(),
  organization: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  categories: z.array(z.enum(VALID_CATEGORIES)).min(1).optional(),
  website: z.string().url().max(200).optional().or(z.literal('')),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  organization: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  categories: z.array(z.enum(VALID_CATEGORIES)).min(1),
  website: z.string().url().max(200).optional().or(z.literal('')),
});

export const stampDocumentSchema = z.object({
  docDigest: z.string().min(1, 'Document digest required'),
  recipient: aleoAddr,
  tag: z.string().min(1, 'Category tag required').max(100),
  expiryBlock: z.number().int().min(0).optional().default(0),
  feeValue: z.number().positive('Fee must be positive'),
  payMethod: z.enum(['aleo', 'usdcx']).default('aleo'),
  chainTxRef: chainRef,
});

export const proveOwnershipSchema = z.object({
  docCommitment: z.string().min(1),
  inspector: aleoAddr,
  chainTxRef: chainRef,
});

export const revokeStampSchema = z.object({
  docDigest: z.string().min(1),
  chainTxRef: chainRef,
});

export const recordProofSchema = z.object({
  docCommitment: z.string().min(1),
  recipientHash: z.string().min(1),
  chainTxRef: chainRef,
});

export const challengeRequestSchema = z.object({
  address: aleoAddr,
});

export const challengeResponseSchema = z.object({
  address: aleoAddr,
  signedPayload: z.string().min(1),
  token: z.string().min(1),
});
