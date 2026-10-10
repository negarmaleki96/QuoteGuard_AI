import { z } from "zod";

const responseSchema = z.object({   fields: z.array(z.object({ label: z.string(), value: z.string(), status: z.enum(["Verified", "Inferred", "Missing", "Needs Review"]), evidence: z.string() })),   missingFields: z.array(z.string()),   evidence: z.array(z.string()),   decision: z.enum(["Ready for Review", "Clarification Required", "No Safe Match"]), });

export async function analyzeWithNicrron(rfq: string) {   const apiKey = process.env.NICRRON_API_KEY;   const baseUrl = process.env.NICRRON_BASE_URL ?? "https\://api.nicrron.ai/v1";   const model = process.env.NICRRON_MODEL ?? "nicrron/auto";   if (!apiKey) throw new Error("NICRRON_API_KEY is not configured on the server.");

  const controller = new AbortController();   const timeout = setTimeout(() => controller.abort(), 15000);   try {     const response = await fetch(`${baseUrl}/chat/completions`, {       method: "POST",       signal: controller.signal,       headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },       body: JSON.stringify({         model,         messages: [           { role: "system", content: "Extract RFQ fields into strict JSON only." },           { role: "user", content: rfq },         ],         response_format: { type: "json_object" },       }),     });

    if (!response.ok) throw new Error(`Nicrron request failed with status ${response.status}`);     const json = await response.json();     const content = json?.choices?.[0]?.message?.content;     const parsed = typeof content === "string" ? JSON.parse(content) : content;     return responseSchema.parse(parsed);   } finally {     clearTimeout(timeout);   } }
