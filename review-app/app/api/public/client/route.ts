export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, business_type, google_place_id, about, is_active, expires_at, slug')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return NextResponse.json({ client: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
