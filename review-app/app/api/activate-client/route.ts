import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { licenseKey, username, password } = await request.json();

    if (!licenseKey || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify the license key is valid and not yet activated
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .eq('is_activated', false)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Invalid or already activated license key' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error: userCheckError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_username', username)
      .single();

    if (existingUser && !userCheckError) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Activate the client
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        client_username: username,
        client_password: password,
        is_activated: true,
      })
      .eq('id', client.id);

    if (updateError) {
      console.error('activate-client update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to activate client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clientId: client.id,
      clientName: client.name,
      slug: client.slug,
    });
  } catch (err) {
    console.error('activate-client error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
