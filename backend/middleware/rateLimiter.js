/**
 * Rate Limiter Middleware
 * Prevents abuse and API quota exhaustion
 * Uses a simple in-memory store (no Redis needed)
 */

const store = new Map(); // ip -> { count, resetAt }

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function cleanup() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) store.delete(key);
  }
}

// Cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * createRateLimiter - Returns an Express middleware
 * @param {number} maxRequests  - Max requests per window
 * @param {number} windowMs     - Window in milliseconds
 * @param {string} message      - Error message shown when limit hit
 */
export function createRateLimiter(maxRequests = 60, windowMs = 60 * 1000, message = 'Too many requests. Please slow down.') {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const record = store.get(key);

    if (!record || record.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfterSeconds: retryAfter,
      });
    }

    next();
  };
}

// Pre-configured limiters for different route groups
export const generalLimiter   = createRateLimiter(120, 60_000,  'Too many requests. Please wait a moment.');
export const aiLimiter        = createRateLimiter(20,  60_000,  'AI request limit reached. Please wait 1 minute.');
export const authLimiter      = createRateLimiter(10,  60_000,  'Too many auth attempts. Please wait 1 minute.');
export const uploadLimiter    = createRateLimiter(10,  60_000,  'Upload limit reached. Please wait a moment.');
