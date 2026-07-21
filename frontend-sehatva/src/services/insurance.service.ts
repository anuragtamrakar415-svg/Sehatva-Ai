import { apiRequest } from "./api";

export interface InsuranceClaim {
  id: string;
  diagnosis?: string | null;
  surgery?: string | null;
  required_documents?: unknown[] | null;
  government_schemes?: unknown[] | null;
  claim_checklist?: unknown[] | null;
  estimated_coverage_note?: string | null;
  status: string;
}

export const insuranceService = {
  listClaims: () => apiRequest<InsuranceClaim[]>("/insurance"),
  suggest: (payload: { diagnosis?: string; surgery?: string; report_id?: string }) =>
    apiRequest<InsuranceClaim>("/insurance/suggest", { method: "POST", body: JSON.stringify(payload) }),
};
