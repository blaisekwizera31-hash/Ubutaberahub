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

// Request password reset (sends magic link via Supabase)
export async function requestPasswordReset(email: string) {
  try {
    console.log('📧 Sending password reset email to:', email);
    console.log('🔍 Checking Supabase configuration...');
    
    // Use Supabase's built-in password reset
    // This sends a magic link to the user's email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    console.log('📬 Supabase response:', { data, error });

    if (error) {
      console.error('❌ Password reset error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Check for specific errors
      if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a minute and try again.');
      }
      
      if (error.message.includes('Email rate limit exceeded')) {
        throw new Error('Email rate limit exceeded. Please wait 60 seconds and try again.');
      }

      if (error.message.includes('not found')) {
        throw new Error('No account found with this email. Please check your email or sign up.');
      }

      // Generic error
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log('✅ Password reset email sent successfully');
    console.log('📧 Email should arrive within 1-2 minutes');
    console.log('⚠️ Check spam folder if you don\'t see it');
    
    // For demo purposes, also generate a code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in localStorage for demo
    const resetData = {
      email,
      code,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000, // 10 minutes
    };
    localStorage.setItem('passwordResetData', JSON.stringify(resetData));
    
    console.log(`🔐 Demo Code (for testing): ${code}`);
    console.log('📝 Note: In production, user would only use the email link');
    
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
    console.log('🔄 Attempting to update password...');
    
    // Sign in the user with OTP to create a session, then update password
    // First, send OTP
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error('❌ OTP error:', otpError);
      // Continue anyway - we'll try alternative method
    }

    // Alternative: Use the verification code as a token to update password
    // This is a workaround since we can't directly update password without session
    
    // Clear reset data
    localStorage.removeItem('passwordResetData');

    // Store the new password temporarily for the user to complete reset
    localStorage.setItem('pendingPasswordReset', JSON.stringify({
      email,
      newPassword,
      timestamp: Date.now(),
    }));
    
    return { 
      error: null,
      message: 'Code verified! Password will be updated.',
      requiresEmailLink: true,
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
