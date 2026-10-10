export type FieldStatus = "Verified" | "Inferred" | "Missing" | "Needs Review"; export type DecisionStatus = "Ready for Review" | "Clarification Required" | "No Safe Match";

export type AnalysisResponse = {   ok: true;   source: "deterministic" | "nicrron";   decision: DecisionStatus;   rfq: string;   fields: Array<{ label: string; value: string; status: FieldStatus; evidence: string }>;   missingFields: string[];   catalogMatches: Array<{ item: Record<string, unknown>; verified: boolean; evidence: string[]; discrepancies: string[] }>;   quoteDraft: null | { itemId: string; supplier: string; price: string; basis: string };   evidence: string[];   prism: { status: "pending" | "sent" | "unavailable"; note: string };   errors: string[]; };

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export async function analyzeRfq(rfq: string): Promise<AnalysisResponse> {   const response = await fetch(`${baseUrl}/api/analyze`, {     method: "POST",     headers: { "Content-Type": "application/json" },     body: JSON.stringify({ rfq }),   });

  if (!response.ok) {     throw new Error(`Backend request failed with status ${response.status}`);   }

  return response.json(); }
