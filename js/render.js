/* ============================= RENDERING: SIDEBAR & MESSAGES ============================= */
import { state, MODEL } from './state.js';
import { dom } from './dom.js';
import { escapeHtml, fmtTime } from './utils.js';
import { renderMarkdown } from './markdown.js';
import { getActiveConversation } from './conversation.js';
import { maybeAutoScroll } from './scroll.js';

/* ---------- Sidebar ---------- */
export function renderSidebar(){
  if (!state.conversations.length){
    dom.convList.innerHTML = '<div class="conv-empty">Belum ada chat</div>';
    return;
  }
  dom.convList.innerHTML = state.conversations.map(function(c){
    var active = c.id === state.activeId ? ' conv-row--active' : '';
    return '<div class="conv-row' + active + '" data-id="' + c.id + '">' +
      '<span class="conv-row__dot"></span>' +
      '<span class="conv-row__title">' + escapeHtml(c.title) + '</span>' +
      '<button class="conv-row__del" data-del="' + c.id + '" title="Delete">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
      '</button></div>';
  }).join('');
}

/* ---------- Messages ---------- */
function attachmentsHtml(attachments){
  if (!attachments || !attachments.length) return '';
  var items = attachments.map(function(a){
    if (a.kind === 'image'){
      return '<a class="msg-attach msg-attach--image" href="data:' + a.mime + ';base64,' + a.data + '" target="_blank" rel="noopener noreferrer">' +
        '<img src="data:' + a.mime + ';base64,' + a.data + '" alt="' + escapeHtml(a.name) + '" loading="lazy" decoding="async"></a>';
    }
    var icon = a.kind === 'document' ? '📄' : '📝';
    return '<div class="msg-attach msg-attach--file" title="' + escapeHtml(a.name) + '">' +
      '<span>' + icon + '</span><span class="msg-attach__name">' + escapeHtml(a.name) + '</span></div>';
  }).join('');
  return '<div class="message__attachments">' + items + '</div>';
}

function messageNode(msg, convo){
  var isUser = msg.role === 'user';
  var isError = msg.role === 'error';
  var displayName = state.settings.displayName || 'User';
  var avatarLetter = isUser ? (displayName.charAt(0).toUpperCase() || 'U') : (isError ? '!' : '✦');
  var name = isUser ? displayName : (isError ? 'Error' : 'Gemini');
  var cls = 'message ' + (isUser ? 'message--user' : (isError ? 'message--error' : 'message--model'));

  var isLastModel = !isUser && !isError && convo.messages[convo.messages.length - 1] === msg;
  var showCursor = state.isStreaming && isLastModel;
  var content = attachmentsHtml(msg.attachments) + renderMarkdown(msg.text) + (showCursor ? '<span class="cursor-blink">▊</span>' : '');
  if (!msg.text && showCursor) content = attachmentsHtml(msg.attachments) + '<span class="cursor-blink">▊</span>';

  var actions = '<div class="message__actions">' +
    '<button class="icon-btn copy-msg" data-copy-id="' + msg.id + '" title="Copy">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>';
  if (!isUser && !isError && isLastModel && !state.isStreaming){
    actions += '<button class="icon-btn regen-msg" title="Regenerate">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg></button>';
  }
  actions += '</div>';

  return '<div class="' + cls + '" data-msg-id="' + msg.id + '">' +
    '<div class="message__avatar">' + avatarLetter + '</div>' +
    '<div class="message__col">' +
      '<div class="message__meta"><span class="message__name">' + name + '</span><span class="message__time">' + fmtTime(msg.ts) + '</span></div>' +
      '<div class="message__content">' + content + '</div>' +
      actions +
    '</div></div>';
}

export function renderMessages(){
  var convo = getActiveConversation();
  dom.convTitleTop.textContent = convo ? convo.title : '';
  dom.modelBadgeText.textContent = MODEL;

  if (!convo || !convo.messages.length){
    dom.messages.innerHTML =
      '<div class="neofetch">' +
        '<div class="neofetch__prompt">' + escapeHtml((state.settings.displayName || 'user').toLowerCase()) + '<span class="dim">@</span><span class="accent">gemini</span></div>' +
        '<div class="neofetch__rule">─────────────────────</div>' +
        '<div class="neofetch__row"><span class="neofetch__key">os</span><span class="neofetch__val">gemini.sh v1.0</span></div>' +
        '<div class="neofetch__row"><span class="neofetch__key">model</span><span class="neofetch__val">' + escapeHtml(MODEL) + '</span></div>' +
        '<div class="neofetch__row"><span class="neofetch__key">theme</span><span class="neofetch__val">Catppuccin Mocha</span></div>' +
        '<div class="neofetch__row"><span class="neofetch__key">font</span><span class="neofetch__val">JetBrains Mono</span></div>' +
        '<div class="neofetch__row"><span class="neofetch__key">chats</span><span class="neofetch__val">' + state.conversations.length + '</span></div>' +
        '<div class="neofetch__swatches">' +
          ['--red', '--peach', '--yellow', '--green', '--teal', '--blue', '--mauve', '--pink'].map(function(v){
            return '<span style="background:var(' + v + ')"></span>';
          }).join('') +
        '</div>' +
        '<div class="neofetch__hint">ketik pesan untuk mulai<span class="cursor-blink">▊</span></div>' +
      '</div>';
    return;
  }

  dom.messages.innerHTML = convo.messages.map(function(m){ return messageNode(m, convo); }).join('');
  maybeAutoScroll(true);
}

// Streaming can emit many small chunks per second. Re-parsing Markdown and
// touching the DOM on every single chunk is wasteful — coalesce updates to
// at most once per animation frame (~60/s cap) instead.
var streamRaf = null;
var streamPendingMsg = null;

export function updateStreamingMessageDOM(msg){
  streamPendingMsg = msg;
  if (streamRaf !== null) return;
  streamRaf = requestAnimationFrame(function(){
    streamRaf = null;
    var m = streamPendingMsg;
    if (!m) return;
    var node = dom.messages.querySelector('[data-msg-id="' + m.id + '"] .message__content');
    if (node){
      var content = renderMarkdown(m.text);
      node.innerHTML = content + '<span class="cursor-blink">▊</span>';
      maybeAutoScroll(false);
    }
  });
}
