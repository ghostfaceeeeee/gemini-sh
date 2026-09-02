/* ============================= PERSISTENT STORAGE (localStorage) ============================= */
// Uses the browser's built-in localStorage so the app works on any real
// hosting (Netlify, GitHub Pages, your own server, etc). Wrapped in Promises
// so the rest of the app (which awaits/.then()s these) doesn't need to change.
import { state } from './state.js';

var PREFIX = 'gemini-sh:';

export function safeGet(key){
  try {
    var v = localStorage.getItem(PREFIX + key);
    return Promise.resolve(v);
  } catch (err) {
    console.error('storage get failed', key, err);
    return Promise.resolve(null);
  }
}

export function safeSet(key, value){
  try {
    localStorage.setItem(PREFIX + key, value);
    return Promise.resolve(true);
  } catch (err) {
    console.error('storage set failed', key, err);
    return Promise.resolve(null);
  }
}

export function persistSettings(){ safeSet('settings', JSON.stringify(state.settings)); }
export function persistConversations(){ safeSet('conversations', JSON.stringify(state.conversations)); }

export function loadState(){
  return Promise.all([safeGet('settings'), safeGet('conversations')]).then(function(res){
    var s = res[0], c = res[1];
    if (s) { try { Object.assign(state.settings, JSON.parse(s)); } catch (e) {} }
    if (c) { try { state.conversations = JSON.parse(c) || []; } catch (e) { state.conversations = []; } }
  });
}
