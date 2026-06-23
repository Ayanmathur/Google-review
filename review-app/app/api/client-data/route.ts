import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Fetch client slug
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('slug')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch all scans for this client
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('rating_given')
      .eq('client_id', clientId);

    if (scansError) {
      console.error('client-data scans error:', scansError);
      return NextResponse.json(
        { error: 'Failed to fetch scans' },
        { status: 500 }
      );
    }

    const total = scans?.length ?? 0;
    const positive = scans?.filter((s) => s.rating_given >= 4).length ?? 0;
    const negative = scans?.filter((s) => s.rating_given <= 3).length ?? 0;

    // Fetch negative reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('negative_reviews')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('client-data reviews error:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stats: { total, positive, negative },
      reviews: reviews ?? [],
      slug: client.slug,
    });
  } catch (err) {
    console.error('client-data error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
