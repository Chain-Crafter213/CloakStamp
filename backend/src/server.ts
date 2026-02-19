import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { bootStorage } from './core/storage';
import { bootHashEngine } from './core/hashEngine';
import identityHandler from './handlers/identity';
import authoritiesHandler from './handlers/authorities';
import certificationsHandler from './handlers/certifications';
import proofsHandler from './handlers/proofs';
import protocolHandler from './handlers/protocol';
import digestHandler from './handlers/digest';

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Rate limit identity endpoints
const identityLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/identity', identityLimiter);

// Mount route handlers — specific routes BEFORE wildcards
app.use('/identity', identityHandler);
app.use('/authorities', authoritiesHandler);
app.use('/certifications', certificationsHandler);
app.use('/proofs', proofsHandler);
app.use('/protocol', protocolHandler);
app.use('/digest', digestHandler);

app.get('/health', (_req, res) => res.json({ status: 'ok', protocol: 'cloakstamp' }));

async function ignition() {
  await bootStorage();
  console.log('[Storage] Datastore loaded');

  const hashReady = await bootHashEngine();
  console.log(`[HashEngine] Ready: ${hashReady}`);

  app.listen(PORT, () => {
    console.log(`[CloakStamp] Server running on port ${PORT}`);
    console.log(`[CloakStamp] CORS origin: ${ALLOWED_ORIGIN}`);
  });
}

ignition().catch((err) => {
  console.error('[CloakStamp] Failed to start:', err);
  process.exit(1);
});
