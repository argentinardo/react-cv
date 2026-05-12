const JINA_READER_URL = 'https://r.jina.ai';

export async function scrapeUrl(url: string, timeout = 20000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${JINA_READER_URL}/${encodeURIComponent(url)}`, {
      headers: { Accept: 'text/plain' },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Jina error ${res.status}: ${text.slice(0, 200)}`);
    }

    return res.text();
  } finally {
    clearTimeout(timer);
  }
}
