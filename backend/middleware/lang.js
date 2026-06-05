/**
 * Language Middleware
 * Detects and enforces the active language context for both text and speech
 * processing across the application.
 *
 * Supported locales:
 *   rw  — Kinyarwanda (default / primary)
 *   en  — English
 *   fr  — French
 *
 * Detection priority (first match wins):
 *   1. Query param:   ?lang=rw
 *   2. Custom header: X-App-Language: rw
 *   3. Standard header: Accept-Language (picks the first supported tag)
 *   4. Fallback: 'rw' (Kinyarwanda — primary language of the platform)
 *
 * Attaches to every request:
 *   req.lang        — resolved locale code  e.g. 'rw'
 *   req.langMeta    — { code, label, speechCode, rtl }
 */

/** Supported locales and their metadata */
export const SUPPORTED_LANGS = Object.freeze({
  rw: { code: 'rw', label: 'Kinyarwanda', speechCode: 'rw-RW', rtl: false },
  en: { code: 'en', label: 'English',     speechCode: 'en-US', rtl: false },
  fr: { code: 'fr', label: 'French',      speechCode: 'fr-FR', rtl: false },
});

export const DEFAULT_LANG = 'rw';

/**
 * Parses an Accept-Language header string and returns the first supported
 * locale code, or null if none match.
 *
 * e.g. "rw,fr;q=0.9,en;q=0.8" → 'rw'
 *      "fr-CA,fr;q=0.9"        → 'fr'
 *      "de,es;q=0.9"           → null
 *
 * @param {string} header
 * @returns {string|null}
 */
function parseAcceptLanguage(header) {
  if (!header) return null;

  return header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q)
    .reduce((found, { tag }) => {
      if (found) return found;
      // Match full code or just the primary subtag (e.g. "fr-CA" → "fr")
      const primary = tag.split('-')[0];
      if (SUPPORTED_LANGS[tag])     return tag;
      if (SUPPORTED_LANGS[primary]) return primary;
      return null;
    }, null);
}

/**
 * detectLang - Express middleware
 * Resolves the active language and attaches it to the request object.
 * Must be applied globally (before routes) so every handler can access req.lang.
 */
export function detectLang(req, res, next) {
  const fromQuery   = req.query?.lang?.toLowerCase();
  const fromHeader  = req.headers['x-app-language']?.toLowerCase();
  const fromAccept  = parseAcceptLanguage(req.headers['accept-language']);

  const resolved =
    (SUPPORTED_LANGS[fromQuery]  ? fromQuery  : null) ||
    (SUPPORTED_LANGS[fromHeader] ? fromHeader : null) ||
    fromAccept ||
    DEFAULT_LANG;

  req.lang     = resolved;
  req.langMeta = SUPPORTED_LANGS[resolved];

  // Echo resolved language back so the client can confirm
  res.setHeader('X-Resolved-Language', resolved);

  next();
}

/**
 * requireLang - Restricts a route to specific language contexts.
 * Useful when a service (e.g. a speech model) only supports certain locales.
 *
 * Usage:
 *   router.post('/speech-rw', detectLang, requireLang('rw'), handler)
 *   router.post('/speech',    detectLang, requireLang(['rw','en']), handler)
 *
 * @param {string | string[]} langs
 */
export function requireLang(langs) {
  const accepted = Array.isArray(langs) ? langs : [langs];
  return (req, res, next) => {
    if (!accepted.includes(req.lang)) {
      return res.status(400).json({
        error:    'Unsupported language',
        message:  `This endpoint supports: ${accepted.join(', ')}. Detected: ${req.lang}.`,
        resolved: req.lang,
      });
    }
    next();
  };
}
