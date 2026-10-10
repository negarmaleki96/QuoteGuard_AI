import { z } from "zod"; import { deterministicAnalyze } from "./deterministic.js"; import { analyzeWithNicrron } from "./nicrron.js"; import { sendPrismTrace } from "./prism.js";

const requestSchema = z.object({ rfq: z.string().trim().min(1).max(12000) });

export async function analyzeRfq(body: unknown) {   const parsed = requestSchema.safeParse(body);   if (!parsed.success) {     throw new Error("Request body must contain a non-empty rfq string.");   }

  const rfq = parsed.data.rfq;   const deterministic = deterministicAnalyze(rfq);   let result = deterministic;

  try {     const nicrron = await analyzeWithNicrron(rfq);     result = { ...deterministic, source: "nicrron", fields: nicrron.fields, missingFields: nicrron.missingFields, evidence: nicrron.evidence, decision: nicrron.decision };   } catch {     result = deterministic;   }

  result.prism = await sendPrismTrace({     rfq,     decision: result.decision,     missingFields: result.missingFields,     evidence: result.evidence,   });

  return result; }
