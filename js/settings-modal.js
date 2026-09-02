/* ============================= SETTINGS MODAL ============================= */
// Only the API key is configurable — the model is fixed (see js/state.js).
import { state } from './state.js';
import { dom } from './dom.js';
import { persistSettings, persistConversations } from './storage.js';
import { renderSidebar, renderMessages } from './render.js';
import { showToast } from './utils.js';

export function openSettingsModal(){
  dom.apiKeyInput.value = state.settings.apiKey || '';
  dom.modalBackdrop.classList.add('show');
}

export function closeSettingsModal(){
  dom.modalBackdrop.classList.remove('show');
}

export function initSettingsModal(){
  dom.settingsBtnTop.addEventListener('click', openSettingsModal);
  dom.modalClose.addEventListener('click', closeSettingsModal);
  dom.modalBackdrop.addEventListener('click', function(e){
    if (e.target === dom.modalBackdrop) closeSettingsModal();
  });

  dom.toggleKeyVisibility.addEventListener('click', function(){
    var showing = dom.apiKeyInput.type === 'text';
    dom.apiKeyInput.type = showing ? 'password' : 'text';
    dom.eyeIcon.innerHTML = showing
      ? '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>'
      : '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  });

  dom.saveSettingsBtn.addEventListener('click', function(){
    state.settings.apiKey = dom.apiKeyInput.value.trim();
    persistSettings();
    renderMessages();
    closeSettingsModal();
    showToast('Settings disimpan', 'success');
  });

  dom.clearAllBtn.addEventListener('click', function(){
    if (!confirm('Hapus semua chat dan API key yang tersimpan? Tidak bisa dibatalkan.')) return;
    state.conversations = [];
    state.activeId = null;
    state.settings = { apiKey: '' };
    persistConversations();
    persistSettings();
    dom.apiKeyInput.value = '';
    renderSidebar();
    renderMessages();
    closeSettingsModal();
    showToast('Semua data dihapus', 'success');
  });
}
