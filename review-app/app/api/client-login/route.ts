export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('client_username', username)
      .eq('client_password', password)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials or account revoked' },
        { status: 401 }
      );
    }

    if (client.expires_at && new Date(client.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Account expired' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      clientId: client.id,
      clientName: client.name,
      slug: client.slug,
    });
  } catch (err) {
    console.error('client-login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
