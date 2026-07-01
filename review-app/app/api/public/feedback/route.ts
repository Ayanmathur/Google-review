export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function POST(req: Request) {
  try {
    const { client_id, rating, feedback } = await req.json();

    if (!client_id || !rating) {
      return NextResponse.json({ error: 'Missing client_id or rating' }, { status: 400 });
    }

    const { error } = await supabase.from('negative_reviews').insert({
      client_id,
      rating,
      feedback,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : String(error) }, { status: 500 });
  }
}
