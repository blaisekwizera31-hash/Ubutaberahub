import { supabase } from './supabase';

function persistLoggedInUser(user: any) {
  if (!user) return;
  const normalized = {
    id: user.id,
    email: user.email,
    name: user.name || user.email?.split('@')[0] || 'User',
    role: user.role || 'citizen',
    profilePhoto: user.profile_photo || user.profilePhoto || null,
  };
  localStorage.setItem('loggedInUser', JSON.stringify(normalized));
}

// Sign up with email and password
export async function signUp(email: string, password: string, userInfo: any) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    const insertData: any = {
      id: authData.user.id,
      email,
      name: userInfo.name,
      phone: userInfo.phone || null,
      profile_photo: userInfo.profilePhoto || null,
      role: userInfo.role,
    };

    if (userInfo.citizenId) insertData.citizen_id = userInfo.citizenId;
    if (userInfo.licenseNumber) insertData.license_number = userInfo.licenseNumber;
    if (userInfo.specialization) insertData.specialization = userInfo.specialization;
    if (userInfo.lawFirm) insertData.law_firm = userInfo.lawFirm;
    if (userInfo.employeeId) insertData.employee_id = userInfo.employeeId;
    if (userInfo.courtAssigned) insertData.court_assigned = userInfo.courtAssigned;
    if (userInfo.judgeId) insertData.judge_id = userInfo.judgeId;
    if (userInfo.yearsExperience) insertData.years_experience = parseInt(userInfo.yearsExperience, 10);

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (dbError) {
      // Keep auth account but report a profile issue to user.
      return { user: null, error: 'Account created in Auth, but profile setup failed. Please contact support.' };
    }

    persistLoggedInUser(userData);
    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!userData) {
      await supabase.auth.signOut();
      return { user: null, error: 'No account profile found. Please sign up first.' };
    }

    persistLoggedInUser(userData);
    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  localStorage.removeItem('loggedInUser');
  return { error };
}

// Get current user
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, error: null };

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) throw dbError;

    persistLoggedInUser(userData);
    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with OAuth (Google, Microsoft, Apple)
export async function signInWithOAuth(provider: 'google' | 'azure' | 'apple') {
  try {
    const isGoogle = provider === 'google';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: isGoogle ? { prompt: 'select_account' } : undefined,
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// Request password reset via email OTP code
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a minute and try again.');
      }
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Verify email OTP code and reset password
export async function verifyCodeAndResetPassword(email: string, code: string, newPassword: string) {
  try {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (verifyError) {
      throw new Error('Invalid or expired verification code. Please request a new code.');
    }

    if (!data.session) {
      throw new Error('Could not establish reset session. Please try again.');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    await supabase.auth.signOut();

    return {
      error: null,
      success: true,
      message: 'Password updated successfully!',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Update password with new password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}
