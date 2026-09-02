/* ============================= INPUT BAR (textarea auto-resize + submit) ============================= */
import { dom } from './dom.js';
import { state } from './state.js';

export function autoResize(){
  dom.input.style.height = 'auto';
  dom.input.style.height = Math.min(dom.input.scrollHeight, 200) + 'px';
}

export function initInputBar(handleSend, stopGenerating){
  dom.input.addEventListener('input', autoResize);
  dom.input.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  });
  dom.sendBtn.addEventListener('click', function(){
    if (state.isStreaming) stopGenerating(); else handleSend();
  });
}
