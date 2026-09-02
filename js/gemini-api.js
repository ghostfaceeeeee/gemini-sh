/* ============================= GEMINI STREAMING CLIENT ============================= */
import { state } from './state.js';

export function currentModelId(){
  return state.settings.model === 'custom' ? (state.settings.customModel || '').trim() : state.settings.model;
}

export function streamGemini(apiKey, model, contents, opts){
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) + ':streamGenerateContent?alt=sse&key=' + encodeURIComponent(apiKey);

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: contents }),
    signal: opts.signal
  }).then(function(res){
    if (!res.ok){
      return res.json().catch(function(){ return null; }).then(function(errJson){
        var msg = (errJson && errJson.error && errJson.error.message) || ('HTTP ' + res.status);
        throw new Error(msg);
      });
    }
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var fullText = '';

    function pump(){
      return reader.read().then(function(result){
        if (result.done) return fullText;
        buffer += decoder.decode(result.value, { stream: true });
        var idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1){
          var rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          var lines = rawEvent.split('\n');
          for (var i = 0; i < lines.length; i++){
            var line = lines[i];
            if (line.indexOf('data:') !== 0) continue;
            var jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              var parsed = JSON.parse(jsonStr);
              var candidate = parsed && parsed.candidates && parsed.candidates[0];
              var parts = candidate && candidate.content && candidate.content.parts;
              if (parts && parts.length){
                var chunk = parts.map(function(p){ return p.text || ''; }).join('');
                if (chunk){
                  fullText += chunk;
                  opts.onChunk(fullText);
                }
              }
            } catch (e) { /* partial/invalid chunk, skip */ }
          }
        }
        return pump();
      });
    }
    return pump();
  });
}
