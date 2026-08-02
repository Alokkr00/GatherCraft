import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawPurpose, title, category } = body;

    if (!rawPurpose || typeof rawPurpose !== 'string' || !rawPurpose.trim()) {
      return NextResponse.json({ error: 'Raw purpose is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Intelligent fallback when GEMINI_API_KEY is not configured
      return NextResponse.json({
        suggestions: {
          warm: `To create an unforgettable, welcoming environment around "${title || 'our event'}" where guests feel genuinely valued and connected.`,
          bold: `To host a high-energy gathering focused on ${rawPurpose}, inspiring everyone present and setting a new standard for host excellence.`,
          minimal: `To gather close friends for ${rawPurpose || title || 'a great time'} with zero friction.`
        },
        successCriteria: [
          'Guests feel welcome and engaged within 15 minutes of arrival',
          'At least 3 meaningful new connections or memories created',
          'Event stays on schedule with hard end time respected'
        ],
        isFallback: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a world-class event strategist and expert host.
    Refine the following event purpose into 3 distinct, actionable, and disputable purpose statements, along with 3 clear success criteria.

    Event Context:
    - Raw Host Idea: "${rawPurpose}"
    - Event Title: "${title || 'Party'}"
    - Category: "${category || 'General'}"

    Format your response EXACTLY as a JSON object with this key structure:
    {
      "suggestions": {
        "warm": "A warm, welcoming, heartfelt version of the purpose statement (1-2 sentences)",
        "bold": "A high-impact, ambitious, memorable version of the purpose statement (1-2 sentences)",
        "minimal": "A clean, concise, direct version of the purpose statement (1 sentence)"
      },
      "successCriteria": [
        "Criterion 1 (e.g. guests meet X people)",
        "Criterion 2 (e.g. key moment or toast)",
        "Criterion 3 (e.g. host experience)"
      ]
    }
    Output ONLY valid raw JSON with no markdown formatting around it.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean codeblock markers if any
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJsonText = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(cleanJsonText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error refining purpose with Gemini API:', error);
    return NextResponse.json({
      suggestions: {
        warm: `To host a warm gathering that brings people together around ${error.message ? 'this special occasion' : 'shared moments'}.`,
        bold: `To make this event an unforgettable high-energy experience for every guest.`,
        minimal: `To connect, celebrate, and enjoy great company.`
      },
      successCriteria: [
        'High guest turnout and positive engagement',
        'Dietary and seating needs accommodated effortlessly',
        'Memorable host toasts and photos captured'
      ],
      isFallback: true
    });
  }
}
