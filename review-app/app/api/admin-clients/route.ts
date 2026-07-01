export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ clients: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, business_type, google_place_id, license_key, about } = body;

    const { error } = await supabase.from('clients').insert({
      name,
      slug,
      business_type,
      google_place_id,
      license_key,
      about,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

    // Explicitly delete related records if not relying on ON DELETE CASCADE
    await supabase.from('scans').delete().eq('client_id', id);
    await supabase.from('negative_reviews').delete().eq('client_id', id);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : String(error) }, { status: 500 });
  }
}
