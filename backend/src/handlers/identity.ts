import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getStore } from '../core/storage';
import { challengeRequestSchema, challengeResponseSchema } from '../pipelines/schemas';

const router = Router();
const SIGNING_KEY = process.env.JWT_SECRET || 'cloakstamp_default_secret';

// POST /identity/challenge — request a signing challenge
router.post('/challenge', async (req: Request, res: Response) => {
  try {
    const parsed = challengeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      return;
    }

    const { address } = parsed.data;
    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const challenge = `Authenticate with CloakStamp protocol.\nChallenge: ${token}\nIssued: ${new Date().toISOString()}`;

    const store = await getStore();
    store.data.challengeTokens[address] = token;
    await store.write();

    res.json({ token, challenge });
  } catch (err) {
    console.error('[Identity] Challenge generation failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /identity/confirm — verify wallet signature and issue session
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const parsed = challengeResponseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      return;
    }

    const { address, signedPayload, token } = parsed.data;

    const store = await getStore();
    const storedToken = store.data.challengeTokens[address];

    if (!storedToken || storedToken !== token) {
      res.status(401).json({ error: 'Invalid or expired challenge' });
      return;
    }

    // Clear one-time challenge
    delete store.data.challengeTokens[address];
    await store.write();

    // Issue session JWT
    const session = jwt.sign({ address }, SIGNING_KEY, { expiresIn: '7d' });

    res.json({ success: true, session, address });
  } catch (err) {
    console.error('[Identity] Confirm failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
