import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  let businessName = '';

  try {
    const body = await req.json();
    businessName = body.businessName;
    const { businessType, rating, about } = body;

    // Validate incoming data
    if (!businessName || !businessType || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, businessType, rating' },
        { status: 400 }
      );
    }

    // Build the prompt with optional about info
    let prompt = `Write a ${rating}-star Google review for a ${businessType} called ${businessName}.`;
    if (about) {
      prompt += ` Here is some context about the business: ${about}.`;
    }
    prompt += ` Make it sound like a real person: 2-3 sentences, specific but not over-the-top, warm and natural. Mention the business name once.`;

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        systemInstruction: "You generate short, genuine Google reviews for satisfied customers. Return ONLY the review text. No quotes, no preamble, no explanation.",
      }
    });

    const reviewText = response.text?.trim() || '';

    if (!reviewText) {
      throw new Error('No text returned from Gemini API');
    }

    return NextResponse.json({ review: reviewText });

  } catch (error) {
    console.error('Gemini API Error:', error);

    // Fallback response if the API call fails or times out
    const safeName = businessName || 'this business';
    const fallbackReview = `Really happy with my experience at ${safeName}. Great service and would definitely recommend to others.`;

    return NextResponse.json({ review: fallbackReview });
  }
}
