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
  initEvents();

  loadState().then(function(){
    renderSidebar();
    renderMessages();
    refreshInputAvailability();
    updateSendUI();
    if (!state.settings.apiKey) openSettingsModal();
  });
}

init();
