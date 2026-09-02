/* ============================= GLOBAL APP STATE ============================= */
// Single mutable state object shared (by reference) across every module.
export const state = {
  settings: { apiKey: "", model: "gemini-2.5-flash", customModel: "" },
  conversations: [],
  activeId: null,
  isStreaming: false,
  abortController: null
};

export const KNOWN_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview"
];
