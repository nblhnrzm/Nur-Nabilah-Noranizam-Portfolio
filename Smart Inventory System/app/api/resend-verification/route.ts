import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-utils';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if the user exists in auth but hasn't verified their email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      );
    }
    
    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }
    
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }    // Resend the verification email
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error resending verification email:', error);
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Verification email resent successfully' });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
