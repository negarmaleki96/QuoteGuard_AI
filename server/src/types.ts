export type FieldStatus = "Verified" | "Inferred" | "Missing" | "Needs Review"; export type DecisionStatus = "Ready for Review" | "Clarification Required" | "No Safe Match";

export type ExtractionField = {   label: string;   value: string;   status: FieldStatus;   evidence: string; };

export type CatalogItem = {   id: string;   name: string;   supplier: string;   material: string;   grade: string;   dimensions: string;   unit: string;   certifications: string[];   price: string;   evidence: string; };

export type AnalysisResponse = {   ok: true;   source: "deterministic" | "nicrron";   decision: DecisionStatus;   rfq: string;   fields: ExtractionField[];   missingFields: string[];   catalogMatches: Array<{     item: CatalogItem;     verified: boolean;     evidence: string[];     discrepancies: string[];   }>;   quoteDraft: {     itemId: string;     supplier: string;     price: string;     basis: string;   } | null;   evidence: string[];   prism: {     status: "pending" | "sent" | "unavailable";     note: string;   };   errors: string[]; };
