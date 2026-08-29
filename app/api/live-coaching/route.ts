import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const LiveCoachingSchema = z.object({
  currentStepTitle: z.string().max(100).optional(),
  offsetMinutes: z.number().int().min(-600).max(600).optional().default(0),
  checkedInCount: z.number().int().min(0).max(1000).optional().default(0),
  totalGuests: z.number().int().min(0).max(1000).optional().default(10),
  purposeStatement: z.string().max(500).optional().default('Bringing friends together'),
  eventTitle: z.string().max(120).optional().default('Party'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`live_coach_${ip}`, { limit: 40, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ 
        tip: 'Keep the room comfortable and engaged while transitioning smoothly into the next phase.',
        isFallback: true 
      });
    }

    const body = await req.json();
    const parsed = LiveCoachingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    const { currentStepTitle, offsetMinutes, checkedInCount, totalGuests, purposeStatement, eventTitle } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
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
- Party Title: "${eventTitle}"
- Event Purpose: "${purposeStatement}"
- Current Timeline Step: "${currentStepTitle || 'Arrival & Icebreakers'}"
- Timeline Offset: T${offsetMinutes >= 0 ? '+' : ''}${offsetMinutes} minutes
- Attendance Status: ${checkedInCount} checked in out of ${totalGuests} expected guests

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
