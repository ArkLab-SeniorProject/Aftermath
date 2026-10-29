import crypto from 'node:crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

type TokenPayload = {
  sub: string;
  exp: number;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET must be set.');
  }
  return secret;
}

function encode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function sign(input: string): string {
  return crypto.createHmac('sha256', getAuthSecret()).update(input).digest('base64url');
}

export function createAuthToken(userId: string): string {
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encode(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })
  );
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function verifyAuthToken(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid authentication token');
  }

  const [header, payload, signature] = parts;
  const expectedSignature = sign(`${header}.${payload}`);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Invalid authentication token');
  }

  let decoded: TokenPayload;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
  } catch {
    throw new Error('Invalid authentication token');
  }

  if (
    typeof decoded.sub !== 'string' ||
    !/^[a-f\d]{24}$/i.test(decoded.sub) ||
    typeof decoded.exp !== 'number' ||
    decoded.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error('Invalid or expired authentication token');
  }

  return decoded.sub;
}
