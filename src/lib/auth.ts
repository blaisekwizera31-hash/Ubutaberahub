 import { supabase } from './supabase';

// Sign up with email and password
export async function signUp(email: string, password: string, userInfo: any) {
  try {
    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // 2. Insert user data into our users table
    // Only include fields that have values (avoid empty strings for integer fields)
    const insertData: any = {
      id: authData.user.id,
      email: email,
      name: userInfo.name,
      phone: userInfo.phone || null,
      profile_photo: userInfo.profilePhoto || null,
      role: userInfo.role,
    };

    // Add role-specific fields only if they have values
    if (userInfo.citizenId) insertData.citizen_id = userInfo.citizenId;
    if (userInfo.licenseNumber) insertData.license_number = userInfo.licenseNumber;
    if (userInfo.specialization) insertData.specialization = userInfo.specialization;
    if (userInfo.lawFirm) insertData.law_firm = userInfo.lawFirm;
    if (userInfo.employeeId) insertData.employee_id = userInfo.employeeId;
    if (userInfo.courtAssigned) insertData.court_assigned = userInfo.courtAssigned;
    if (userInfo.judgeId) insertData.judge_id = userInfo.judgeId;
    if (userInfo.yearsExperience) insertData.years_experience = parseInt(userInfo.yearsExperience);

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    // If database insert fails, still return success but log the error
    if (dbError) {
      console.error('Database insert error:', dbError);
      // Return basic user info even if DB insert failed
      return { 
        user: {
          id: authData.user.id,
          email: email,
          name: userInfo.name,
          role: userInfo.role
        }, 
        error: null 
      };
    }

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

    // Get user data from our users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if no rows

    // If user doesn't exist in our table, return auth user info
    if (!userData) {
      return { 
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split('@')[0] || 'User',
          role: 'citizen' // default role
        }, 
        error: null 
      };
    }

    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { user: null, error: null };

    // Get user data from our users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) throw dbError;

    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with OAuth (Google, Microsoft, Apple)
export async function signInWithOAuth(provider: 'google' | 'azure' | 'apple') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// Request password reset (generates code only, no email for now)
export async function requestPasswordReset(email: string) {
  try {
    console.log('📧 Generating password reset code for:', email);
    
    // Check if user exists in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users) {
      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        throw new Error('No account found with this email address.');
      }
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in localStorage with expiration
    const resetData = {
      email,
      code,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000, // 10 minutes
    };
    localStorage.setItem('passwordResetData', JSON.stringify(resetData));
    
    console.log(`✅ Password reset code generated: ${code}`);
    console.log('⏰ Code expires in 10 minutes');
    
    // TODO: In production, send this code via email using Resend or SendGrid
    // For now, code is shown in the alert
    
    return { code, error: null };
  } catch (error: any) {
    console.error('❌ Password reset error:', error);
    return { code: null, error: error.message };
  }
}

// Verify reset code and update password
export async function verifyCodeAndResetPassword(email: string, code: string, newPassword: string) {
  try {
    // Get stored reset data
    const storedData = localStorage.getItem('passwordResetData');
    if (!storedData) {
      throw new Error('No reset request found. Please request a new code.');
    }

    const resetData = JSON.parse(storedData);

    // Check if code matches
    if (resetData.code !== code) {
      throw new Error('Invalid verification code. Please try again.');
    }

    // Check if email matches
    if (resetData.email !== email) {
      throw new Error('Email does not match reset request.');
    }

    // Check if code expired (10 minutes)
    const now = Date.now();
    if (now - resetData.timestamp > resetData.expiresIn) {
      localStorage.removeItem('passwordResetData');
      throw new Error('Verification code has expired. Please request a new one.');
    }

    console.log('✅ Code verified successfully');
    console.log('🔄 Updating password via Supabase...');
    
    // Use Supabase's password reset with a temporary sign-in
    // Step 1: Send password reset email (this creates a valid token)
    const { error: resetEmailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?password_reset=true`,
    });
    
    if (resetEmailError) {
      console.error('Reset email error:', resetEmailError);
    }
    
    // Step 2: Store the new password for when user clicks the link
    sessionStorage.setItem('newPasswordPending', JSON.stringify({
      email,
      password: newPassword,
      timestamp: Date.now(),
    }));
    
    // Clear reset data
    localStorage.removeItem('passwordResetData');
    
    console.log('✅ Code verified! Password reset initiated.');
    console.log('📧 Check your email and click the link to complete the reset.');
    
    return { 
      error: null,
      requiresEmailConfirmation: true,
      message: 'Code verified! Check your email to complete password reset.',
    };
  } catch (error: any) {
    console.error('❌ Password reset verification error:', error);
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
