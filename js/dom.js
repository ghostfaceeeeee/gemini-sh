/* ============================= DOM ELEMENT REFERENCES ============================= */
// Centralized lookup so every module shares the same references instead of
// re-querying the document. Safe to run at module load time because
// `type="module"` scripts execute after the HTML has been parsed.
const $ = (id) => document.getElementById(id);

export const dom = {
  // Sidebar
  sidebar: $('sidebar'),
  scrim: $('scrim'),
  convList: $('convList'),
  newChatBtn: $('newChatBtn'),
  settingsBtnSidebar: $('settingsBtnSidebar'),

  // Topbar
  menuToggle: $('menuToggle'),
  statusDot: $('statusDot'),
  modelBadgeText: $('modelBadgeText'),
  convTitleTop: $('convTitleTop'),
  settingsBtnTop: $('settingsBtnTop'),

  // Messages
  messagesWrap: $('messagesWrap'),
  messages: $('messages'),
  scrollBtn: $('scrollBtn'),

  // Input bar
  input: $('input'),
  sendBtn: $('sendBtn'),
  inputShell: $('inputShell'),

  // Settings modal
  modalBackdrop: $('modalBackdrop'),
  modalClose: $('modalClose'),
  apiKeyInput: $('apiKeyInput'),
  toggleKeyVisibility: $('toggleKeyVisibility'),
  eyeIcon: $('eyeIcon'),
  saveSettingsBtn: $('saveSettingsBtn'),
  clearAllBtn: $('clearAllBtn'),

  // Toasts
  toastContainer: $('toastContainer')
};
