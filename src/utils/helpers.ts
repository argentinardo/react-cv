const portalPatterns: Record<string, RegExp> = {
  LinkedIn: /linkedin\.com/i,
  InfoJobs: /infojobs\.net/i,
  Indeed: /indeed\./i,
  Glassdoor: /glassdoor\./i,
  Tecnoempleo: /tecnoempleo\.com/i,
  InfoJobsEmpresa: /infojobsempresa\.com/i,
};

export function inferPortal(url: string): string {
  if (!url) return 'Desconocido';
  for (const [portal, pattern] of Object.entries(portalPatterns)) {
    if (pattern.test(url)) return portal;
  }
  return new URL(url).hostname || 'Desconocido';
}

const langPatterns: Record<string, RegExp> = {
  English: /\b(the|is|are|you|we|they|have|will|for|with|and|this|that|from|your|our|their|experience|skills|qualifications|responsibilities|requirements|position|job|work|team|must|should|able|ability|knowledge|understanding|excellent|strong|proven|including|such|well|both|within|about|what|been|more|also|these|those|when|where|which|them|each)\b/gi,
  Catalan: /\b(els|les|una|amb|per|que|del|dels|aquesta|aquest|aquestes|aquests|com|més|entre|sobre|segons|des|fins|sense|però|sinó|també|molt|ben|tant|quan|on|qui|qual|quals|seva|seves|seu|seus|pot|poden|haver|tenir|fer|ser|estar)\b/gi,
  Spanish: /\b(que|con|por|para|una|tener|deber|más|entre|sobre|según|desde|hasta|sin|pero|sino|también|muy|tan|cuando|donde|quien|cual|cuales|puede|pueden|haber|hacer|ser|estar|como|esta|este|esto|misma|mismo|empresa|puesto|trabajo|equipo|experiencia|conocimiento|habilidades|responsabilidades|requisitos|funciones|ofrecemos|buscamos|valoramos|necesitamos|incorporar|formar|parte|laboral|jornada|horario|salario|incorporación|inmediata)\b/gi,
};

function getLangName(lang: string): string {
  const names: Record<string, string> = {
    Spanish: 'ESPAÑOL',
    English: 'INGLÉS',
    Catalan: 'CATALÀ',
  };
  return names[lang] || lang;
}

export function detectLanguage(text: string): string {
  const scores: Record<string, number> = { Spanish: 0, English: 0, Catalan: 0 };

  for (const [lang, pattern] of Object.entries(langPatterns)) {
    const matches = text.match(pattern);
    if (matches) scores[lang] = matches.length;
  }

  const total = scores.Spanish + scores.English + scores.Catalan;
  if (total === 0) return 'Spanish';

  const highest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return highest[0];
}

export { getLangName };
