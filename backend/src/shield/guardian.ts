import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { TokenClaims } from '../definitions';

const SIGNING_KEY = process.env.JWT_SECRET || 'cloakstamp_default_secret';

export function guardian(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const bearer = header.split(' ')[1];
  if (!bearer) {
    res.status(401).json({ error: 'Bearer token required' });
    return;
  }

  try {
    const claims = jwt.verify(bearer, SIGNING_KEY) as TokenClaims;
    req.walletAddr = claims.address;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}
