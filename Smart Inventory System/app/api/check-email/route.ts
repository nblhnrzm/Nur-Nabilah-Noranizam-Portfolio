import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-utils';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const trimmedEmail = email?.trim();

    // Validate input
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = trimmedEmail.toLowerCase();

    // Check both Supabase Auth and app_user table for comprehensive email validation
    
    // First, check Supabase Auth users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('[check-email] Error checking Supabase Auth users:', authError.message);
    } else if (authUsers && authUsers.users) {
      const existingAuthUser = authUsers.users.find(user => 
        user.email && user.email.toLowerCase() === normalizedEmail
      );
      
      if (existingAuthUser) {        // Check if email is confirmed
        const isEmailConfirmed = !!existingAuthUser.email_confirmed_at;
        
        if (!isEmailConfirmed) {
          console.log(`[check-email] Email ${trimmedEmail} exists but not confirmed`);
          
          // Resend confirmation email using the resend method
          const { error: resendError } = await supabaseAdmin.auth.resend({
            type: 'signup',
            email: normalizedEmail,
          });
          
          if (resendError) {
            console.error('[check-email] Error sending confirmation email:', resendError.message);
            return NextResponse.json({ 
              exists: true, 
              confirmed: false, 
              confirmationSent: false,
              message: 'Email exists but not confirmed. Failed to send new confirmation email.'
            });
          }
          
          return NextResponse.json({ 
            exists: true, 
            confirmed: false, 
            confirmationSent: true,
            message: 'Email exists but not confirmed. A new confirmation email has been sent.'
          });
        }
        
        console.log(`[check-email] Email ${trimmedEmail} exists and is confirmed`);
        return NextResponse.json({ exists: true, confirmed: true });
      }
    }

    // Then check the app_user table for existing email
    const { data: appUserData, error: appUserError } = await supabaseAdmin
      .from('app_user')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (appUserError) {
      console.error('[check-email] Supabase error checking app_user:', appUserError.message);
      return NextResponse.json(
        { error: 'Failed to check email' },
        { status: 500 }      );
    }

    // If found in app_user table, the email exists and should be confirmed
    // (since app_user records are only created after email confirmation)
    if (appUserData) {
      console.log(`[check-email] Email ${trimmedEmail} exists in app_user table (confirmed)`);
      return NextResponse.json({ exists: true, confirmed: true });
    }
    
    console.log(`[check-email] Email ${trimmedEmail} does not exist in database`);
    return NextResponse.json({ exists: false, confirmed: null });
  } catch (err: any) {
    console.error('[check-email] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
