/* ============================= AUTO-SCROLL BEHAVIOR ============================= */
import { dom } from './dom.js';

export function isNearBottom(){
  return dom.messagesWrap.scrollHeight - dom.messagesWrap.scrollTop - dom.messagesWrap.clientHeight < 140;
}

export function maybeAutoScroll(force){
  if (force || isNearBottom()){
    dom.messagesWrap.scrollTop = dom.messagesWrap.scrollHeight;
    dom.scrollBtn.classList.remove('show');
  } else {
    dom.scrollBtn.classList.add('show');
  }
}

export function initScroll(){
  dom.messagesWrap.addEventListener('scroll', function(){
    dom.scrollBtn.classList.toggle('show', !isNearBottom());
  });
  dom.scrollBtn.addEventListener('click', function(){
    dom.messagesWrap.scrollTo({ top: dom.messagesWrap.scrollHeight, behavior: 'smooth' });
  });
}
