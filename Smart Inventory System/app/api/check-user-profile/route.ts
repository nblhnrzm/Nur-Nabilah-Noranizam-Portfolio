import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Create Supabase client with service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user profile exists in app_user table
    const { data: profile, error } = await supabase
      .from('app_user')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking user profile:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      exists: !!profile,
      userId: userId
    });

  } catch (error) {
    console.error('Unexpected error in check-user-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
