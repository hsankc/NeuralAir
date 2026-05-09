import { NextRequest, NextResponse } from "next/server";

// ── /api/agent-decision ───────────────────────────────────────
// FleetAgent'ın GPT-4o-mini ile karar aldığı endpoint.
// API key yoksa 404 döner, FleetAgent fallback'e geçer.

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "no_api_key" }, { status: 404 });
  }

  try {
    const { missions, drones } = await req.json();

    const systemPrompt = `Sen NeuralAir'ın otonom filo yöneticisi yapay zeka ajanısın.
Sana açık drone görevleri ve müsait drone'ların listesi verilecek.
En optimal drone-görev eşleşmesini belirle.

Karar verirken şunları göz önünde bulundur:
- Drone'un göreve yakınlığı (mesafe)
- Drone'un tipi ve görev uyumluluğu (emergency → yangın, agricultural → ziraat)
- Drone'un batarya seviyesi (düşük bataryalı drone alma)
- Görevin ödeme miktarı (öncelik)

Cevabını SADECE JSON formatında ver, başka hiçbir şey yazma:
{ "droneId": <number>, "missionId": <number>, "reason": "<kısa Türkçe açıklama>" }`;

    const userPrompt = `Açık Görevler:
${JSON.stringify(missions, null, 2)}

Müsait Drone'lar:
${JSON.stringify(drones, null, 2)}

En iyi eşleşmeyi bul.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "openai_error" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    // JSON parse
    const decision = JSON.parse(content.trim());
    return NextResponse.json(decision);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
