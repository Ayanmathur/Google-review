export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const WHATSAPP_NUMBER = '919422880355';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'license';

  let message = '';
  if (type === 'license') {
    message = 'Hi, I would like to get a license key for ReviewFlow.';
  } else if (type === 'forgot') {
    message = 'Hi, I forgot my ReviewFlow username/password. Can you help?';
  }

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return NextResponse.redirect(waUrl);
}
