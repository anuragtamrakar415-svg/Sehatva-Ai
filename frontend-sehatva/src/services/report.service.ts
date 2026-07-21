import { apiRequest, apiUpload } from "./api";

export interface DischargeSummary {
  diagnosis?: string | null;
  disease?: string | null;
  surgery?: string | null;
  medicines?: { name: string; dosage?: string | null; frequency?: string | null }[];
  lifestyle_advice?: string[];
  diet_restrictions?: string[];
  emergency_warning_signs?: string[];
  follow_up_date?: string | null;
  follow_up_doctor?: string | null;
  important_notes?: string[];
  plain_language_summary?: string;
}

interface BackendReport {
  id: string;
  report_type: string;
  report_subtype?: string | null;
  ai_summary?: DischargeSummary | Record<string, unknown> | null;
  status: string;
  created_at: string;
}

export const reportService = {
  list: () => apiRequest<BackendReport[]>("/reports"),
  explain: (report_subtype: string, raw_text: string) =>
    apiRequest<BackendReport>("/reports/explain", { method: "POST", body: JSON.stringify({ report_subtype, raw_text }) }),
  analyzeDischargeSummary: (file: File, language = "English") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    return apiUpload<BackendReport>("/reports/discharge-summary/analyze", formData);
  },
};
