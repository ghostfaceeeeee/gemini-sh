/* ============================= ATTACHMENTS (upload docs/photos) ============================= */
// Handles picking, reading, and (for images) client-side compressing files
// before they're either queued to send with the next message or discarded.
import { dom } from './dom.js';
import { state } from './state.js';
import { uid, escapeHtml, showToast } from './utils.js';

var MAX_ATTACHMENTS = 5;
var MAX_IMAGE_DIM = 1568;       // longest edge, px — matches Gemini's recommended vision input size
var IMAGE_QUALITY = 0.82;       // JPEG re-encode quality (keeps payload + localStorage usage small)
var MAX_DOC_BYTES = 8 * 1024 * 1024;
var MAX_TEXT_CHARS = 40000;

var TEXT_EXTENSIONS = ['txt','md','csv','json','js','ts','jsx','tsx','py','html','css','java','c','cpp','h','go','rs','sh','yml','yaml','xml','log','ini','conf'];

function extOf(name){
  var m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

export function formatBytes(n){
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

function readFileAsDataURL(file){
  return new Promise(function(resolve, reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(reader.result); };
    reader.onerror = function(){ reject(reader.error || new Error('read failed')); };
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file){
  return new Promise(function(resolve, reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(reader.result); };
    reader.onerror = function(){ reject(reader.error || new Error('read failed')); };
    reader.readAsText(file);
  });
}

// Downscale + re-encode as JPEG in an offscreen canvas — keeps large phone
// photos from bloating the request payload and localStorage.
function compressImage(dataUrl){
  return new Promise(function(resolve, reject){
    var img = new Image();
    img.onload = function(){
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, MAX_IMAGE_DIM / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cw, ch);
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };
    img.onerror = function(){ reject(new Error('Gagal memuat gambar')); };
    img.src = dataUrl;
  });
}

function dataUrlToBase64(dataUrl){
  var idx = dataUrl.indexOf(',');
  return idx !== -1 ? dataUrl.slice(idx + 1) : dataUrl;
}

async function processFile(file){
  if (file.type.indexOf('image/') === 0){
    var rawDataUrl = await readFileAsDataURL(file);
    var compressed = await compressImage(rawDataUrl);
    var base64 = dataUrlToBase64(compressed);
    return { id: uid(), name: file.name, mime: 'image/jpeg', kind: 'image', data: base64, size: Math.round(base64.length * 0.75) };
  }
  if (file.type === 'application/pdf'){
    if (file.size > MAX_DOC_BYTES){ showToast(file.name + ' terlalu besar (maks 8MB)', 'error'); return null; }
    var pdfDataUrl = await readFileAsDataURL(file);
    return { id: uid(), name: file.name, mime: 'application/pdf', kind: 'document', data: dataUrlToBase64(pdfDataUrl), size: file.size };
  }
  var ext = extOf(file.name);
  if (TEXT_EXTENSIONS.indexOf(ext) !== -1 || file.type.indexOf('text/') === 0){
    var text = await readFileAsText(file);
    if (text.length > MAX_TEXT_CHARS) text = text.slice(0, MAX_TEXT_CHARS) + '\n...(dipotong, file terlalu panjang)';
    return { id: uid(), name: file.name, mime: file.type || 'text/plain', kind: 'text', text: text, size: file.size };
  }
  showToast('Tipe file "' + file.name + '" tidak didukung', 'error');
  return null;
}

export async function handleFiles(fileList){
  var files = Array.prototype.slice.call(fileList || []);
  if (!files.length) return;
  var room = MAX_ATTACHMENTS - state.pendingAttachments.length;
  if (files.length > room){
    showToast('Maksimal ' + MAX_ATTACHMENTS + ' lampiran per pesan', 'error');
    files = files.slice(0, Math.max(0, room));
  }
  for (var i = 0; i < files.length; i++){
    try {
      var result = await processFile(files[i]);
      if (result) state.pendingAttachments.push(result);
    } catch (e) {
      showToast('Gagal memproses ' + files[i].name, 'error');
    }
  }
  renderAttachmentsPreview();
}

export function removeAttachment(id){
  state.pendingAttachments = state.pendingAttachments.filter(function(a){ return a.id !== id; });
  renderAttachmentsPreview();
}

export function clearAttachments(){
  state.pendingAttachments = [];
  renderAttachmentsPreview();
}

export function renderAttachmentsPreview(){
  var wrap = dom.attachmentsPreview;
  if (!state.pendingAttachments.length){
    wrap.innerHTML = '';
    return;
  }
  wrap.innerHTML = state.pendingAttachments.map(function(a){
    if (a.kind === 'image'){
      return '<div class="attach-chip attach-chip--image" data-id="' + a.id + '">' +
        '<img src="data:' + a.mime + ';base64,' + a.data + '" alt="' + escapeHtml(a.name) + '" loading="lazy" decoding="async">' +
        '<button class="attach-chip__remove" data-remove="' + a.id + '" type="button" title="Hapus">&times;</button></div>';
    }
    var icon = a.kind === 'document' ? '📄' : '📝';
    return '<div class="attach-chip attach-chip--file" data-id="' + a.id + '" title="' + escapeHtml(a.name) + ' (' + formatBytes(a.size) + ')">' +
      '<span class="attach-chip__icon">' + icon + '</span>' +
      '<span class="attach-chip__name">' + escapeHtml(a.name) + '</span>' +
      '<button class="attach-chip__remove" data-remove="' + a.id + '" type="button" title="Hapus">&times;</button></div>';
  }).join('');
}

export function initAttachments(){
  dom.attachBtn.addEventListener('click', function(){ dom.fileInput.click(); });
  dom.fileInput.addEventListener('change', function(){
    handleFiles(dom.fileInput.files);
    dom.fileInput.value = '';
  });
  dom.attachmentsPreview.addEventListener('click', function(e){
    var btn = e.target.closest('[data-remove]');
    if (btn) removeAttachment(btn.getAttribute('data-remove'));
  });
}
