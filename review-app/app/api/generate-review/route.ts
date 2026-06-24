import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  let businessName = '';

  try {
    const body = await req.json();
    businessName = body.businessName;
    const { businessType, rating, about } = body;

    if (!businessName || !businessType || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, businessType, rating' },
        { status: 400 }
      );
    }

    let prompt = `Write a ${rating}-star Google review for a ${businessType} called "${businessName}".`;
    if (about) {
      prompt += ` Background about this business: ${about}.`;
    }
    prompt += ` The review MUST be 2 to 3 full sentences long. Each sentence must be complete — never cut off mid-thought. Sound like a real, happy customer who visited recently. Be warm, specific, and natural. Mention the business name once. Do not use generic filler.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.9,
        systemInstruction: "You write short, genuine Google reviews as if you are a real satisfied customer. Always write exactly 2 to 3 complete sentences. Never write half-sentences or trailing thoughts. Return ONLY the review text — no quotes, no preamble, no labels, no explanation.",
      }
    });

    const reviewText = response.text?.trim() || '';

    if (!reviewText || reviewText.length < 30) {
      throw new Error('Review too short or empty');
    }

    return NextResponse.json({ review: reviewText });

  } catch (error) {
    console.error('Gemini API Error:', error);

    const safeName = businessName || 'this business';
    const fallbackReview = `Had a really great experience at ${safeName}. The service was excellent and the staff were incredibly welcoming. Would definitely come back and recommend to friends and family.`;

    return NextResponse.json({ review: fallbackReview });
  }
}
