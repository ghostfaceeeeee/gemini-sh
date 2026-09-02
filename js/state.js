/* ============================= GLOBAL APP STATE ============================= */
// Single mutable state object shared (by reference) across every module.

// Only one model is offered — keeping the app simple (no model picker).
// If Google renames/deprecates this model later, just change it here.
export const MODEL = "gemini-3.7-flash";

export const state = {
  settings: { apiKey: "", displayName: "User", theme: "mocha" },
  conversations: [],
  activeId: null,
  isStreaming: false,
  abortController: null
};
