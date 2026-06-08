import api from './api';

function persistLoggedInUser(user: any, token?: string) {
  if (!user) return;
  const normalized = {
    id: user.id,
    email: user.email,
    name: user.name || user.email?.split('@')[0] || 'User',
    role: user.role || 'citizen',
    profilePhoto: user.profile_photo || user.profilePhoto || null,
  };
  localStorage.setItem('loggedInUser', JSON.stringify(normalized));
  if (token) {
    localStorage.setItem('authToken', token);
  }
}

function clearStoredUser() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
}

// Sign up with email and password
export async function signUp(email: string, password: string, userInfo: any) {
  try {
    const response = await api.post('/auth/signup', {
      email,
      password,
      name: userInfo.name,
      role: userInfo.role,
      ...userInfo
    });

    const { user, token, message } = response.data;

    if (token) {
      persistLoggedInUser(user, token);
    }

    return { 
      user, 
      token, 
      session: token,
      needsEmailVerification: !user.is_verified, 
      message,
      error: null 
    };
  } catch (error: any) {
    return { user: null, error: error.response?.data?.error || error.message };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;

    persistLoggedInUser(user, token);
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.response?.data?.error || error.message };
  }
}

// Sign out
export async function signOut() {
  clearStoredUser();
  return { error: null };
}

// Get current user
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return { user: null, error: null };

    const response = await api.get('/auth/session-user');
    const { user } = response.data;

    persistLoggedInUser(user);
    return { user, error: null };
  } catch (error: any) {
    clearStoredUser();
    return { user: null, error: error.response?.data?.error || error.message };
  }
}

// Request password reset
export async function requestPasswordReset(email: string) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return { error: null, message: response.data.message };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
}

// Reset password with token
export async function resetPassword(token: string, password: string) {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return { 
      error: null, 
      success: true, 
      message: response.data.message 
    };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
}

// Verify email with 6-digit code
export async function verifyEmail(email: string, code: string) {
  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return { error: null, message: response.data.message };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
}

// Resend signup verification email
export async function resendSignupVerification(email: string) {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return { error: null, message: response.data.message };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
}

// Verify code and reset password (frontend helper)
export async function verifyCodeAndResetPassword(email: string, code: string, password: string) {
  // Our backend resetPassword expects { token, password }
  // In this new flow, the code IS the token.
  return resetPassword(code, password);
}

// OAuth Sign in (Stub for now as we transitioned to custom backend)
export async function signInWithOAuth(provider: 'google' | 'azure' | 'apple') {
  return { 
    data: null, 
    error: "Social login is temporarily unavailable. Please use email and password." 
  };
}
