import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { currentStepTitle, offsetMinutes, checkedInCount, totalGuests, purposeStatement, eventTitle } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-quality contextual fallback tips
      const fallbackTips = [
        `As guests arrive (${checkedInCount}/${totalGuests}), greet them at the door personally and introduce them to someone already present with a specific shared interest.`,
        `For "${currentStepTitle || 'this phase'}", anchor the room around your event purpose: "${purposeStatement || 'bringing people together'}".`,
        `Keep momentum active — serve signature drinks and transition smoothly into the next phase once 80% of guests are present.`
      ];
      const selectedTip = fallbackTips[Math.abs((offsetMinutes || 0) % fallbackTips.length)];
      return NextResponse.json({ tip: selectedTip, isFallback: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a world-class party copilot and host coach specializing in purpose-driven event design.

Give the host ONE concise, highly actionable 2-sentence tip for the current moment in their party.

Event Context:
- Party Title: "${eventTitle || 'Party'}"
- Event Purpose: "${purposeStatement || 'Bringing friends together'}"
- Current Timeline Step: "${currentStepTitle || 'Arrival & Icebreakers'}"
- Timeline Offset: T${offsetMinutes >= 0 ? '+' : ''}${offsetMinutes || 0} minutes
- Attendance Status: ${checkedInCount || 0} checked in out of ${totalGuests || 10} expected guests

Provide ONLY the final 2-sentence coaching advice for the host. No preambles or quotes.`;

    const result = await model.generateContent(prompt);
    const tipText = result.response.text().trim();

    return NextResponse.json({ tip: tipText, isFallback: false });
  } catch (error: any) {
    console.error('Live Coaching API Error:', error);
    return NextResponse.json({
      tip: 'Greet arriving guests warmhearted at the entrance and introduce them directly to someone nearby with a fun shared topic.',
      isFallback: true
    });
  }
}
