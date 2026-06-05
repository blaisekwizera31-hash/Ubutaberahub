/**
 * Role Checker Middleware
 * Inspects the decoded token payload (req.profile.role) to ensure the user's
 * role matches the roles permitted on a given portal route.
 *
 * Supported roles: citizen | lawyer | clerk | judge
 *
 * Must be used AFTER requireAuth (from auth.js), which attaches req.profile.
 *
 * Usage:
 *   router.get('/lawyer-portal', requireAuth(supabase), checkRole('lawyer'), handler)
 *   router.get('/court-portal',  requireAuth(supabase), checkRole(['clerk','judge']), handler)
 */

/** Valid roles in the system */
export const ROLES = Object.freeze({
  CITIZEN: 'citizen',
  LAWYER:  'lawyer',
  CLERK:   'clerk',
  JUDGE:   'judge',
});

/**
 * checkRole - Returns an Express middleware that enforces role-based access.
 * @param {string | string[]} allowedRoles - One role or an array of roles permitted.
 */
export function checkRole(allowedRoles) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Validate provided roles at registration time (catches typos early)
  const validRoles = Object.values(ROLES);
  for (const r of allowed) {
    if (!validRoles.includes(r)) {
      throw new Error(`[roleChecker] Unknown role: "${r}". Valid roles: ${validRoles.join(', ')}`);
    }
  }

  return (req, res, next) => {
    const role = req.profile?.role;

    if (!role) {
      return res.status(403).json({
        error:   'Forbidden',
        message: 'User profile not found or role not assigned.',
      });
    }

    if (!allowed.includes(role)) {
      return res.status(403).json({
        error:   'Forbidden',
        message: `This portal is restricted to: ${allowed.join(', ')}. Your role: ${role}.`,
      });
    }

    next();
  };
}

/**
 * Convenience pre-built guards for each portal type.
 * These are direct drop-in middleware — no need to call checkRole() yourself.
 *
 * Example:
 *   router.get('/lawyer-portal', requireAuth(supabase), lawyerOnly, handler)
 */
export const citizenOnly = checkRole(ROLES.CITIZEN);
export const lawyerOnly  = checkRole(ROLES.LAWYER);
export const clerkOnly   = checkRole(ROLES.CLERK);
export const judgeOnly   = checkRole(ROLES.JUDGE);
export const courtStaff  = checkRole([ROLES.CLERK, ROLES.JUDGE]);
export const legalPro    = checkRole([ROLES.LAWYER, ROLES.CLERK, ROLES.JUDGE]);
