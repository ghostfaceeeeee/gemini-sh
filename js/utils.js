/* ============================= SMALL UTILITIES ============================= */
import { dom } from './dom.js';

export function uid(){
  return 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function fmtTime(ts){
  var d = new Date(ts);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

export function showToast(msg, type){
  var el = document.createElement('div');
  el.className = 'toast' + (type ? ' toast--' + type : '');
  el.textContent = msg;
  dom.toastContainer.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('toast--show'); });
  setTimeout(function(){
    el.classList.remove('toast--show');
    setTimeout(function(){ el.remove(); }, 250);
  }, 3200);
}
