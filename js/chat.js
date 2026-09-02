/* ============================= CHAT ORCHESTRATION (send / stream / regenerate) ============================= */
import { state } from './state.js';
import { dom } from './dom.js';
import { uid, showToast } from './utils.js';
import { getActiveConversation, createConversation } from './conversation.js';
import { renderSidebar, renderMessages, updateStreamingMessageDOM } from './render.js';
import { persistConversations } from './storage.js';
import { currentModelId, streamGemini } from './gemini-api.js';
import { openSettingsModal } from './settings-modal.js';
import { autoResize } from './input-bar.js';

export function updateSendUI(){
  dom.sendBtn.classList.toggle('send-btn--stop', state.isStreaming);
  dom.statusDot.classList.toggle('status-dot--busy', state.isStreaming);
  dom.sendBtn.innerHTML = state.isStreaming
    ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>'
    : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
}

export function stopGenerating(){
  if (state.abortController) state.abortController.abort();
}

export function runAssistantTurn(convo, model){
  state.isStreaming = true;
  updateSendUI();

  var modelMsg = { id: uid(), role: 'model', text: '', ts: Date.now() };
  convo.messages.push(modelMsg);
  renderMessages();

  var contents = convo.messages
    .filter(function(m){ return (m.role === 'user' || m.role === 'model') && m !== modelMsg; })
    .map(function(m){ return { role: m.role, parts: [{ text: m.text }] }; });

  state.abortController = new AbortController();

  streamGemini(state.settings.apiKey, model, contents, {
    signal: state.abortController.signal,
    onChunk: function(fullText){
      modelMsg.text = fullText;
      updateStreamingMessageDOM(modelMsg);
    }
  }).then(function(full){
    modelMsg.text = full || '_(respons kosong)_';
  }).catch(function(err){
    if (err && err.name === 'AbortError'){
      if (!modelMsg.text) modelMsg.text = '_Dihentikan._';
    } else {
      modelMsg.role = 'error';
      modelMsg.text = (err && err.message) || 'Gagal menghubungi Gemini.';
      showToast(modelMsg.text, 'error');
    }
  }).finally(function(){
    state.isStreaming = false;
    state.abortController = null;
    updateSendUI();
    renderMessages();
    persistConversations();
  });
}

export function handleSend(){
  var text = dom.input.value.trim();
  if (!text || state.isStreaming) return;

  if (!state.settings.apiKey){
    openSettingsModal();
    showToast('Isi API key Gemini dulu di Settings', 'error');
    return;
  }
  var model = currentModelId();
  if (!model){
    openSettingsModal();
    showToast('Model belum diisi di Settings', 'error');
    return;
  }

  var convo = getActiveConversation();
  if (!convo) convo = createConversation(text);

  convo.messages.push({ id: uid(), role: 'user', text: text, ts: Date.now() });
  dom.input.value = '';
  autoResize();
  renderSidebar();
  renderMessages();
  persistConversations();

  runAssistantTurn(convo, model);
}

export function regenerate(){
  var convo = getActiveConversation();
  if (!convo || state.isStreaming) return;
  while (convo.messages.length && convo.messages[convo.messages.length - 1].role !== 'user'){
    convo.messages.pop();
  }
  if (!convo.messages.length) return;
  var model = currentModelId();
  if (!model || !state.settings.apiKey){ openSettingsModal(); return; }
  renderMessages();
  runAssistantTurn(convo, model);
}
