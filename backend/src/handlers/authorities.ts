import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getStore } from '../core/storage';
import { readMapping } from '../core/chainReader';
import { guardian } from '../shield/guardian';
import { enrollAuthoritySchema, updateProfileSchema } from '../pipelines/schemas';

const router = Router();

function obscureAddr(addr: string): string {
  return createHash('sha256').update(addr).digest('hex');
}

// POST /authorities/enroll — record new issuer registration (with optional profile)
router.post('/enroll', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = enrollAuthoritySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { authority, chainTxRef, displayName, organization, description, categories, website } = parsed.data;
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

    // Save issuer profile if provided
    if (displayName && organization && categories && categories.length > 0) {
      store.data.issuerProfiles[hashed] = {
        hashedAddr: hashed,
        displayName,
        organization,
        description: description || '',
        categories,
        website: website || '',
        enrolledAt: new Date().toISOString(),
        chainTxRef,
      };
    }

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

// POST /authorities/profile — create or update issuer profile
router.post('/profile', guardian, async (req: Request, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const addr = req.walletAddr;
    if (!addr) { res.status(401).json({ error: 'No wallet address' }); return; }
    const hashed = obscureAddr(addr);

    const store = await getStore();

    if (!store.data.authorities[hashed]) {
      res.status(403).json({ error: 'Not a registered issuer' });
      return;
    }

    const { displayName, organization, description, categories, website } = parsed.data;
    const existing = store.data.issuerProfiles[hashed];

    store.data.issuerProfiles[hashed] = {
      hashedAddr: hashed,
      displayName,
      organization,
      description: description || '',
      categories,
      website: website || '',
      enrolledAt: existing?.enrolledAt || store.data.authorities[hashed].enrolledAt,
      chainTxRef: existing?.chainTxRef || store.data.authorities[hashed].chainTxRef,
    };

    await store.write();
    res.json({ success: true, profile: store.data.issuerProfiles[hashed] });
  } catch (err) {
    console.error('[Authorities] Profile update failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authorities/profiles — public list of all issuer profiles
router.get('/profiles', async (_req: Request, res: Response) => {
  try {
    const store = await getStore();
    const profiles = Object.values(store.data.issuerProfiles);
    res.json({ profiles });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /authorities/profile/:address — single issuer profile (public)
router.get('/profile/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const hashed = obscureAddr(address);
    const store = await getStore();
    const profile = store.data.issuerProfiles[hashed] || null;
    res.json({ profile });
  } catch (err) {
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
