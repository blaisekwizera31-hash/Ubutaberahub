/**
 * Request Validation Middleware
 * Validates and sanitizes incoming request bodies
 */

/**
 * sanitizeString - Trims and limits string length
 */
function sanitizeString(value, maxLength = 5000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/**
 * validateBody - Checks required fields exist and are non-empty
 * Usage: validateBody(['title', 'description'])
 */
export function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Missing required fields: ${missing.join(', ')}`,
        missingFields: missing,
      });
    }

    next();
  };
}

/**
 * validateChatRequest - Validates /api/chat body
 */
export function validateChatRequest(req, res, next) {
  const { messages, language } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Validation failed', message: '`messages` must be a non-empty array' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Validation failed', message: 'Maximum 50 messages per request' });
  }

  for (const msg of messages) {
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return res.status(400).json({ error: 'Validation failed', message: `Invalid message role: ${msg.role}` });
    }
    if (typeof msg.content !== 'string' || msg.content.trim() === '') {
      return res.status(400).json({ error: 'Validation failed', message: 'Each message must have non-empty `content`' });
    }
    // Sanitize
    msg.content = sanitizeString(msg.content, 4000);
  }

  if (language && !['en', 'rw', 'fr'].includes(language)) {
    return res.status(400).json({ error: 'Validation failed', message: 'Language must be en, rw, or fr' });
  }

  next();
}

/**
 * validateCaseSubmission - Validates case submit body
 */
export function validateCaseSubmission(req, res, next) {
  const { title, description, caseType, lawyerId } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({ error: 'Validation failed', message: 'Title must be at least 3 characters' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({ error: 'Validation failed', message: 'Description must be at least 10 characters' });
  }

  if (!caseType || typeof caseType !== 'string') {
    return res.status(400).json({ error: 'Validation failed', message: 'Case type is required' });
  }

  if (!lawyerId || typeof lawyerId !== 'string') {
    return res.status(400).json({ error: 'Validation failed', message: 'Attorney ID is required' });
  }

  // Sanitize
  req.body.title       = sanitizeString(title, 200);
  req.body.description = sanitizeString(description, 5000);
  req.body.caseType    = sanitizeString(caseType, 100);

  next();
}

/**
 * validateMessageBody - Validates message send body
 */
export function validateMessageBody(req, res, next) {
  const body = req.body?.body || req.body?.message || '';

  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'Validation failed', message: 'Message body is required' });
  }

  if (body.trim().length > 5000) {
    return res.status(400).json({ error: 'Validation failed', message: 'Message too long (max 5000 characters)' });
  }

  req.body.body = sanitizeString(body, 5000);
  next();
}

/**
 * validateClassifyCase - Validates case classification body
 */
export function validateClassifyCase(req, res, next) {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({ error: 'Validation failed', message: 'Title must be at least 2 characters' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ error: 'Validation failed', message: 'Description must be at least 5 characters' });
  }

  req.body.title       = sanitizeString(title, 200);
  req.body.description = sanitizeString(description, 5000);

  next();
}
