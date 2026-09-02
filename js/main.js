/* ============================= APP ENTRY POINT ============================= */
import { state } from './state.js';
import { dom } from './dom.js';
import { loadState } from './storage.js';
import { renderSidebar, renderMessages } from './render.js';
import { updateSendUI, handleSend, stopGenerating } from './chat.js';
import { initScroll } from './scroll.js';
import { initSidebarMobile } from './sidebar-mobile.js';
import { initInputBar } from './input-bar.js';
import { initSettingsModal, openSettingsModal } from './settings-modal.js';
import { initEvents } from './events.js';
import { applyTheme, DEFAULT_THEME } from './theme.js';
import { initAttachments } from './attachments.js';

function refreshInputAvailability(){
  var ready = !!state.settings.apiKey;
  dom.input.disabled = !ready;
  dom.input.placeholder = ready ? 'Ketik pesan...' : 'Isi API key di Settings untuk mulai →';
  if (!ready){
    dom.inputShell.addEventListener('click', openSettingsModal, { once: true });
  }
}

function init(){
  initScroll();
  initSidebarMobile();
  initInputBar(handleSend, stopGenerating);
  initSettingsModal();
  initAttachments();
  initEvents();

  loadState().then(function(){
    state.settings.theme = applyTheme(state.settings.theme || DEFAULT_THEME);
    renderSidebar();
    renderMessages();
    refreshInputAvailability();
    updateSendUI();
    if (!state.settings.apiKey) openSettingsModal();
  });
}

init();
