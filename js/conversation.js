/* ============================= CONVERSATION DATA (CRUD) ============================= */
import { state } from './state.js';
import { uid } from './utils.js';
import { persistConversations } from './storage.js';
import { closeSidebarMobile } from './sidebar-mobile.js';
// Circular-but-safe: render.js imports getActiveConversation() from this file,
// and this file only calls into render.js from inside functions (not at
// module-evaluation time), which ES modules support fine.
import { renderSidebar, renderMessages } from './render.js';

export function getActiveConversation(){
  return state.conversations.find(function(c){ return c.id === state.activeId; }) || null;
}

export function createConversation(firstText){
  var title = firstText.trim().slice(0, 42);
  if (firstText.trim().length > 42) title += '…';
  var convo = { id: uid(), title: title || 'New chat', messages: [], createdAt: Date.now() };
  state.conversations.unshift(convo);
  state.activeId = convo.id;
  return convo;
}

export function deleteConversation(id){
  var convo = state.conversations.find(function(c){ return c.id === id; });
  if (!convo) return;
  if (!confirm('Hapus chat "' + convo.title + '"? Tidak bisa dibatalkan.')) return;
  state.conversations = state.conversations.filter(function(c){ return c.id !== id; });
  if (state.activeId === id) state.activeId = state.conversations.length ? state.conversations[0].id : null;
  persistConversations();
  renderSidebar();
  renderMessages();
}

export function selectConversation(id){
  if (state.isStreaming) return;
  state.activeId = id;
  renderSidebar();
  renderMessages();
  closeSidebarMobile();
}

export function newChat(){
  if (state.isStreaming) return;
  state.activeId = null;
  renderSidebar();
  renderMessages();
  document.getElementById('input').focus();
  closeSidebarMobile();
}
