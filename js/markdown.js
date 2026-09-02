/* ============================= MARKDOWN (safe, minimal) ============================= */
import { escapeHtml } from './utils.js';

export function renderMarkdown(raw){
  if (!raw) return '';
  var codeBlocks = [];
  var text = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_, lang, code){
    var idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', code: code.replace(/\n$/, '') });
    return '\u0000CB' + idx + '\u0000';
  });

  text = escapeHtml(text);

  text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  text = text.replace(/^(?:-|\*)\s+(.*)$/gm, '\u0001LI\u0001$1\u0002');
  text = text.replace(/(\u0001LI\u0001.*\u0002\n?)+/g, function(m){
    var items = m.split('\u0002').filter(function(s){ return s.indexOf('\u0001LI\u0001') !== -1; });
    var lis = items.map(function(s){ return '<li>' + s.replace('\u0001LI\u0001', '') + '</li>'; }).join('');
    return '<ul>' + lis + '</ul>';
  });

  var blocks = text.split(/\n{2,}/);
  text = blocks.map(function(b){
    var t = b.trim();
    if (!t) return '';
    if (t.indexOf('<ul>') === 0) return t;
    return '<p>' + t.replace(/\n/g, '<br>') + '</p>';
  }).join('');

  text = text.replace(/\u0000CB(\d+)\u0000/g, function(_, i){
    var block = codeBlocks[parseInt(i, 10)];
    var lang = block.lang || 'text';
    var escaped = escapeHtml(block.code);
    var encoded = encodeURIComponent(block.code);
    return '<div class="code-block"><div class="code-block-header"><span>' + escapeHtml(lang) +
      '</span><button class="copy-btn" data-code="' + encoded + '">Copy</button></div><pre><code>' +
      escaped + '</code></pre></div>';
  });

  return text;
}
