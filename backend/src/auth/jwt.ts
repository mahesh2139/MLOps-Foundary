import crypto from 'crypto';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import type { AuthUser, Role } from './types';

type JwksKey = { kid: string; kty: string; n: string; e: string; x5c?: string[] };

let jwksCache: { fetchedAtMs: number; keys: JwksKey[] } | null = null;

function base64UrlToBuffer(input: string): Buffer {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64');
}

function jwkToPem(jwk: JwksKey): string {
  // Minimal JWK (RSA) -> PEM conversion using Node crypto.
  // Works for standard OIDC providers publishing RSA keys.
  const keyObject = crypto.createPublicKey({
    key: {
      kty: 'RSA',
      n: base64UrlToBuffer(jwk.n),
      e: base64UrlToBuffer(jwk.e),
    } as any,
    format: 'jwk',
  });
  return keyObject.export({ format: 'pem', type: 'spki' }).toString();
}

async function fetchJwks(jwksUrl: string): Promise<JwksKey[]> {
  const now = Date.now();
  const ttlMs = parseInt(process.env.JWKS_CACHE_TTL_MS || '300000', 10) || 300000; // 5m default
  if (jwksCache && now - jwksCache.fetchedAtMs < ttlMs) return jwksCache.keys;

  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.status}`);
  const data = (await res.json()) as { keys: JwksKey[] };
  jwksCache = { fetchedAtMs: now, keys: data.keys || [] };
  return jwksCache.keys;
}

export function signDemoToken(user: AuthUser): string {
  const secret = process.env.JWT_SIGNING_SECRET || 'dev-secret-change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(user, secret, { algorithm: 'HS256', expiresIn });
}

export async function verifyToken(token: string): Promise<AuthUser> {
  const mode = process.env.AUTH_MODE || 'demo'; // demo | oidc

  if (mode === 'demo') {
    const secret = process.env.JWT_SIGNING_SECRET || 'dev-secret-change-me';
    const decoded = jwt.verify(token, secret) as any;
    return normalizeUser(decoded);
  }

  const issuer = process.env.OIDC_ISSUER;
  const audience = process.env.OIDC_AUDIENCE;
  const jwksUrl = process.env.OIDC_JWKS_URL;
  if (!issuer || !jwksUrl) throw new Error('OIDC_ISSUER and OIDC_JWKS_URL must be set for AUTH_MODE=oidc');

  const getKey = async (header: JwtHeader, callback: SigningKeyCallback) => {
    try {
      const keys = await fetchJwks(jwksUrl);
      const jwk = keys.find((k) => k.kid === header.kid);
      if (!jwk) return callback(new Error('Unknown kid'));
      return callback(null, jwkToPem(jwk));
    } catch (err: any) {
      return callback(err);
    }
  };

  const decoded = await new Promise<any>((resolve, reject) => {
    jwt.verify(
      token,
      (header: JwtHeader, cb: SigningKeyCallback) => {
        void getKey(header, cb);
      },
      {
        algorithms: ['RS256'],
        issuer,
        audience: audience || undefined,
      },
      (err, payload) => (err ? reject(err) : resolve(payload))
    );
  });

  return normalizeUser(decoded);
}

function normalizeUser(payload: any): AuthUser {
  const email = payload.email || payload.preferred_username || payload.upn || payload.unique_name || 'unknown@example.com';
  const role = (payload.role || payload.roles?.[0] || 'ml_engineer') as Role;
  return {
    sub: String(payload.sub || payload.oid || payload.user_id || email),
    email: String(email),
    name: payload.name ? String(payload.name) : undefined,
    role,
  };
}

