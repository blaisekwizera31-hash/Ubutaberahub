import { supabase } from './supabase';

// Sign up with email and password
export async function signUp(email: string, password: string, userInfo: any) {
  try {
    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // 2. Insert user data into our users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: userInfo.name,
          phone: userInfo.phone,
          profile_photo: userInfo.profilePhoto,
          role: userInfo.role,
          citizen_id: userInfo.citizenId,
          license_number: userInfo.licenseNumber,
          specialization: userInfo.specialization,
          law_firm: userInfo.lawFirm,
          employee_id: userInfo.employeeId,
          court_assigned: userInfo.courtAssigned,
          judge_id: userInfo.judgeId,
          years_experience: userInfo.yearsExperience,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

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
      .single();

    if (dbError) throw dbError;

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
