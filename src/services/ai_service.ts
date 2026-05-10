import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CVMasterData } from '@/types/cv';
import { userData, getProfile, profileMeta, profileMap, type ProfileKey, type LanguageKey } from '@/data/user-profiles';
import { inferPortal, detectLanguage, getLangName } from '@/utils/helpers';

function mapLanguage(detected: string): LanguageKey {
  const lower = detected.toLowerCase();
  if (lower.includes('catalan') || lower.includes('català') || lower.includes('catalan')) return 'catalan';
  if (lower.includes('english') || lower.includes('inglés') || lower.includes('anglès') || lower.includes('en ')) return 'english';
  return 'castellano';
}

const systemPromptByLang: Record<LanguageKey, string> = {
  castellano: `Eres un experto en redacción de CVs adaptados a ofertas laborales.
ANALIZA la oferta y genera un JSON con el CV adaptado.

REGLAS:
1. sobreMi → Reescribí el texto base del perfil para que encaje con la oferta. Máx 2 párrafos.
2. tecnologias → Elegí máx 10 del pool del perfil. Las que menciona la oferta van primero.
3. softSkills → Elegí máx 5 del pool del perfil. Las que coinciden con la oferta van primero.
4. experiencia.tareas → Para CADA experiencia, adaptá las tareas para que resuenen con la oferta. NO cambiar titulo, duracion, ocupacion ni empresas.
5. formacion e idiomas → Mantener igual a los datos base.
6. header.titulacion → Inferí de la oferta. El resto del header usar los datos fijos.
7. foto → Usar la foto del perfil base.
8. cartaIntencion → Carta de máximo 60 palabras dirigida a la empresa, mostrando motivación y 2 puntos fuertes.
9. resumenOferta → 2-3 frases resumiendo la oferta de trabajo.
10. NO inventes puestos, empresas, fechas ni tecnologías que no estén en el perfil base.
11. Devuelve SOLO JSON válido. Sin texto antes ni después, sin markdown.
12. empresaOferta → Nombre exacto de la empresa que publica la oferta. Si no se menciona, pon "Empresa no especificada".`,
  catalan: `Ets un expert en redacció de CVs adaptats a ofertes laborals.
ANALITZA l'oferta i genera un JSON amb el CV adaptat.

REGLES:
1. sobreMi → Reescriu el text base del perfil perquè encaixi amb l'oferta. Màx 2 paràgrafs.
2. tecnologias → Tria màx 10 del pool del perfil. Les que menciona l'oferta van primer.
3. softSkills → Tria màx 5 del pool del perfil. Les que coincideixen amb l'oferta van primer.
4. experiencia.tareas → Per CADA experiència, adapta les tasques perquè ressonin amb l'oferta. NO canviar títol, durada, ocupació ni empreses.
5. formacion i idiomas → Mantenir igual a les dades base.
6. header.titulacion → Infeir de l'oferta. La resta de l'header usar les dades fixes.
7. foto → Usar la foto del perfil base.
8. cartaIntencion → Carta de màxim 60 paraules dirigida a l'empresa, mostrant motivació i 2 punts forts.
9. resumenOferta → 2-3 frases resumint l'oferta de treball.
10. NO inventis llocs, empreses, dates ni tecnologies que no estiguin al perfil base.
11. Retorna NOMÉS JSON vàlid. Sense text abans ni després, sense markdown.
12. empresaOferta → Nom exacte de l'empresa que publica l'oferta. Si no es menciona, posa "Empresa no especificada".`,
  english: `You are an expert in CV writing adapted to job offers.
ANALYZE the job offer and generate a JSON with the adapted CV.

RULES:
1. sobreMi → Rewrite the base profile text to fit the offer. Max 2 paragraphs.
2. tecnologias → Pick max 10 from the profile pool. Those mentioned in the offer go first.
3. softSkills → Pick max 5 from the profile pool. Those matching the offer go first.
4. experiencia.tareas → For EACH experience, adapt the tasks to resonate with the offer. DO NOT change title, duration, occupation, or companies.
5. formacion and idiomas → Keep the same as base data.
6. header.titulacion → Infer from the offer. The rest of the header use the fixed data.
7. foto → Use the base profile photo.
8. cartaIntencion → Cover letter of max 60 words addressed to the company, showing motivation and 2 strong points.
9. resumenOferta → 2-3 sentences summarizing the job offer.
10. DO NOT invent positions, companies, dates, or technologies not in the base profile.
11. Return ONLY valid JSON. No text before or after, no markdown.
12. empresaOferta → Exact name of the company publishing the offer. If not mentioned, put "Company not specified".`,
};

function buildPrompt(ofertaTexto: string, perfil: string, instrucciones: string): string {
  const detectedLang = detectLanguage(ofertaTexto);
  const language = mapLanguage(detectedLang);
  const profileKey = (perfil in profileMap ? perfil : 'desarrollador') as ProfileKey;
  const profile = getProfile(profileKey, language);
  const { header } = userData;

  const systemPrompt = systemPromptByLang[language];

  return `${systemPrompt}

---
DATOS FIJOS DEL CANDIDATO:
- Nombre: ${header.nombre} ${header.apellidos}
- Teléfono: ${header.telefono}
- Dirección: ${header.direccion}
- Email: ${header.correo}
- Web: ${header.web}
- Foto: ${profileMeta[profileKey]?.foto || ''}

SOBRE MÍ BASE (REESCRIBIR):
${profile.informacionPersonal}

EXPERIENCIA (ADAPTAR SOLO LAS TAREAS DE CADA UNA):
Puesto: ${profile.experiencia.map((e) => e.cargo).join(' / ')}
Detalle por puesto:
${profile.experiencia.map((e) => `Puesto: ${e.cargo}
Empresa: ${e.empresa}
Duración: ${e.periodo}
Tareas actuales: ${e.tareas.join('. ')}`).join('\n---\n')}

POOL TECNOLOGÍAS (MÁX 10, priorizar las de la oferta):
${profile.tecnologias.join(', ')}

POOL SOFT SKILLS (MÁX 5, priorizar las de la oferta):
${profile.softSkills.join(', ')}

FORMACIÓN (USAR TAL CUAL):
${profile.formacion}

IDIOMAS (USAR TAL CUAL):
${profile.idiomas.map((i: { [idioma: string]: string[] }) => {
    const lang = Object.keys(i)[0];
    return `${lang}: ${i[lang].join(' - ')}`;
  }).join('\n')}

---
IDIOMA DE LA OFERTA: ${detectedLang} → RESPONDE EN ${getLangName(detectedLang)}.
---
OFERTA:
${ofertaTexto}

${instrucciones ? `EXTRA: ${instrucciones}` : ''}

---
JSON DE SALIDA (generá el JSON completo):
{
  "header": { "nombre": "${header.nombre}", "apellidos": "${header.apellidos}", "titulacion": "...", "telefono": "${header.telefono}", "direccion": "${header.direccion}", "correo": "${header.correo}", "web": "${header.web}" },
  "foto": "${profileMeta[profileKey]?.foto || ''}",
  "sobreMi": "...",
  "tecnologias": ["...", "..."],
  "softSkills": ["...", "..."],
  "idiomas": [${profile.idiomas.map((i) => JSON.stringify(i)).join(', ')}],
  "experiencia": [${profile.experiencia.map((e) => `{"titulo":"${e.cargo}","duracion":"${e.periodo}","ocupacion":"${e.empresa}","empresas":["${e.empresa}"],"tareas":["..."]}`).join(', ')}],
  "formacion": "${profile.formacion.replace(/"/g, '\\"')}",
  "cartaIntencion": "...",
  "resumenOferta": "...",
  "empresaOferta": "..."
}`;
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta VITE_GEMINI_API_KEY en .env.local');
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model: model.includes('/') ? model.split('/')[1] : model });
  const result = await genModel.generateContent(prompt);
  return result.response.text();
}

async function callOpenRouter(prompt: string, model: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Falta VITE_OPENROUTER_API_KEY en .env.local');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Job Manager',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Devuelve SOLO JSON válido. Sin texto antes ni después.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOllama(prompt: string, model: string): Promise<string> {
  const baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Devuelve SOLO JSON válido.' },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
  const data = await response.json();
  return data.message.content;
}

async function callDeepSeek(prompt: string, model: string): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('Falta VITE_DEEPSEEK_API_KEY en .env.local');
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Devuelve SOLO JSON válido. Sin texto antes ni después.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

const KEY_MAP: Record<string, string> = {
  tecnologias: 'tecnologias',
  tecnologías: 'tecnologias',
  'soft-skills': 'softSkills',
  softSkills: 'softSkills',
  soft_skills: 'softSkills',
  softskills: 'softSkills',
  sobreMi: 'sobreMi',
  'sobre-mi': 'sobreMi',
  sobre_mi: 'sobreMi',
  sobremi: 'sobreMi',
  aboutMe: 'sobreMi',
  about_me: 'sobreMi',
  cartaIntencion: 'cartaIntencion',
  'carta-intencion': 'cartaIntencion',
  carta_intencion: 'cartaIntencion',
  cartaIntención: 'cartaIntencion',
  cartaDePresentacion: 'cartaIntencion',
  carta: 'cartaIntencion',
  cartaPresentacion: 'cartaIntencion',
  coverLetter: 'cartaIntencion',
  cover_letter: 'cartaIntencion',
  resumeOferta: 'resumenOferta',
  resumenOferta: 'resumenOferta',
  resumen: 'resumenOferta',
  'resumen-oferta': 'resumenOferta',
  'resumen_oferta': 'resumenOferta',
  ofertaResumen: 'resumenOferta',
  ofertaSummary: 'resumenOferta',
  summary: 'resumenOferta',
  experiencia: 'experiencia',
  formacion: 'formacion',
  formación: 'formacion',
  idiomas: 'idiomas',
  foto: 'foto',
  header: 'header',
};

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const mapped = KEY_MAP[key] || key;
    normalized[mapped] = obj[key];
  }
  return normalized;
}

function buildDefaultCV(profileKey: ProfileKey, language: LanguageKey): CVMasterData {
  const profile = getProfile(profileKey, language);
  return {
    header: { ...userData.header, titulacion: profileMeta[profileKey]?.label || '' },
    foto: profileMeta[profileKey]?.foto || '',
    sobreMi: profile.informacionPersonal,
    tecnologias: profile.tecnologias.slice(0, 10),
    softSkills: profile.softSkills.slice(0, 5),
    idiomas: profile.idiomas,
    experiencia: profile.experiencia.map((e) => ({
      titulo: e.cargo,
      duracion: e.periodo,
      ocupacion: e.empresa,
      empresas: [e.empresa],
      tareas: e.tareas,
    })),
    formacion: profile.formacion,
    cartaIntencion: '',
    resumenOferta: '',
    empresaOferta: '',
  };
}

function parseCVResponse(text: string, profileKey: ProfileKey, language: LanguageKey): CVMasterData {
  const defaults = buildDefaultCV(profileKey, language);

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    console.warn('No JSON found in AI response:', text.substring(0, 200));
    return defaults;
  }
  const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);

  let parsed: Record<string, unknown>;
  try {
    parsed = normalizeKeys(JSON.parse(jsonStr));
  } catch (e) {
    console.warn('JSON parse failed:', e, '\nRaw:', text.substring(0, 300));
    return defaults;
  }

  const header: CVMasterData['header'] = {
    ...defaults.header,
    ...(parsed.header ? normalizeKeys(parsed.header as Record<string, unknown>) as CVMasterData['header'] : {}),
  };

  const experienciaRaw = parsed.experiencia as Array<Record<string, unknown>> | undefined;
  const experiencia = (experienciaRaw && experienciaRaw.length > 0)
    ? experienciaRaw.map((e) => {
        const ne = normalizeKeys(e);
        return {
          titulo: (ne.titulo as string) || '',
          duracion: (ne.duracion as string) || '',
          ocupacion: (ne.ocupacion as string) || '',
          empresas: (ne.empresas as string[]) || [],
          tareas: (ne.tareas as string[]) || [],
        };
      })
    : defaults.experiencia;

  return {
    header,
    foto: (parsed.foto as string) || defaults.foto,
    sobreMi: (parsed.sobreMi as string) || defaults.sobreMi,
    tecnologias: (Array.isArray(parsed.tecnologias) && (parsed.tecnologias as string[]).length > 0)
      ? parsed.tecnologias as string[]
      : defaults.tecnologias,
    softSkills: (Array.isArray(parsed.softSkills) && (parsed.softSkills as string[]).length > 0)
      ? parsed.softSkills as string[]
      : defaults.softSkills,
    idiomas: (Array.isArray(parsed.idiomas) && (parsed.idiomas as unknown[]).length > 0)
      ? parsed.idiomas as CVMasterData['idiomas']
      : defaults.idiomas,
    experiencia,
    formacion: (parsed.formacion as string) || defaults.formacion,
    cartaIntencion: (parsed.cartaIntencion as string) || '',
    resumenOferta: (parsed.resumenOferta as string) || '',
    empresaOferta: (parsed.empresaOferta as string) || '',
  };
}

export async function generateCVFromOffer(
  ofertaTexto: string,
  perfil: string,
  iaEngine: string,
  iaModel: string,
  instrucciones: string = ''
): Promise<CVMasterData> {
  const prompt = buildPrompt(ofertaTexto, perfil, instrucciones);
  const profileKey = (perfil in profileMap ? perfil : 'desarrollador') as ProfileKey;
  const language = mapLanguage(detectLanguage(ofertaTexto));

  let response: string;
  switch (iaEngine) {
    case 'gemini':
      response = await callGemini(prompt, iaModel);
      break;
    case 'openrouter':
      response = await callOpenRouter(prompt, iaModel);
      break;
    case 'ollama':
      response = await callOllama(prompt, iaModel);
      break;
    case 'deepseek':
      response = await callDeepSeek(prompt, iaModel);
      break;
    default:
      throw new Error(`Motor IA no soportado: ${iaEngine}`);
  }

  return parseCVResponse(response, profileKey, language);
}

export { inferPortal, detectLanguage };
