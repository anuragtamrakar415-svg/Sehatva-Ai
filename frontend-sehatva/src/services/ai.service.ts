import { apiRequest } from "./api";

export const aiService = {
  // Backend chat endpoint lives at /chat (not /ai/chat).
  chat: (message: string) => apiRequest<{ reply: string }>("/chat", { method: "POST", body: JSON.stringify({ message }) }),
  chatHistory: () => apiRequest<{ id: string; role: string; message: string; created_at: string }[]>("/chat/history"),
  // NOTE: backend has no dedicated /ai/scan OCR route. Prescription/report scanning
  // goes through POST /reports/discharge-summary/analyze as a multipart file upload -
  // wiring the Scan page to that is a separate follow-up (needs a file-upload flow, not JSON).
};
