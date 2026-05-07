import { useState, useRef, useEffect, useCallback } from 'react';
import { userData, profileMap, type ProfileKey } from '@/data/user-profiles';

function buildCVHtml(profileKey: ProfileKey): string {
  const profile = profileMap[profileKey];
  const h = userData.header;
  const meta = userData.meta[profileKey];

  const expHtml = profile.experiencia.map((e) => `
    <div class="exp-entry">
      <div class="exp-header">
        <span class="exp-title">${e.cargo}</span>
        <span class="exp-years">(${e.periodo})</span>
      </div>
      <p class="exp-subtitle">${e.empresa}</p>
      <ul class="exp-list">
        ${e.tareas.map((t) => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const techHtml = profile.tecnologias.map((t) => `<li>${t}</li>`).join('');
  const softHtml = profile.softSkills.slice(0, 5).map((s) => `<li>${s}</li>`).join('');

  const langHtml = profile.idiomas.map((l) => {
    const lang = Object.keys(l)[0];
    const attrs = l[lang];
    return `
    <div class="lang-item">
      <strong>${lang}:</strong>
      <div class="lang-item__level">
        ${attrs.map((a) => `<span>${a}</span>`).join('')}
      </div>
    </div>
  `;
  }).join('');

  const formacionLines = profile.formacion.split('\n').filter(Boolean);
  const eduTitle = formacionLines[0] || '';
  const eduSchool = formacionLines.slice(1, 2).join(' ');
  const eduDesc = formacionLines.slice(2).join(' ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${h.nombre} ${h.apellidos} – ${meta.label}</title>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles/style.css">
</head>
<body>
<article class="cv">
  <header class="header">
    <div class="photo-wrap">
      <img src="${profile.foto}" alt="">
    </div>
    <div class="header-info">
      <h1>${h.nombre} ${h.apellidos}</h1>
      <p class="role">${meta.label}</p>
      <div class="contact-grid">
        <a class="contact-item" href="tel:${h.telefono}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          ${h.telefono}
        </a>
        <a class="contact-item" href="#">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          ${h.direccion}
        </a>
        <a class="contact-item" href="mailto:${h.correo}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          ${h.correo}
        </a>
        <a class="contact-item" href="https://${h.web}" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          ${h.web}
        </a>
      </div>
    </div>
  </header>
  <div class="body">
    <aside class="sidebar">
      <div class="sidebar-section">
        <h2>Sobre mí</h2>
        <p>${profile.informacionPersonal}</p>
      </div>
      <div class="sidebar-section">
        <h2>Tecnologías</h2>
        <ul class="tech-list">${techHtml}</ul>
      </div>
      <div class="sidebar-section">
        <h2>Idiomas</h2>
        ${langHtml}
      </div>
      <div class="sidebar-section">
        <h2>Soft Skills</h2>
        <ul class="soft-skills-list">${softHtml}</ul>
      </div>
    </aside>
    <main class="main">
      <section>
        <h2 class="section-title">Experiencia Profesional</h2>
        ${expHtml}
      </section>
      <section>
        <h2 class="section-title">Formación</h2>
        <div class="edu-entry">
          <p class="edu-title">${eduTitle}</p>
          ${eduSchool ? `<p class="edu-school"><span>${eduSchool}</span></p>` : ''}
          ${eduDesc ? `<p class="edu-desc">${eduDesc}</p>` : ''}
        </div>
      </section>
    </main>
  </div>
</article>
<script src="/assets/scripts/cv-editor.js"></script>
</body>
</html>`;
}

export default function CVBuilder() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey>('desarrollador');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadCV = useCallback((profile: ProfileKey) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildCVHtml(profile);
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, []);

  useEffect(() => {
    loadCV(selectedProfile);
  }, [selectedProfile, loadCV]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const html = iframe.contentDocument.documentElement.outerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>\n${html}`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleDownload = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const html = iframe.contentDocument.documentElement.outerHTML;
    const blob = new Blob([`<!DOCTYPE html>\n${html}`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${selectedProfile}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">CV Builder</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona perfil, edita y exporta</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value as ProfileKey)}
            className="form-select"
          >
            <option value="desarrollador">Desarrollador Frontend</option>
            <option value="conductor">Conductor VTC</option>
            <option value="mozo-de-almacen">Mozo de Almacén</option>
          </select>
          <button
            onClick={() => loadCV(selectedProfile)}
            className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
          >
            ↻ Resetear
          </button>
          <button
            onClick={handlePrint}
            className="btn bg-violet-500 hover:bg-violet-600 text-white"
          >
            🖨 Imprimir CV
          </button>
          <button
            onClick={handleDownload}
            className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
          >
            ⬇ Descargar HTML
          </button>
        </div>
      </div>

      {/* Iframe container */}
      <div className="bg-white shadow-xs rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full border-0"
          style={{ height: '1150px' }}
          title="CV Preview"
          sandbox="allow-scripts allow-same-origin allow-modals"
        />
      </div>
    </div>
  );
}
