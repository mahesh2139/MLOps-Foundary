import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt';
import { canAccess } from './rbac';
import type { AuthUser, Role } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __authUser: AuthUser | undefined;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  if (process.env.AUTH_DISABLED === 'true') return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });

  try {
    const user = await verifyToken(token);
    req.user = user;
    return next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid token', message: err?.message });
  }
}

export function requireRole(minRole: Role) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (process.env.AUTH_DISABLED === 'true') return next();
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!canAccess(user.role, minRole)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

