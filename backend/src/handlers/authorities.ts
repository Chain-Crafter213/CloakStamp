import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getStore } from '../core/storage';
import { readMapping } from '../core/chainReader';
import { guardian } from '../shield/guardian';
import { enrollAuthoritySchema } from '../pipelines/schemas';

const router = Router();

function obscureAddr(addr: string): string {
  return createHash('sha256').update(addr).digest('hex');
}

// POST /authorities/enroll — record new issuer registration
router.post('/enroll', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = enrollAuthoritySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { authority, chainTxRef } = parsed.data;
    const hashed = obscureAddr(authority);

    const store = await getStore();

    if (store.data.authorities[hashed]) {
      res.status(409).json({ error: 'Authority already enrolled' });
      return;
    }

    store.data.authorities[hashed] = {
      hashedAddr: hashed,
      state: 'active',
      enrolledAt: new Date().toISOString(),
      chainTxRef,
    };

    store.data.auditLog.push({
      uid: uuid(),
      kind: 'authority_enrolled',
      actorHash: obscureAddr(req.walletAddr || ''),
      payload: { authorityHash: hashed, chainTxRef },
      occurredAt: new Date().toISOString(),
    });

    await store.write();

    res.json({ success: true, authorityHash: hashed });
  } catch (err) {
    console.error('[Authorities] Enroll failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authorities/check/:address — check if issuer is registered on-chain
router.get('/check/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const hashed = obscureAddr(address);

    const store = await getStore();
    const localRecord = store.data.authorities[hashed];

    res.json({
      enrolled: !!localRecord,
      state: localRecord?.state || null,
    });
  } catch (err) {
    console.error('[Authorities] Check failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authorities/count — total enrolled authorities
router.get('/count', async (_req: Request, res: Response) => {
  try {
    const store = await getStore();
    const active = Object.values(store.data.authorities).filter(a => a.state === 'active').length;
    res.json({ total: active });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
