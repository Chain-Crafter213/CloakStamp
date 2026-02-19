import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getStore } from '../core/storage';
import { readMapping, confirmTransaction } from '../core/chainReader';
import { guardian } from '../shield/guardian';
import { stampDocumentSchema, revokeStampSchema } from '../pipelines/schemas';

const router = Router();

function obscureAddr(addr: string): string {
  return createHash('sha256').update(addr).digest('hex');
}

// POST /certifications/stamp — record a new certification
router.post('/stamp', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = stampDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { docDigest, recipient, tag, expiryBlock, feeValue, payMethod, chainTxRef } = parsed.data;
    const issuerHash = obscureAddr(req.walletAddr || '');
    const recipientHash = obscureAddr(recipient);
    const certId = uuid();

    // Use docDigest as commitment key (matches on-chain BHP256 pattern)
    const store = await getStore();

    // Prevent duplicate: same commitment + same issuer = already certified
    const existingCerts = Object.values(store.data.certifications);
    const isDuplicate = existingCerts.some(
      c => c.commitment === docDigest && c.authorityHash === issuerHash
    );
    if (isDuplicate) {
      res.status(409).json({ error: 'This document has already been certified by this issuer.' });
      return;
    }

    store.data.certifications[certId] = {
      uid: certId,
      commitment: docDigest,
      authorityHash: issuerHash,
      recipientHash: recipientHash,
      tag,
      state: 'active',
      chainTxRef,
      stampedAt: new Date().toISOString(),
      expiryBlock: expiryBlock || 0,
    };

    store.data.auditLog.push({
      uid: uuid(),
      kind: 'doc_certified',
      actorHash: issuerHash,
      payload: { certId, tag, payMethod, feeValue, chainTxRef },
      occurredAt: new Date().toISOString(),
    });

    await store.write();

    res.json({ success: true, certId });
  } catch (err) {
    console.error('[Certifications] Stamp failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /certifications/revoke — record a revocation
router.post('/revoke', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = revokeStampSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { docDigest, chainTxRef } = parsed.data;
    const issuerHash = obscureAddr(req.walletAddr || '');
    const store = await getStore();

    // Find and revoke matching certification
    const entries = Object.values(store.data.certifications);
    const target = entries.find(c => c.commitment === docDigest && c.authorityHash === issuerHash);

    if (!target) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    if (target.state === 'revoked') {
      res.status(409).json({ error: 'Already revoked' });
      return;
    }

    target.state = 'revoked';

    store.data.auditLog.push({
      uid: uuid(),
      kind: 'doc_revoked',
      actorHash: issuerHash,
      payload: { certId: target.uid, chainTxRef },
      occurredAt: new Date().toISOString(),
    });

    await store.write();

    res.json({ success: true, certId: target.uid });
  } catch (err) {
    console.error('[Certifications] Revoke failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /certifications/holder/:address — get certifications for a holder
router.get('/holder/:address', guardian, async (req: Request, res: Response) => {
  try {
    const recipientHash = obscureAddr(req.params.address);
    const store = await getStore();

    const matches = Object.values(store.data.certifications)
      .filter(c => c.recipientHash === recipientHash)
      .map(c => ({
        id: c.uid,
        uid: c.uid,
        tag: c.tag,
        state: c.state,
        revoked: c.state === 'revoked',
        stampedAt: c.stampedAt,
        expiryBlock: c.expiryBlock,
        docDigest: c.commitment,
        issuer: c.authorityHash,
        payMethod: 'aleo',
        chainTxRef: c.chainTxRef,
      }));

    res.json({ certifications: matches });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /certifications/status/:commitment — check document status by doc_hash commitment
// Looks up in backend DB first (reliable), then optionally validates chain tx
router.get('/status/:commitment', async (req: Request, res: Response) => {
  try {
    const { commitment } = req.params;
    const store = await getStore();

    // Search backend DB by commitment (doc_hash)
    const allCerts = Object.values(store.data.certifications);
    const matches = allCerts.filter(c => c.commitment === commitment);

    if (matches.length === 0) {
      res.json({ exists: false, revoked: false, valid: false });
      return;
    }

    // Use the most recent matching cert
    const cert = matches.sort((a, b) =>
      new Date(b.stampedAt).getTime() - new Date(a.stampedAt).getTime()
    )[0];

    const revoked = cert.state === 'revoked';

    // Optionally verify the chain tx is real
    let chainConfirmed = false;
    if (cert.chainTxRef) {
      try {
        chainConfirmed = await confirmTransaction(cert.chainTxRef);
      } catch { /* ignore — just can't confirm */ }
    }

    res.json({
      exists: true,
      revoked,
      valid: !revoked,
      tag: cert.tag,
      stampedAt: cert.stampedAt,
      chainTxRef: cert.chainTxRef,
      chainConfirmed,
    });
  } catch (err) {
    console.error('[Certifications] Status check failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
