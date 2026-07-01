export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function PUT(req: Request) {
  try {
    const { clientId, username, password } = await req.json();

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Missing clientId' }, { status: 400 });
    }

    // Check if the username is already taken by someone else
    if (username) {
      const { data: existingUser } = await supabase
        .from('clients')
        .select('id')
        .eq('client_username', username)
        .neq('id', clientId)
        .single();

      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 400 });
      }
    }

    const updates: Record<string, string> = {};
    if (username) updates.client_username = username;
    if (password) updates.client_password = password;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Update settings error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Missing clientId' }, { status: 400 });
    }

    // Delete scans (due to foreign key constraints, or rely on ON DELETE CASCADE if set in DB)
    await supabase.from('scans').delete().eq('client_id', clientId);
    // Delete negative reviews
    await supabase.from('negative_reviews').delete().eq('client_id', clientId);
    
    // Finally, delete the client
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete account error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
