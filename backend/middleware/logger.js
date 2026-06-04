/**
 * Request Logger Middleware
 * Logs all incoming requests with timing
 */

const COLORS = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

function statusColor(status) {
  if (status >= 500) return COLORS.red;
  if (status >= 400) return COLORS.yellow;
  if (status >= 300) return COLORS.cyan;
  return COLORS.green;
}

function formatMethod(method) {
  const colors = {
    GET:    COLORS.green,
    POST:   COLORS.cyan,
    PUT:    COLORS.yellow,
    PATCH:  COLORS.yellow,
    DELETE: COLORS.red,
  };
  return `${colors[method] || COLORS.reset}${method.padEnd(6)}${COLORS.reset}`;
}

/**
 * requestLogger - Logs every request with method, path, status, duration
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Override res.end to capture when response finishes
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = statusColor(status);
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '-';

    console.log(
      `${COLORS.gray}${new Date().toISOString()}${COLORS.reset} ` +
      `${formatMethod(req.method)} ` +
      `${req.path.padEnd(40)} ` +
      `${color}${status}${COLORS.reset} ` +
      `${COLORS.gray}${duration}ms  ${ip}${COLORS.reset}`
    );

    return originalEnd(...args);
  };

  next();
}

/**
 * auditLogger - Logs sensitive write operations (POST/PUT/PATCH/DELETE)
 * for security audit trail
 */
export function auditLogger(req, res, next) {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (writeMethods.includes(req.method)) {
    const userId = req.user?.id || 'anonymous';
    const role   = req.profile?.role || 'unknown';
    console.log(
      `[AUDIT] ${new Date().toISOString()} ` +
      `user=${userId} role=${role} ` +
      `${req.method} ${req.path}`
    );
  }

  next();
}
