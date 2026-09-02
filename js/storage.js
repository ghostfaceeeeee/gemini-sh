/* ============================= PERSISTENT STORAGE (window.storage) ============================= */
import { state } from './state.js';

export function safeGet(key){
  return window.storage.get(key, false).then(function(res){
    return res ? res.value : null;
  }).catch(function(){ return null; });
}

export function safeSet(key, value){
  return window.storage.set(key, value, false).catch(function(err){
    console.error('storage set failed', key, err);
    return null;
  });
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
