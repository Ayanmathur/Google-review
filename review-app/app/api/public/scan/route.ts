export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function POST(req: Request) {
  try {
    const { client_id, rating_given } = await req.json();

    if (!client_id) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });

    const { data, error } = await supabase.from('scans').insert({
      client_id,
      rating_given: rating_given || null,
    }).select('id').single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, rating_given } = await req.json();

    if (!id) return NextResponse.json({ error: 'Missing scan id' }, { status: 400 });

    const { error } = await supabase.from('scans').update({
      rating_given,
    }).eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
