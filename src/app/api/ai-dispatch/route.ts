import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt, buildUserMessage, fallbackParse } from "@/lib/ai/dispatcher";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Geçerli bir komut giriniz." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, use fallback parser
    if (!apiKey) {
      const parsed = fallbackParse(message);
      return Response.json({
        success: true,
        parsed,
        source: "fallback",
      });
    }

    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserMessage(message) },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        const parsed = fallbackParse(message);
        return Response.json({
          success: true,
          parsed,
          source: "fallback",
        });
      }

      const parsed = JSON.parse(content);

      return Response.json({
        success: true,
        parsed,
        source: "gpt",
        usage: completion.usage,
      });
    } catch (aiError: any) {
      // If OpenAI fails, use fallback
      console.error("OpenAI error, using fallback:", aiError.message);
      const parsed = fallbackParse(message);
      return Response.json({
        success: true,
        parsed,
        source: "fallback",
        aiError: aiError.message,
      });
    }
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
