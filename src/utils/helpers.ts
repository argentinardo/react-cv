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
  English: /\b(the|is|are|you|we|they|have|will|for|with)\b/gi,
  Catalan: /\b(els|les|una|amb|per|que|del|aquesta)\b/gi,
};

export function detectLanguage(text: string): string {
  const scores: Record<string, number> = { Spanish: 0, English: 0, Catalan: 0 };
  const words = text.split(/\s+/);

  for (const [lang, pattern] of Object.entries(langPatterns)) {
    const matches = text.match(pattern);
    if (matches) scores[lang] = matches.length;
  }

  const englishRatio = scores.English / Math.max(words.length, 1);
  if (englishRatio > 0.15) return 'English';

  const catalanRatio = scores.Catalan / Math.max(words.length, 1);
  if (catalanRatio > 0.05) return 'Catalan';

  return 'Spanish';
}
