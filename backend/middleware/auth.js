/**
 * Authentication Middleware
 * Verifies Supabase JWT tokens on protected routes
 */

/**
 * requireAuth - Blocks unauthenticated requests
 * Attaches req.user (Supabase auth user) and req.profile (users table row)
 */
export function requireAuth(supabaseAdmin) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Auth service unavailable' });
      }

      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data?.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
      }

      req.user = data.user;

      // Attach profile from users table
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      req.profile = profile || null;
      next();
    } catch (err) {
      console.error('[auth] requireAuth error:', err.message);
      return res.status(500).json({ error: 'Authentication error', message: err.message });
    }
  };
}

/**
 * requireRole - Restricts route to specific roles
 * Must be used AFTER requireAuth
 * Usage: requireRole('lawyer'), requireRole(['lawyer','judge'])
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const role = req.profile?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access restricted to: ${allowed.join(', ')}`,
      });
    }
    next();
  };
}

/**
 * optionalAuth - Attaches user if token present, continues without it
 * Useful for routes that behave differently for logged-in vs anonymous users
 */
export function optionalAuth(supabaseAdmin) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

      if (!token || !supabaseAdmin) {
        req.user = null;
        req.profile = null;
        return next();
      }

      const { data } = await supabaseAdmin.auth.getUser(token);
      req.user = data?.user || null;

      if (req.user) {
        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', req.user.id)
          .maybeSingle();
        req.profile = profile || null;
      } else {
        req.profile = null;
      }

      next();
    } catch {
      req.user = null;
      req.profile = null;
      next();
    }
  };
}
