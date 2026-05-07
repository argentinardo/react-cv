(function () {

  /* ── Estilos ─────────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-cve-style', '1');
  styleEl.textContent = `
    #cvtb {
      position: fixed; bottom: 20px; right: 20px;
      background: #1a1a2e; color: #fff;
      border-radius: 10px; padding: 10px 16px;
      display: flex; align-items: center; gap: 10px;
      font-family: 'Segoe UI', sans-serif; font-size: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,.45); z-index: 9999;
      user-select: none;
    }
    #cvtb span { opacity: .6; font-weight: 700; letter-spacing: .5px; }
    #cvtb button {
      border: 1px solid rgba(255,255,255,.25); background: none; color: #fff;
      padding: 5px 12px; border-radius: 5px; cursor: pointer;
      font-size: 12px; transition: background .15s; white-space: nowrap;
    }
    #cvtb button:hover  { background: rgba(255,255,255,.12); }
    #cvtb .sv           { background: #c0392b; border-color: #c0392b; }
    #cvtb .sv:hover     { background: #a93226; }
    #cvtb .dl           { padding: 5px 10px; font-size: 14px; }

    [contenteditable="true"] {
      outline: 2px solid #3498db !important;
      border-radius: 2px;
      background: rgba(52,152,219,.07) !important;
      cursor: text; min-height: 1em;
    }
    [contenteditable="true"]:focus { outline-color: #2980b9 !important; }

    /* El botón × no debe tomar estilos de campo editable */
    .cve-del, .cve-drag { outline: none !important; background-color: initial; }

    .cve-hint [data-cve]:hover:not([contenteditable="true"]) {
      outline: 1px dashed rgba(52,152,219,.4);
      border-radius: 2px; cursor: pointer;
    }

    /* Botón × (eliminar item) */
    .cve-del {
      position: absolute;
      right: 1px; top: 50%;
      transform: translateY(-50%);
      width: 15px; height: 15px;
      background: rgba(231,76,60,.15) !important;
      color: #c0392b;
      border: 1px solid rgba(231,76,60,.35);
      border-radius: 50%;
      cursor: pointer;
      font-size: 10px; font-weight: 900; line-height: 1;
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0;
      transition: background .15s;
    }
    .cve-del:hover { background: #e74c3c !important; color: #fff; border-color: #e74c3c; }

    /* Handle de drag (⠿) */
    .cve-drag {
      position: absolute;
      right: 20px; top: 50%;
      transform: translateY(-50%);
      width: 14px; height: 14px;
      display: inline-flex; align-items: center; justify-content: center;
      color: #bbb;
      font-size: 12px; line-height: 1;
      cursor: grab;
      user-select: none;
      border-radius: 2px;
      transition: color .15s;
    }
    .cve-drag:hover { color: #666; }
    .cve-drag:active { cursor: grabbing; }

    /* Botón + (agregar item) */
    .cve-add {
      display: block;
      margin-top: 5px;
      background: rgba(39,174,96,.1);
      color: #27ae60;
      border: 1px dashed rgba(39,174,96,.6);
      border-radius: 4px;
      padding: 3px 0;
      cursor: pointer;
      font-size: 11px; font-weight: 700;
      width: 100%; text-align: center;
      transition: background .15s;
    }
    .cve-add:hover { background: #27ae60; color: #fff; border-style: solid; }

    /* Espacio para × y drag handle en modo edición */
    .cve-editing .exp-list li,
    .cve-editing .tech-list li,
    .cve-editing .soft-skills-list li { padding-right: 38px; }

    .tech-list li,
    .soft-skills-list li { position: relative; }

    /* Feedback visual durante drag & drop */
    .cve-dragging        { opacity: 0.35; }
    .cve-dragover-top    { border-top: 2px solid #3498db !important; }
    .cve-dragover-bottom { border-bottom: 2px solid #3498db !important; }

    @media print {
      #cvtb, .cve-del, .cve-add, .cve-drag { display: none !important; }
    }
  `;
  document.head.appendChild(styleEl);

  /* ── Estado ──────────────────────────────────────────────────────── */
  let fileHandle = null;
  let editMode   = false;
  let toolbarEl  = null;
  let dragSrcLi  = null;

  /* ── Config ──────────────────────────────────────────────────────── */
  // URL del webhook n8n para guardar el CV directamente en disco.
  // Cambiar si n8n corre en otro puerto o host.
  const SAVE_API = 'http://localhost:5678/webhook/cv-save';

  // Nombre del archivo de este CV (desde <meta name="cv-file">, o el título)
  const CV_FILENAME = (document.querySelector('meta[name="cv-file"]') || {}).content
                    || document.title + '.html';

  /* ── IndexedDB: persistir FileSystemFileHandle entre sesiones ───── */
  const IDB = (function () {
    function open() {
      return new Promise(function (resolve, reject) {
        var req = indexedDB.open('cv-editor', 1);
        req.onupgradeneeded = function (e) { e.target.result.createObjectStore('handles'); };
        req.onsuccess  = function (e) { resolve(e.target.result); };
        req.onerror    = function ()  { reject(); };
      });
    }
    return {
      get: async function (key) {
        try {
          var db = await open();
          return new Promise(function (resolve) {
            var tx  = db.transaction('handles', 'readonly');
            var req = tx.objectStore('handles').get(key);
            req.onsuccess = function () { resolve(req.result || null); };
            req.onerror   = function () { resolve(null); };
          });
        } catch (e) { return null; }
      },
      set: async function (key, value) {
        try {
          var db = await open();
          var tx = db.transaction('handles', 'readwrite');
          tx.objectStore('handles').put(value, key);
        } catch (e) { /* ignore */ }
      }
    };
  })();

  async function verifyPermission(handle) {
    var opts = { mode: 'readwrite' };
    if ((await handle.queryPermission(opts))   === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  /* ── Guardar con File System Access API ─────────────────────────── */
  async function saveViaFSA(html) {
    try {
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: CV_FILENAME,
          types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }]
        });
        await IDB.set(CV_FILENAME, fileHandle);
      }
      if (!(await verifyPermission(fileHandle))) { fileHandle = null; return false; }
      var writable = await fileHandle.createWritable();
      await writable.write(html);
      await writable.close();
      return true;
    } catch (e) {
      if (e.name === 'AbortError') return null; // usuario canceló
      fileHandle = null;
      return false;
    }
  }
  const LIST_SEL = '.exp-list li, .tech-list li, .soft-skills-list li';

  /* ── Selectores editables ────────────────────────────────────────── */
  function getEditables() {
    return [...document.querySelectorAll(
      '.role, ' +
      '.sidebar-section p, ' +
      '.tech-list li, ' +
      '.soft-skills-list li, ' +
      '.lang-item strong, .lang-item span, ' +
      '.exp-title, .exp-years, .exp-subtitle, .exp-list li, ' +
      '.edu-title, .edu-desc'
    )];
  }

  /* ── Botón × ─────────────────────────────────────────────────────── */
  function makeDelBtn(li) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cve-del';
    btn.contentEditable = 'false';
    btn.setAttribute('data-cve-ui', '1');
    btn.textContent = '×';
    btn.title = 'Eliminar';
    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      li.remove();
    });
    return btn;
  }

  /* ── Handle de drag ─────────────────────────────────────────────── */
  function makeDragHandle(li) {
    const handle = document.createElement('span');
    handle.className = 'cve-drag';
    handle.contentEditable = 'false';
    handle.setAttribute('data-cve-ui', '1');
    handle.textContent = '⠿';
    handle.title = 'Arrastrar para reordenar';
    handle.addEventListener('mousedown', function () {
      li.draggable = true;
    });
    return handle;
  }

  /* ── Botón + ─────────────────────────────────────────────────────── */
  function makeAddBtn(list) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cve-add';
    btn.setAttribute('data-cve-ui', '1');
    btn.textContent = '+ Agregar';
    btn.title = 'Agregar item';
    btn.addEventListener('click', function () {
      const newLi = document.createElement('li');
      newLi.contentEditable = 'true';
      newLi.setAttribute('data-cve', '1');
      newLi.textContent = 'Nuevo item';
      newLi.insertBefore(makeDragHandle(newLi), newLi.firstChild);
      newLi.appendChild(makeDelBtn(newLi));
      list.appendChild(newLi);
      const range = document.createRange();
      const sel   = window.getSelection();
      range.setStart(newLi.firstChild, 0);
      range.setEnd(newLi.firstChild, newLi.firstChild.length);
      sel.removeAllRanges();
      sel.addRange(range);
      newLi.focus();
    });
    return btn;
  }

  /* ── Drag & drop — handlers con nombre para poder removerlos ─────── */
  function onDragStart(e) {
    const li = e.target.closest && e.target.closest(LIST_SEL);
    if (!li || !li.draggable) return;
    dragSrcLi = li;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(function () { li.classList.add('cve-dragging'); }, 0);
  }

  function onDragOver(e) {
    const li = e.target.closest && e.target.closest(LIST_SEL);
    if (!li || li === dragSrcLi) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.cve-dragover-top, .cve-dragover-bottom').forEach(function (el) {
      el.classList.remove('cve-dragover-top', 'cve-dragover-bottom');
    });
    const rect = li.getBoundingClientRect();
    li.classList.add(e.clientY < rect.top + rect.height / 2 ? 'cve-dragover-top' : 'cve-dragover-bottom');
  }

  function onDragLeave(e) {
    const li = e.target.closest && e.target.closest(LIST_SEL);
    if (li) li.classList.remove('cve-dragover-top', 'cve-dragover-bottom');
  }

  function onDrop(e) {
    const li = e.target.closest && e.target.closest(LIST_SEL);
    if (!li || !dragSrcLi || li === dragSrcLi) return;
    e.preventDefault();
    const rect = li.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      li.parentNode.insertBefore(dragSrcLi, li);
    } else {
      li.parentNode.insertBefore(dragSrcLi, li.nextSibling);
    }
    li.classList.remove('cve-dragover-top', 'cve-dragover-bottom');
  }

  function onDragEnd() {
    if (dragSrcLi) {
      dragSrcLi.draggable = false;
      dragSrcLi.classList.remove('cve-dragging');
    }
    document.querySelectorAll('.cve-dragover-top, .cve-dragover-bottom').forEach(function (el) {
      el.classList.remove('cve-dragover-top', 'cve-dragover-bottom');
    });
    dragSrcLi = null;
  }

  function addDragListeners() {
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragover',  onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop',      onDrop);
    document.addEventListener('dragend',   onDragEnd);
  }

  function removeDragListeners() {
    document.removeEventListener('dragstart', onDragStart);
    document.removeEventListener('dragover',  onDragOver);
    document.removeEventListener('dragleave', onDragLeave);
    document.removeEventListener('drop',      onDrop);
    document.removeEventListener('dragend',   onDragEnd);
  }

  /* ── Añadir controles a todas las listas ────────────────────────── */
  function addListControls() {
    document.querySelectorAll('.exp-list, .tech-list, .soft-skills-list').forEach(function (list) {
      list.querySelectorAll('li').forEach(function (li) {
        li.insertBefore(makeDragHandle(li), li.firstChild);
        li.appendChild(makeDelBtn(li));
      });
      list.insertAdjacentElement('afterend', makeAddBtn(list));
    });
  }

  /* ── Quitar controles y resetear draggable ──────────────────────── */
  function removeListControls() {
    document.querySelectorAll('[data-cve-ui]').forEach(function (el) { el.remove(); });
    document.querySelectorAll(LIST_SEL).forEach(function (li) {
      li.draggable = false;
      li.classList.remove('cve-dragging', 'cve-dragover-top', 'cve-dragover-bottom');
    });
  }

  /* ── Enter en una lista: crea nuevo <li> debajo ──────────────────── */
  function onListKeydown(e) {
    if (e.key !== 'Enter') return;
    const li = e.target.closest && e.target.closest(LIST_SEL);
    if (!li) return;
    e.preventDefault();
    const newLi = document.createElement('li');
    newLi.contentEditable = 'true';
    newLi.setAttribute('data-cve', '1');
    newLi.textContent = '';
    newLi.insertBefore(makeDragHandle(newLi), newLi.firstChild);
    newLi.appendChild(makeDelBtn(newLi));
    li.insertAdjacentElement('afterend', newLi);
    newLi.focus();
  }

  /* ── Activar / desactivar edición ───────────────────────────────── */
  function toggleEdit() {
    editMode = !editMode;
    const btn  = document.getElementById('cvtb-edit');
    const cvEl = document.querySelector('.cv');

    getEditables().forEach(function (el) {
      el.contentEditable = editMode ? 'true' : 'false';
      el.setAttribute('data-cve', '1');
    });

    cvEl.classList.toggle('cve-hint',    editMode);
    cvEl.classList.toggle('cve-editing', editMode);
    btn.textContent = editMode ? '🔒 Bloquear' : '✏ Editar';

    if (editMode) {
      addListControls();
      addDragListeners();
      document.addEventListener('keydown', onListKeydown);
      const first = getEditables()[0];
      if (first) first.focus();
    } else {
      removeListControls();
      removeDragListeners();
      document.removeEventListener('keydown', onListKeydown);
    }
  }

  /* ── Serializar HTML limpio ──────────────────────────────────────── */
  function getHtml() {
    const cvEl      = document.querySelector('.cv');
    const editables = getEditables();

    editables.forEach(function (el) { el.removeAttribute('contenteditable'); });
    removeListControls();
    cvEl.classList.remove('cve-hint', 'cve-editing');

    if (toolbarEl && toolbarEl.parentNode) toolbarEl.parentNode.removeChild(toolbarEl);
    if (styleEl   && styleEl.parentNode)   styleEl.parentNode.removeChild(styleEl);

    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    document.head.appendChild(styleEl);
    document.body.appendChild(toolbarEl);

    if (editMode) {
      editables.forEach(function (el) { el.contentEditable = 'true'; });
      addListControls();
      cvEl.classList.add('cve-hint', 'cve-editing');
    }

    return html;
  }

  /* ── Guardar con File System Access API ─────────────────────────── */
  async function save() {
    const html = getHtml();

    // 1. n8n webhook (funciona cuando n8n está corriendo)
    try {
      const ctrl = new AbortController();
      setTimeout(function () { ctrl.abort(); }, 4000);
      const res = await fetch(SAVE_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ filename: CV_FILENAME, html }),
        signal:  ctrl.signal
      });
      if (res.ok) { notify('✓ Guardado en disco'); return; }
    } catch (e) { /* n8n no disponible, continuar */ }

    // 2. File System Access API con handle persistido en IndexedDB
    if ('showSaveFilePicker' in window) {
      const result = await saveViaFSA(html);
      if (result === true)  { notify('✓ Guardado'); return; }
      if (result === null)  { return; } // usuario canceló
    }

    // 3. Descarga como fallback
    download(html);
  }

  /* ── Descargar como fallback ─────────────────────────────────────── */
  function download(html) {
    html = html || getHtml();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = CV_FILENAME;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }

  /* ── Notificación flotante ───────────────────────────────────────── */
  function notify(msg) {
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = [
      'position:fixed', 'bottom:64px', 'right:20px',
      'background:#27ae60', 'color:#fff',
      'padding:7px 16px', 'border-radius:6px',
      'font-family:"Segoe UI",sans-serif', 'font-size:12px',
      'z-index:9999', 'transition:opacity .3s'
    ].join(';');
    document.body.appendChild(n);
    setTimeout(function () {
      n.style.opacity = '0';
      setTimeout(function () { n.remove(); }, 350);
    }, 2000);
  }

  /* ── Construir toolbar ───────────────────────────────────────────── */
  function buildToolbar() {
    const old = document.getElementById('cvtb');
    if (old) old.remove();

    const cvEl = document.querySelector('.cv');
    if (cvEl) cvEl.classList.remove('cve-hint', 'cve-editing');

    toolbarEl = document.createElement('div');
    toolbarEl.id = 'cvtb';
    toolbarEl.innerHTML =
      '<span>CV Editor</span>' +
      '<button type="button" id="cvtb-edit">✏ Editar</button>' +
      '<button type="button" class="sv" id="cvtb-save">💾 Guardar</button>' +
      '<button type="button" class="dl" id="cvtb-dl" title="Descargar copia">⬇</button>';
    document.body.appendChild(toolbarEl);

    document.getElementById('cvtb-edit').addEventListener('click', toggleEdit);
    document.getElementById('cvtb-save').addEventListener('click', save);
    document.getElementById('cvtb-dl').addEventListener('click', function () { download(); });
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToolbar);
  } else {
    buildToolbar();
  }

  // Restaurar fileHandle desde IndexedDB (para no tener que re-elegir el archivo)
  IDB.get(CV_FILENAME).then(function (stored) {
    if (stored) fileHandle = stored;
  });

  /* ── Ctrl+S / Cmd+S ─────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  });

})();
