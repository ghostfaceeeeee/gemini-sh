/* ============================= GEMINI STREAMING CLIENT (Interactions API) ============================= */
// As of mid-2026, Google's REST endpoint for new API keys moved from
// `models/{model}:streamGenerateContent` to the unified Interactions API
// (`POST /v1beta/interactions`). Docs: https://ai.google.dev/gemini-api/docs/interactions
import { MODEL } from './state.js';

export function currentModelId(){
  return MODEL;
}

// Turns our locally-stored conversation (array of {role, text, attachments?})
// into the Interactions API's stateless `input` step array. We manage history
// on the client (matches how this app already stores conversations locally),
// so every request sends `store: false` and the full turn history — no
// previous_interaction_id bookkeeping needed.
function buildInteractionsInput(messages){
  return messages.map(function(m){
    if (m.role === 'user'){
      var atts = m.attachments || [];
      if (!atts.length){
        return { type: 'user_input', content: m.text };
      }
      var blocks = [];
      if (m.text) blocks.push({ type: 'text', text: m.text });
      atts.forEach(function(a){
        if (a.kind === 'image'){
          blocks.push({ type: 'image', data: a.data, mime_type: a.mime });
        } else if (a.kind === 'document'){
          blocks.push({ type: 'document', data: a.data, mime_type: a.mime });
        } else if (a.kind === 'text'){
          blocks.push({ type: 'text', text: '--- file: ' + a.name + ' ---\n' + a.text + '\n--- end file ---' });
        }
      });
      return { type: 'user_input', content: blocks };
    }
    return { type: 'model_output', content: [{ type: 'text', text: m.text }] };
  });
}

export function streamGemini(apiKey, messages, opts){
  var url = 'https://generativelanguage.googleapis.com/v1beta/interactions?alt=sse';

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      stream: true,
      input: buildInteractionsInput(messages)
    }),
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
          var dataStr = null;
          for (var i = 0; i < lines.length; i++){
            if (lines[i].indexOf('data:') === 0){ dataStr = lines[i].slice(5).trim(); }
          }
          if (dataStr){
            var parsed = null;
            try { parsed = JSON.parse(dataStr); } catch (e) { /* partial/invalid chunk, skip */ }
            if (parsed){
              // Only text deltas from the model's output step matter here;
              // "thought_signature" deltas (internal reasoning) are skipped.
              if (parsed.event_type === 'step.delta' && parsed.delta && parsed.delta.type === 'text' && parsed.delta.text){
                fullText += parsed.delta.text;
                opts.onChunk(fullText);
              } else if (parsed.event_type === 'interaction.failed'){
                var failMsg = (parsed.interaction && parsed.interaction.error && parsed.interaction.error.message) || 'Interaksi gagal.';
                throw new Error(failMsg);
              }
            }
          }
        }
        return pump();
      });
    }
    return pump();
  });
}
