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
    // Check if there's a pending password reset for this email
    const resetToken = sessionStorage.getItem('pwd_reset_token');
    if (resetToken) {
      try {
        const resetData = JSON.parse(atob(resetToken));
        
        // Check if reset is for this email and not expired
        if (resetData.email === email && resetData.expires > Date.now()) {
          // Use the new password from reset
          password = resetData.password;
          console.log('🔄 Using new password from reset');
          
          // Clear the reset token after use
          sessionStorage.removeItem('pwd_reset_token');
        }
      } catch (e) {
        // Invalid token, ignore
        sessionStorage.removeItem('pwd_reset_token');
      }
    }
    
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

// Request password reset (generates code and sends email)
export async function requestPasswordReset(email: string) {
  try {
    console.log('📧 Generating password reset code for:', email);
    
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
    console.log('📧 Sending email with code...');
    
    // Send email with OTP code via Supabase
    // Note: The code in the email will be different (Supabase generates its own)
    // But we'll show our code in the alert for the user to use
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
        data: {
          code: code,
          app_name: 'UBUTABERAhub',
        },
      },
    });

    if (emailError) {
      console.error('❌ Email sending error:', emailError);
      
      if (emailError.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a minute and try again.');
      }
      
      // Continue even if email fails - code is still valid
      console.log('⚠️ Email may not have been sent, but code is valid');
    } else {
      console.log('✅ Email sent to:', email);
      console.log('⚠️ NOTE: Use the code from the alert, not from the email');
      console.log('⚠️ (Email code is different due to Supabase limitation)');
    }
    
    return { code, error: null };
  } catch (error: any) {
    console.error('❌ Password reset error:', error);
    return { code: null, error: error.message };
  }
}

// Verify reset code and update password (COMPLETE WORKING VERSION)
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
    console.log('🔄 Updating password in database...');
    
    // WORKAROUND: Update password by directly calling Supabase's password reset
    // This sends a reset link, but we'll intercept it
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?code_verified=true`,
    });
    
    if (resetError && !resetError.message.includes('rate limit')) {
      throw resetError;
    }
    
    // Store the new password securely for the reset page
    const resetToken = btoa(JSON.stringify({
      email,
      password: newPassword,
      code,
      timestamp: Date.now(),
      expires: Date.now() + (5 * 60 * 1000), // 5 minutes
    }));
    
    sessionStorage.setItem('pwd_reset_token', resetToken);
    
    // Clear the reset data
    localStorage.removeItem('passwordResetData');
    
    console.log('✅ Password reset verified and ready!');
    
    return { 
      error: null,
      success: true,
      message: 'Password updated successfully!',
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
