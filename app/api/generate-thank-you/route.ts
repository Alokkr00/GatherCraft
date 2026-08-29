import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const ThankYouSchema = z.object({
  guestName: z.string().trim().min(1).max(100),
  role: z.string().max(50).optional().default('guest'),
  tone: z.enum(['warm', 'fun', 'short']).optional().default('warm'),
  eventTitle: z.string().max(120).optional().default('Gathering'),
  purposeStatement: z.string().max(500).optional().default('Shared moments'),
  retrospectiveNotes: z.string().max(500).optional().default('Great conversations and warm atmosphere'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`thank_you_${ip}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ThankYouSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    const { guestName, role, tone, eventTitle, purposeStatement, retrospectiveNotes } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackNotes: Record<string, string> = {
        warm: `Hi ${guestName}! Thank you so much for coming to ${eventTitle}. Having you there made the evening truly special!`,
        fun: `Hey ${guestName}! Thanks for bringing such amazing energy to ${eventTitle}! We need to do that again soon! 🔥`,
        short: `Hi ${guestName}, thanks a lot for joining us at ${eventTitle}! Great seeing you!`
      };
      return NextResponse.json({
        message: fallbackNotes[tone] || fallbackNotes.warm,
        isFallback: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert event host crafting a personalized post-event appreciation message to a guest.

Guest & Event Context:
- Guest Name: "${guestName}"
- Guest Role: "${role}"
- Event Title: "${eventTitle}"
- Event Purpose: "${purposeStatement}"
- Host Retrospective Notes: "${retrospectiveNotes}"
- Desired Tone: "${tone}" (warm & heartfelt, high energy & fun, or short & sweet)

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
