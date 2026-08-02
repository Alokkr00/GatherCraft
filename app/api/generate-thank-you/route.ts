import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { guestName, role, tone, eventTitle, purposeStatement, retrospectiveNotes } = body;

    if (!guestName || typeof guestName !== 'string') {
      return NextResponse.json({ error: 'Guest name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const selectedTone = tone || 'warm';

    if (!apiKey) {
      // High-quality contextual fallback thank-you note
      const fallbackNotes: Record<string, string> = {
        warm: `Hi ${guestName}! Thank you so much for coming to ${eventTitle || 'the gathering'}. Having you there made the evening truly special!`,
        fun: `Hey ${guestName}! Thanks for bringing such amazing energy to ${eventTitle || 'the party'}! We need to do that again soon! 🔥`,
        short: `Hi ${guestName}, thanks a lot for joining us at ${eventTitle || 'the gathering'}! Great seeing you!`
      };
      return NextResponse.json({
        message: fallbackNotes[selectedTone] || fallbackNotes.warm,
        isFallback: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert event host crafting a personalized post-event appreciation message to a guest.

Guest & Event Context:
- Guest Name: "${guestName}"
- Guest Role: "${role || 'guest'}"
- Event Title: "${eventTitle || 'Gathering'}"
- Event Purpose: "${purposeStatement || 'Shared moments'}"
- Host Retrospective Notes: "${retrospectiveNotes || 'Great conversations and warm atmosphere'}"
- Desired Tone: "${selectedTone}" (warm & heartfelt, high energy & fun, or short & sweet)

Generate a personalized 2-sentence thank-you text message that the host can send directly to ${guestName}. Return ONLY the plain text message ready to send.`;

    const result = await model.generateContent(prompt);
    const messageText = result.response.text().trim();

    return NextResponse.json({ message: messageText, isFallback: false });
  } catch (error: any) {
    console.error('Generate Thank-You API Error:', error);
    return NextResponse.json({
      message: `Hi friend! Thank you so much for joining us! It was wonderful having you with us.`,
      isFallback: true
    });
  }
}
