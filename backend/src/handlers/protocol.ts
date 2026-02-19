import { Router, Request, Response } from 'express';
import { readMapping, gatherProtocolMetrics } from '../core/chainReader';
import { getStore } from '../core/storage';

const router = Router();

// GET /protocol/metrics — aggregated protocol stats from on-chain + local
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const [onChain, store] = await Promise.all([
      gatherProtocolMetrics(),
      getStore(),
    ]);

    const authorities = store.data?.authorities ?? {};
    const certifications = store.data?.certifications ?? {};
    const proofEntries = store.data?.proofEntries ?? {};

    const localAuthorities = Object.values(authorities)
      .filter(a => a.state === 'active').length;

    res.json({
      totalStamped: onChain.totalStamped,
      totalProved: onChain.totalProved,
      enrolledAuthorities: localAuthorities,
      localCertifications: Object.keys(certifications).length,
      localProofs: Object.keys(proofEntries).length,
    });
  } catch (err) {
    console.error('[Protocol] Metrics failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /protocol/mapping/:name/:key — proxy to on-chain mapping read
router.get('/mapping/:name/:key', async (req: Request, res: Response) => {
  try {
    const { name, key } = req.params;
    const value = await readMapping(name, key);

    res.json({ mapping: name, key, value });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /protocol/admin — get protocol admin address from on-chain
router.get('/admin', async (_req: Request, res: Response) => {
  try {
    const admin = await readMapping('protocol_admin', '0u8');
    res.json({ admin: admin || null });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /protocol/fees — get current fee configuration
router.get('/fees', async (_req: Request, res: Response) => {
  try {
    const [issuanceRaw, verificationRaw] = await Promise.all([
      readMapping('issuance_fees', '0u8'),
      readMapping('verification_fees', '0u8'),
    ]);

    const parseNum = (raw: string | null): number => {
      if (!raw) return 0;
      return parseInt(raw.replace(/u64|u128|"/g, '').trim(), 10) || 0;
    };

    res.json({
      issuanceFee: parseNum(issuanceRaw),
      verificationFee: parseNum(verificationRaw),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
