import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { valid: false, reason: 'missing_key' },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('license_key', key)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return NextResponse.json({ valid: false, reason: 'invalid' });
    }

    if (client.is_activated) {
      return NextResponse.json({ valid: false, reason: 'already_activated' });
    }

    if (client.expires_at && new Date(client.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' });
    }

    return NextResponse.json({
      valid: true,
      clientId: client.id,
      clientName: client.name,
    });
  } catch (err) {
    console.error('verify-license error:', err);
    return NextResponse.json(
      { valid: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
