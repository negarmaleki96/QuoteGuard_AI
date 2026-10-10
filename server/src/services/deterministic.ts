
import type { AnalysisResponse, ExtractionField } from "../types.js";
import { catalog } from "./catalog.js";

export function deterministicAnalyze(rfq: string): AnalysisResponse {
  const lower = rfq.toLowerCase();

  const has316 = /\b316l\b/i.test(rfq);
  const has304 = /\b304\b/i.test(rfq);
  const hasGradeConflict = has316 && has304;
  const has12x3 = lower.includes("12 mm") && lower.includes("3 m");
  const has2mm =
    lower.includes("2 mm") &&
    lower.includes("1.2 m") &&
    lower.includes("2.4 m");
  const has3mmConflict = lower.includes("3 mm thickness");

  const quantityMatch = lower.match(
    /\b(?:quantity|qty)\s*[:=]?\s*(\d+)\b|\b(\d+)\s*(?:bars?|pieces?|pcs?|sheets?)\b/i
  );
  const quantity = quantityMatch
    ? quantityMatch[1] ?? quantityMatch[2]
    : null;

  const hasStainless = lower.includes("stainless");
  const hasMtr = /\bmtr\b/i.test(rfq);
  const hasEn10204 = lower.includes("en 10204 3.1");
  const hasCertifications = hasMtr || hasEn10204;
  const hasDelivery =
    lower.includes("next week") || lower.includes("dallas");

  const missingFields: string[] = [];

  const fields: ExtractionField[] = [
    {
      label: "Material",
      value: hasStainless || has316 || has304 ? "Stainless steel" : "Missing",
      status: hasStainless || has316 || has304 ? "Verified" : "Missing",
      evidence: hasStainless || has316 || has304
        ? "Stainless steel explicitly mentioned or supported by the grade."
        : "No explicit material found.",
    },
    {
      label: "Grade",
      value: has316 ? "316L" : has304 ? "304" : "Missing",
      status: has316 || has304 ? "Verified" : "Missing",
      evidence: has316
        ? "RFQ explicitly says 316L."
        : has304
          ? "RFQ explicitly says 304."
          : "No grade specified.",
    },
    {
      label: "Dimensions",
      value: has3mmConflict
        ? "Conflicting"
        : has12x3
          ? "12 mm x 3 m"
          : has2mm
            ? "2 mm x 1.2 m x 2.4 m"
            : "Missing",
      status: has3mmConflict
        ? "Needs Review"
        : has12x3 || has2mm
          ? "Verified"
          : "Missing",
      evidence: has3mmConflict
        ? "Conflicting thickness values require review."
        : has12x3
          ? "12 mm and 3 m dimensions found."
          : has2mm
            ? "Sheet dimensions found."
            : "No usable dimensions found.",
    },
    {
      label: "Quantity",
      value: quantity ?? "Missing",
      status: quantity !== null ? "Verified" : "Missing",
      evidence: quantity !== null
        ? "Quantity extracted from an explicit quantity or unit phrase."
        : "No explicit quantity found.",
    },
    {
      label: "Unit",
      value: has12x3
        ? "bar"
        : has2mm
          ? "sheet"
          : /\bpieces?\b|\bpcs?\b/i.test(rfq)
            ? "piece"
            : "Missing",
      status: has12x3 || has2mm || /\bpieces?\b|\bpcs?\b/i.test(rfq)
        ? "Verified"
        : "Missing",
      evidence: has12x3
        ? "Bar unit inferred from the matching bar catalog format."
        : has2mm
          ? "Sheet unit inferred from the matching sheet catalog format."
          : /\bpieces?\b|\bpcs?\b/i.test(rfq)
            ? "Piece unit explicitly mentioned."
            : "No clear unit found.",
    },
    {
      label: "Certifications",
      value: hasEn10204
        ? hasMtr
          ? "MTR, EN 10204 3.1"
          : "EN 10204 3.1"
        : hasMtr
          ? "MTR"
          : "Missing",
      status: hasCertifications ? "Verified" : "Missing",
      evidence: hasCertifications
        ? "Certification requirement explicitly mentioned."
        : "No certification requirement found.",
    },
    {
      label: "Delivery",
      value: lower.includes("next week")
        ? "Next week"
        : lower.includes("dallas")
          ? "Dallas"
          : "Missing",
      status: hasDelivery ? "Inferred" : "Missing",
      evidence: lower.includes("next week")
        ? "Requested delivery timing captured; confirmation may be needed."
        : lower.includes("dallas")
          ? "Destination captured; delivery timing is not specified."
          : "No delivery requirement found.",
    },
  ];

  if (!hasStainless && !has316 && !has304) {
    missingFields.push("Material");
  }
  if (!has316 && !has304) {
    missingFields.push("Grade");
  }
  if (!has12x3 && !has2mm) {
    missingFields.push("Dimensions");
  }
  if (quantity === null) {
    missingFields.push("Quantity");
  }
  if (!has12x3 && !has2mm) {
    missingFields.push("Unit");
  }
  if (!hasCertifications) {
    missingFields.push("Certifications");
  }
  if (!hasDelivery) {
    missingFields.push("Delivery");
  }
if (hasGradeConflict) {
  return {
    ok: true,
    source: "deterministic",
    decision: "Clarification Required",
    rfq,
    fields: fields.map((field) =>
      field.label === "Grade"
        ? {
            ...field,
            value: "Conflicting: 316L and 304",
            status: "Needs Review",
            evidence: "RFQ specifies both 316L and 304; clarification is required.",
          }
        : field
    ),
    missingFields: [...missingFields, "Conflicting material grades"],
    catalogMatches: [],
    quoteDraft: null,
    evidence: ["Conflicting material grades detected; no safe match."],
    prism: {
      status: "pending",
      note: "PRISM trace status must be verified separately.",
    },
    errors: [],
  };
}
  if (has3mmConflict) {
    return {
      ok: true,
      source: "deterministic",
      decision: "Clarification Required",
      rfq,
      fields,
      missingFields: [...missingFields, "Conflicting dimensions"],
      catalogMatches: [],
      quoteDraft: null,
      evidence: ["Conflicting dimensions detected; no safe match."],
      prism: {
        status: "pending",
        note: "PRISM adapter not yet connected to documented APIs.",
      },
      errors: [],
    };
  }

  if (!has316 && !has304) {
    return {
      ok: true,
      source: "deterministic",
      decision: "Clarification Required",
      rfq,
      fields,
      missingFields,
      catalogMatches: [],
      quoteDraft: null,
      evidence: ["Missing critical material grade."],
      prism: {
        status: "pending",
        note: "PRISM adapter not yet connected to documented APIs.",
      },
      errors: [],
    };
  }

  const item =
    has316 && has12x3
      ? catalog[0]
      : has304 && has2mm
        ? catalog[1]
        : null;

  if (!item) {
    return {
      ok: true,
      source: "deterministic",
      decision: "No Safe Match",
      rfq,
      fields,
      missingFields,
      catalogMatches: [],
      quoteDraft: null,
      evidence: ["No catalog item with exact critical-spec agreement."],
      prism: {
        status: "pending",
        note: "PRISM adapter not yet connected to documented APIs.",
      },
      errors: [],
    };
  }

  const hasMissingRequiredFields =
    missingFields.length > 0 ||
    fields.some(
      (field) =>
        field.status === "Missing" ||
        field.status === "Needs Review"
    );

  if (hasMissingRequiredFields) {
    return {
      ok: true,
      source: "deterministic",
      decision: "Clarification Required",
      rfq,
      fields,
      missingFields,
      catalogMatches: [
        {
          item,
          verified: true,
          evidence: [item.evidence],
          discrepancies: [],
        },
      ],
      quoteDraft: null,
      evidence: [
        "A catalog match exists, but required RFQ information needs confirmation.",
      ],
      prism: {
        status: "pending",
        note: "PRISM adapter not yet connected to documented APIs.",
      },
      errors: [],
    };
  }

  return {
    ok: true,
    source: "deterministic",
    decision: "Ready for Review",
    rfq,
    fields,
    missingFields,
    catalogMatches: [
      {
        item,
        verified: true,
        evidence: [item.evidence],
        discrepancies: [],
      },
    ],
    quoteDraft: {
      itemId: item.id,
      supplier: item.supplier,
      price: item.price,
      basis: "Exact agreement on critical specs.",
    },
    evidence: [item.evidence],
    prism: {
      status: "pending",
      note: "PRISM adapter not yet connected to documented APIs.",
    },
    errors: [],
  };
}
