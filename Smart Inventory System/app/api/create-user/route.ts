import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-utils'; // Import from server-utils instead

// Helper function to check if a user's email is verified
async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    // Get user details from Supabase Auth
    const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error || !userData || !userData.user) {
      console.error('Error getting user verification status:', error);
      return false;
    }
    
    // If email_confirmed_at is present, the email is verified
    return !!userData.user.email_confirmed_at;
  } catch (error) {
    console.error('Unexpected error checking email verification:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { userId, username, email, fullName, displayName } = await request.json();

    if (!userId || !username || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // First check if this user ID already has a profile in the app_user table
    const { data: existingUserById, error: checkByIdError } = await supabaseAdmin
      .from('app_user')
      .select('id, username, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkByIdError) {
      console.error('Error checking existing user by ID:', checkByIdError);
    } else if (existingUserById) {
      // User profile already exists with this ID
      return NextResponse.json({ 
        success: true, 
        user: existingUserById, 
        message: 'User profile already exists' 
      });
    }
      // First, check if the email is verified
    const isVerified = await isEmailVerified(userId);
    
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Email not verified. Please verify your email before creating a user profile.' },
        { status: 403 }
      );
    }
    
    // Check if the username is already taken
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('app_user')
      .select('username, id')
      .eq('username', username)
      .maybeSingle();
      
    if (usernameError) {
      console.error('Error checking username:', usernameError);
    } else if (existingUsername) {
      // If the username is taken by the same user ID, it's okay
      if (existingUsername.id === userId) {
        return NextResponse.json({ 
          success: true, 
          user: existingUsername, 
          message: 'User profile already exists' 
        });
      }
      
      // Otherwise, the username is actually taken by someone else
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }
    
    // Also check if there's already a profile with this email
    const { data: existingEmail, error: emailCheckError } = await supabaseAdmin
      .from('app_user')
      .select('email, id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
    } else if (existingEmail && existingEmail.id !== userId) {
      return NextResponse.json(
        { error: 'Email is already associated with another account' },
        { status: 409 }
      );
    }

    // Create user profile in the database using admin privileges
    const { data, error } = await supabaseAdmin
      .from('app_user')
      .insert([
        {
          id: userId,
          username,
          email: email.toLowerCase(),
          full_name: fullName || null,
          display_name: displayName || username,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error creating user profile:', error);
      return NextResponse.json(
        { error: `Failed to create user profile: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: data[0] });
  } catch (error: any) {
    console.error('Unexpected error creating user:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
