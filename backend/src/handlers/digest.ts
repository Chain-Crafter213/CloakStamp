import { Router, Request, Response } from 'express';
import { digestField, isHashEngineReady } from '../core/hashEngine';

const router = Router();

// GET /digest/compute/:fieldValue — compute BHP256 hash for a field value
router.get('/compute/:fieldValue', async (req: Request, res: Response) => {
  try {
    const { fieldValue } = req.params;

    if (!isHashEngineReady()) {
      res.status(503).json({ error: 'Hash engine not ready' });
      return;
    }

    const result = await digestField(fieldValue);

    if (!result) {
      res.status(500).json({ error: 'Hash computation failed' });
      return;
    }

    res.json({ input: fieldValue, commitment: result });
  } catch (err) {
    console.error('[Digest] Compute failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /digest/status — check if hash engine is online
router.get('/status', (_req: Request, res: Response) => {
  res.json({ ready: isHashEngineReady() });
});

export default router;
