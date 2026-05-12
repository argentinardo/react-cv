import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { getPostulacionById } from '@/services/firestore_service';
import type { Postulacion, CVMasterData } from '@/types/cv';

const SECTION_TITLES: Record<string, Record<string, string>> = {
  sobreMi: { es: 'Sobre mí', ca: 'Sobre mi', en: 'About Me' },
  tecnologias: { es: 'Tecnologías', ca: 'Tecnologies', en: 'Technologies' },
  idiomas: { es: 'Idiomas', ca: 'Idiomes', en: 'Languages' },
  softSkills: { es: 'Soft Skills', ca: 'Soft Skills', en: 'Soft Skills' },
  experiencia: { es: 'Experiencia Profesional', ca: 'Experiència Professional', en: 'Professional Experience' },
  formacion: { es: 'Formación', ca: 'Formació', en: 'Education' },
};

function detectCvLang(cv: CVMasterData, idioma?: string): string {
  if (idioma && ['es', 'ca', 'en'].includes(idioma)) return idioma;
  const text = (cv.sobreMi + ' ' + (cv.cartaIntencion || '')).toLowerCase();
  const caScore = (text.match(/\b(els|les|una|per|que|amb|dels|més|entre|sobre|però|sinó|també)\b/g) || []).length;
  const enScore = (text.match(/\b(the|you|we|they|for|with|about|and|this|that|from|have|will|your|our|their|experience|skills|job|work|team|must|should|able|ability)\b/g) || []).length;
  if (caScore > enScore && caScore > 2) return 'ca';
  if (enScore > caScore && enScore > 2) return 'en';
  return 'es';
}

function t(section: string, lang: string): string {
  return SECTION_TITLES[section]?.[lang] || SECTION_TITLES[section]?.es || section;
}

function buildCVHtml(post: Postulacion): string {
  const { cvData: cv } = post;
  const lang = detectCvLang(cv, post.idioma);
  const h = cv.header;

  const expHtml = cv.experiencia.map((e) => `
    <div class="exp-entry">
      <div class="exp-header">
        <span class="exp-title">${e.titulo}</span>
        <span class="exp-years">(${e.duracion})</span>
      </div>
      <p class="exp-subtitle">${e.ocupacion}</p>
      <ul class="exp-list">
        ${e.tareas.map((t) => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const techHtml = cv.tecnologias.map((t) => `<li>${t}</li>`).join('');
  const softHtml = cv.softSkills.slice(0, 5).map((s) => `<li>${s}</li>`).join('');

  const idiomHtml = cv.idiomas.map((l) => {
    const idiom = Object.keys(l)[0];
    const attrs = l[idiom];
    return `
    <div class="lang-item">
      <strong>${idiom}:</strong>
      <div class="lang-item__level">
        ${attrs.map((a) => `<span>${a}</span>`).join('')}
      </div>
    </div>`;
  }).join('');

  const formacionLines = cv.formacion.split('\n').filter(Boolean);
  const htmlLang = lang === 'ca' ? 'ca' : lang === 'en' ? 'en' : 'es';

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${h.nombre} ${h.apellidos} – ${h.titulacion}</title>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles/style.css">
</head>
<body>
<article class="cv">
  <header class="header">
    <div class="photo-wrap">
      <img src="${cv.foto}" alt="">
    </div>
    <div class="header-info">
      <h1>${h.nombre} ${h.apellidos}</h1>
      <p class="role">${h.titulacion}</p>
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
        <h2>${t('sobreMi', lang)}</h2>
        <p>${cv.sobreMi}</p>
      </div>
      <div class="sidebar-section">
        <h2>${t('tecnologias', lang)}</h2>
        <ul class="tech-list">${techHtml}</ul>
      </div>
      <div class="sidebar-section">
        <h2>${t('idiomas', lang)}</h2>
        ${idiomHtml}
      </div>
      <div class="sidebar-section">
        <h2>${t('softSkills', lang)}</h2>
        <ul class="soft-skills-list">${softHtml}</ul>
      </div>
    </aside>
    <main class="main">
      <section>
        <h2 class="section-title">${t('experiencia', lang)}</h2>
        ${expHtml}
      </section>
      <section>
        <h2 class="section-title">${t('formacion', lang)}</h2>
        <div class="edu-entry">
          <p class="edu-title">${formacionLines[0] || ''}</p>
          ${formacionLines.length > 1 ? `<p class="edu-school"><span>${formacionLines.slice(1).join(' ')}</span></p>` : ''}
        </div>
      </section>
    </main>
  </div>
</article>
</body>
</html>`;
}

export default function CVViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Postulacion | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await getPostulacionById(id);
    setPost(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadPost(); }, [loadPost]);

  useEffect(() => {
    if (!post) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildCVHtml(post);
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [post]);

  const handlePrint = () => {
    if (!post) return;
    const html = buildCVHtml(post);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleDownload = () => {
    if (!post) return;
    const html = buildCVHtml(post);
    const blob = new Blob([`<!DOCTYPE html>\n${html}`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${post.empresa}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Postulación no encontrada</p>
        <button className="btn mt-4 bg-violet-500 text-white" onClick={() => navigate('/')}>Volver</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{post.empresa}</h1>
            <p className="text-sm text-gray-500">{post.portal} · {post.fecha}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn bg-violet-500 hover:bg-violet-600 text-white">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button onClick={handleDownload} className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <Download className="w-4 h-4" />
            Descargar
          </button>
          <button onClick={() => navigate(`/editar/${post.id}`)} className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            Editar
          </button>
        </div>
      </div>

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
