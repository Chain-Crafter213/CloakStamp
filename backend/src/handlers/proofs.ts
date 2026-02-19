import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getStore } from '../core/storage';
import { guardian } from '../shield/guardian';
import { proveOwnershipSchema, recordProofSchema } from '../pipelines/schemas';

const router = Router();

function obscureAddr(addr: string): string {
  return createHash('sha256').update(addr).digest('hex');
}

// POST /proofs/submit — record a proof submission
router.post('/submit', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = proveOwnershipSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { docCommitment, inspector, chainTxRef } = parsed.data;
    const holderHash = obscureAddr(req.walletAddr || '');
    const inspectorHash = obscureAddr(inspector);
    const proofId = uuid();

    const store = await getStore();

    store.data.proofEntries[proofId] = {
      uid: proofId,
      docCommitment,
      inspectorHash,
      recipientHash: holderHash,
      chainTxRef,
      stampedAt: new Date().toISOString(),
    };

    store.data.auditLog.push({
      uid: uuid(),
      kind: 'doc_proved',
      actorHash: holderHash,
      payload: { proofId, docCommitment, chainTxRef },
      occurredAt: new Date().toISOString(),
    });

    await store.write();

    res.json({ success: true, proofId });
  } catch (err) {
    console.error('[Proofs] Submit failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /proofs/inspector/:address — get proofs visible to a verifier
router.get('/inspector/:address', guardian, async (req: Request, res: Response) => {
  try {
    const inspectorHash = obscureAddr(req.params.address);
    const store = await getStore();

    const matches = Object.values(store.data.proofEntries)
      .filter(p => p.inspectorHash === inspectorHash)
      .map(p => ({
        uid: p.uid,
        docCommitment: p.docCommitment,
        stampedAt: p.stampedAt,
      }));

    res.json({ proofEntries: matches });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /proofs/validate/:commitment — check if proof entry exists for this doc_hash
router.get('/validate/:commitment', async (req: Request, res: Response) => {
  try {
    const { commitment } = req.params;
    const store = await getStore();

    // Check proof entries for this doc commitment
    const proofMatches = Object.values(store.data.proofEntries)
      .filter(p => {
        // Match by full or partial commitment (strip .private suffix if present)
        const cleanP = p.docCommitment.replace(/\.private$/, '');
        const cleanC = commitment.replace(/\.private$/, '');
        return cleanP === cleanC;
      });

    if (proofMatches.length === 0) {
      // Fall back: check certifications DB
      const allCerts = Object.values(store.data.certifications);
      const certMatch = allCerts.find(c => c.commitment === commitment);

      if (certMatch) {
        res.json({
          certified: true,
          revoked: certMatch.state === 'revoked',
          valid: certMatch.state !== 'revoked',
          proofCount: 0,
        });
        return;
      }

      res.json({ certified: false, revoked: false, valid: false, proofCount: 0 });
      return;
    }

    // Document has proof entries — it's been proved
    // Also check cert status
    const allCerts = Object.values(store.data.certifications);
    const certMatch = allCerts.find(c => c.commitment === commitment);
    const revoked = certMatch?.state === 'revoked' || false;

    res.json({
      certified: true,
      revoked,
      valid: !revoked,
      proofCount: proofMatches.length,
      latestProof: proofMatches.sort((a, b) =>
        new Date(b.stampedAt).getTime() - new Date(a.stampedAt).getTime()
      )[0]?.stampedAt,
    });
  } catch (err) {
    console.error('[Proofs] Validate failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
