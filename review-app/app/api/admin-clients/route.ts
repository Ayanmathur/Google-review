export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.error_description === 'string') return e.error_description;
    try { return JSON.stringify(error); } catch { return String(error); }
  }
  return String(error);
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message || 'Failed to fetch clients' }, { status: 500 });
    return NextResponse.json({ clients: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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
      is_active: true,
      is_activated: false,
    });

    if (error) return NextResponse.json({ error: error.message || 'Failed to add client' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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

    if (error) return NextResponse.json({ error: error.message || 'Failed to update client' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

    await supabase.from('scans').delete().eq('client_id', id);
    await supabase.from('negative_reviews').delete().eq('client_id', id);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message || 'Failed to delete client' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
