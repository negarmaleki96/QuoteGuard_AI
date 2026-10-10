
export type PrismStatus = "pending" | "sent" | "unavailable";

type PrismPayload = {
  rfq: string;
  decision: string;
  missingFields: string[];
  evidence: string[];
};

export async function sendPrismTrace(
  payload: unknown
): Promise<{ status: PrismStatus; note: string }> {
  const host = process.env.PRISMTRACE_HOST;
  const projectId = process.env.PRISMTRACE_PROJECT_ID;
  const apiKey = process.env.PRISMTRACE_API_KEY;

  if (!host || !projectId || !apiKey) {
    return {
      status: "pending",
      note: "PRISM credentials not configured; trace not sent.",
    };
  }

  const data = payload as PrismPayload;

  try {
    const response = await fetch(
      `${host.replace(/\/+$/, "")}/api/traces`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PRISMtrace-Key": apiKey,
        },
        body: JSON.stringify({
          project_id: projectId,
          model: "quoteguard-deterministic-v1",
          input_messages: [
            {
              role: "user",
              content: data.rfq,
            },
          ],
          output_message: [
            `Decision: ${data.decision}`,
            `Missing fields: ${data.missingFields.join(", ") || "None"}`,
            `Evidence: ${data.evidence.join("; ")}`,
          ].join("\n"),
          latency_ms: 0,
          agent_id: "quoteguard-ai",
          agent_name: "QuoteGuard AI",
          metadata: {
            source: "deterministic",
            decision: data.decision,
            missing_fields: data.missingFields,
          },
        }),
      }
    );

    if (!response.ok) {
      return {
        status: "unavailable",
        note: `PRISM rejected the trace (HTTP ${response.status}). Check the server logs and PRISM credentials.`,
      };
    }

    return {
      status: "sent",
      note: "Trace successfully submitted to PRISM.",
    };
  } catch {
    return {
      status: "unavailable",
      note: "Could not connect to PRISM. Check the network and server configuration.",
    };
  }
}
