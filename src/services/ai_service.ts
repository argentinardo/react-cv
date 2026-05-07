import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CVMasterData } from '@/types/cv';
import { userData, profileMap, profileMeta, type ProfileKey } from '@/data/user-profiles';
import { inferPortal, detectLanguage } from '@/utils/helpers';

function buildDefaultCV(profileKey: ProfileKey): CVMasterData {
  const profile = profileMap[profileKey] || profileMap.desarrollador;
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
  };
}

function buildPrompt(ofertaTexto: string, perfil: string, instrucciones: string): string {
  const idioma = detectLanguage(ofertaTexto);
  const profileKey = perfil as ProfileKey;
  const profile = profileMap[profileKey] || profileMap.desarrollador;
  const header = userData.header;

  const expFormatted = profile.experiencia.map((e) =>
    `- **${e.cargo}** en ${e.empresa} (${e.periodo})\n  Tareas: ${e.tareas.join('; ')}`
  ).join('\n');

  return `Eres un experto en redacción de CVs para perfiles técnicos.

Tu tarea es analizar la oferta laboral y devolver SOLO un JSON válido con los campos EXACTOS que se indican abajo.

REGLAS CRÍTICAS:
1. NO inventes puestos, empresas, fechas ni experiencias. Usa EXACTAMENTE las del perfil base.
2. NO inventes tecnologías que no estén en el pool del perfil.
3. SÍ adapta: texto "sobreMi", énfasis en tareas de experiencia, tecnologías y soft skills priorizadas.
4. Usa keywords de la oferta de forma natural.
5. La "cartaIntencion" debe ser un string de máximo 60 palabras.
6. El "resumenOferta" debe ser 2-3 frases.
7. Devuelve SOLO JSON válido. Sin texto adicional, sin markdown.

JSON REQUIRED (usa exactamente estos nombres de clave):
{
  "header": {
    "nombre": "${header.nombre}",
    "apellidos": "${header.apellidos}",
    "titulacion": "<inferido de la oferta>",
    "telefono": "${header.telefono}",
    "direccion": "${header.direccion}",
    "correo": "${header.correo}",
    "web": "${header.web}"
  },
  "foto": "${profileMeta[profileKey]?.foto || ''}",
  "sobreMi": "<adaptado a la oferta, 1-2 párrafos>",
  "tecnologias": ["<máx 10, prioriza las de la oferta, usa EXACTAMENTE del pool abajo>"],
  "softSkills": ["<máx 5, prioriza las de la oferta, usa del pool abajo>"],
  "idiomas": [${profile.idiomas.map((item: { [idioma: string]: string[] }) => {
    const lang = Object.keys(item)[0];
    return `{ "${lang}": ${JSON.stringify(item[lang])} }`;
  }).join(', ')}],
  "experiencia": [${profile.experiencia.map((e) => `{ "titulo": "${e.cargo}", "duracion": "${e.periodo}", "ocupacion": "${e.empresa}", "empresas": ["${e.empresa}"], "tareas": ["<adaptadas levemente a la oferta>"] }`).join(', ')}],
  "formacion": "${profile.formacion.replace(/\n/g, ' ')}",
  "cartaIntencion": "<carta de presentación/intención de máximo 60 palabras, adaptada a la oferta>",
  "resumenOferta": "<2-3 frases resumiendo la oferta>"
}

---

PERFIL BASE: ${perfil}

SOBRE MÍ BASE (ADAPTAR):
${profile.informacionPersonal}

EXPERIENCIA REAL (ADAPTAR TAREAS LEVEMENTE, NO CAMBIAR PUESTOS/EMPRESAS/FECHAS):
${expFormatted}

POOL TECNOLOGÍAS (MÁX 10):
${profile.tecnologias.join(', ')}

POOL SOFT SKILLS (MÁX 5):
${profile.softSkills.join(', ')}

OFERTA (${idioma}):
${ofertaTexto}

${instrucciones ? `INSTRUCCIONES ADICIONALES: ${instrucciones}` : ''}

Devuelve SOLO el JSON con las claves exactas indicadas.`;
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
        { role: 'system', content: 'Devuelve SOLO JSON válido con las claves exactas especificadas.' },
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
        { role: 'system', content: 'Devuelve SOLO JSON válido con las claves exactas especificadas.' },
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
  resumeOferta: 'resumenOferta',
  resumenOferta: 'resumenOferta',
  'resumen-oferta': 'resumenOferta',
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

function parseCVResponse(text: string, profileKey: ProfileKey): CVMasterData {
  const defaults = buildDefaultCV(profileKey);

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = normalizeKeys(JSON.parse(cleaned));
  } catch {
    console.warn('JSON parse failed, returning defaults');
    return defaults;
  }

  const header: CVMasterData['header'] = {
    ...defaults.header,
    ...(parsed.header ? normalizeKeys(parsed.header as Record<string, unknown>) : {}),
  };

  const experienciaRaw = parsed.experiencia as Array<Record<string, unknown>> | undefined;
  const experiencia = experienciaRaw?.map((e) => {
    const ne = normalizeKeys(e);
    return {
      titulo: (ne.titulo as string) || '',
      duracion: (ne.duracion as string) || '',
      ocupacion: (ne.ocupacion as string) || '',
      empresas: (ne.empresas as string[]) || [],
      tareas: (ne.tareas as string[]) || [],
    };
  }) || defaults.experiencia;

  return {
    header,
    foto: (parsed.foto as string) || defaults.foto,
    sobreMi: (parsed.sobreMi as string) || defaults.sobreMi,
    tecnologias: Array.isArray(parsed.tecnologias) ? parsed.tecnologias as string[] : defaults.tecnologias,
    softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills as string[] : defaults.softSkills,
    idiomas: Array.isArray(parsed.idiomas) ? parsed.idiomas as CVMasterData['idiomas'] : defaults.idiomas,
    experiencia,
    formacion: (parsed.formacion as string) || defaults.formacion,
    cartaIntencion: (parsed.cartaIntencion as string) || '',
    resumenOferta: (parsed.resumenOferta as string) || '',
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

  return parseCVResponse(response, profileKey);
}

export { inferPortal, detectLanguage };
