/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

/**
 * notFound - 404 handler for unmatched routes
 */
export function notFound(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
  });
}

/**
 * errorHandler - Global error handler (must be last middleware)
 * Express recognizes it as an error handler because it has 4 params
 */
export function errorHandler(err, req, res, next) {
  // Log internally
  console.error(`[ERROR] ${req.method} ${req.path} ->`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Gemini / AI errors
  if (err.message?.includes('GoogleGenerativeAI') || err.useLocalFallback) {
    return res.status(503).json({
      error: 'AI service unavailable',
      message: err.message,
      useLocalFallback: true,
    });
  }

  // Supabase errors
  if (err.message?.includes('supabase') || err.message?.includes('JWT')) {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Invalid or expired session',
    });
  }

  // JSON parse errors (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON',
    });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds the size limit',
    });
  }

  // CORS errors
  if (err.message === 'CORS blocked') {
    return res.status(403).json({
      error: 'CORS blocked',
      message: 'Origin not allowed',
    });
  }

  // Known status code on error
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
}
