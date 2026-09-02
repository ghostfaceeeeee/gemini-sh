/* ============================= REMAINING EVENT WIRING ============================= */
// Sidebar new-chat/list, mobile settings entry point, message action
// delegation (copy/copy-code/regenerate), and global keyboard shortcuts.
import { state } from './state.js';
import { dom } from './dom.js';
import { showToast } from './utils.js';
import { newChat, selectConversation, deleteConversation, getActiveConversation } from './conversation.js';
import { regenerate } from './chat.js';
import { openSettingsModal } from './settings-modal.js';
import { closeSettingsModal } from './settings-modal.js';
import { closeSidebarMobile } from './sidebar-mobile.js';

export function initEvents(){
  /* ---------- Sidebar: new chat + conversation list ---------- */
  dom.newChatBtn.addEventListener('click', newChat);

  dom.convList.addEventListener('click', function(e){
    var delBtn = e.target.closest('[data-del]');
    if (delBtn){ e.stopPropagation(); deleteConversation(delBtn.getAttribute('data-del')); return; }
    var row = e.target.closest('.conv-row');
    if (row) selectConversation(row.getAttribute('data-id'));
  });

  /* ---------- Settings entry point from the sidebar (mobile-aware) ---------- */
  dom.settingsBtnSidebar.addEventListener('click', function(){
    openSettingsModal();
    closeSidebarMobile();
  });

  /* ---------- Message actions: copy code / copy message / regenerate ---------- */
  dom.messages.addEventListener('click', function(e){
    var copyCodeBtn = e.target.closest('.copy-btn');
    if (copyCodeBtn){
      var code = decodeURIComponent(copyCodeBtn.getAttribute('data-code'));
      navigator.clipboard.writeText(code).then(function(){
        var orig = copyCodeBtn.textContent;
        copyCodeBtn.textContent = 'Copied!';
        setTimeout(function(){ copyCodeBtn.textContent = orig; }, 1400);
      }).catch(function(){ showToast('Gagal copy', 'error'); });
      return;
    }
    var copyMsgBtn = e.target.closest('.copy-msg');
    if (copyMsgBtn){
      var convo = getActiveConversation();
      var msg = convo && convo.messages.find(function(m){ return m.id === copyMsgBtn.getAttribute('data-copy-id'); });
      if (msg){
        navigator.clipboard.writeText(msg.text).then(function(){ showToast('Disalin', 'success'); })
          .catch(function(){ showToast('Gagal copy', 'error'); });
      }
      return;
    }
    if (e.target.closest('.regen-msg')){ regenerate(); }
  });

  /* ---------- Global keyboard shortcuts ---------- */
  document.addEventListener('keydown', function(e){
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k'){ e.preventDefault(); newChat(); }
    if (e.key === 'Escape'){ closeSettingsModal(); closeSidebarMobile(); }
  });
}
