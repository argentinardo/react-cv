import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, Loader, ExternalLink, ArrowLeft } from 'lucide-react';
import type { CVMasterData } from '@/types/cv';
import { profileMap, profileMeta, type ProfileKey } from '@/data/user-profiles';
import { generateCVFromOffer } from '@/services/ai_service';
import { savePostulacion } from '@/services/firestore_service';
import { inferPortal, detectLanguage } from '@/utils/helpers';
import { scrapeUrl } from '@/services/scraping_service';

const IA_ENGINES: Record<string, { label: string; models: string[] }> = {
  gemini: { label: 'Gemini (Google)', models: ['gemma-4-31b-it','gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'] },
  openrouter: {
    label: 'OpenRouter', models: ['qwen/qwen3-coder:free',
      'qwen/qwen3-next-80b-a3b-instruct:free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'minimax/minimax-m2.5:free',
      'openai/gpt-oss-120b:free',
      'openrouter/free']
  },
  ollama: { label: 'Ollama (Local)', models: ['gemma4:e4b', 'gemma4:26b', 'qwen2.5-coder'] },
  deepseek: { label: 'DeepSeek', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
};

const profiles = Object.keys(profileMap).map((key) => ({
  key: key as ProfileKey,
  label: profileMeta[key as ProfileKey]?.label || key,
}));

type UrlState = {
  url: string;
  status: 'pending' | 'scraping' | 'generating' | 'saving' | 'done' | 'error';
  empresa?: string;
  postId?: string;
  error?: string;
};

export default function CargaMasiva() {
  const navigate = useNavigate();
  const [urlsText, setUrlsText] = useState('');
  const [perfil, setPerfil] = useState('desarrollador');
  const [perfilCustom, setPerfilCustom] = useState('');
  const [iaEngine, setIaEngine] = useState('gemini');
  const [iaModel, setIaModel] = useState(IA_ENGINES.gemini.models[0]);
  const [instrucciones, setInstrucciones] = useState('');
  const [urlStates, setUrlStates] = useState<UrlState[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleEngineChange = (engine: string) => {
    setIaEngine(engine);
    setIaModel(IA_ENGINES[engine].models[0]);
  };

  const procesar = async () => {
    const urls = urlsText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (urls.length === 0) return;

    const initial: UrlState[] = urls.map((url) => ({ url, status: 'pending' }));
    setUrlStates(initial);
    setProcessing(true);
    setDone(false);

    const perfilKey = perfil === 'custom' ? perfilCustom : perfil;
    const langMap: Record<string, string> = { Spanish: 'es', English: 'en', Catalan: 'ca' };

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      try {
        setUrlStates((prev) => prev.map((s, idx) => idx === i ? { ...s, status: 'scraping' } : s));

        const textoOferta = await scrapeUrl(url);

        setUrlStates((prev) => prev.map((s, idx) => idx === i ? { ...s, status: 'generating' } : s));

        const cvData: CVMasterData = await generateCVFromOffer(
          textoOferta,
          perfilKey,
          iaEngine,
          iaModel,
          instrucciones
        );

        setUrlStates((prev) => prev.map((s, idx) => idx === i ? { ...s, status: 'saving' } : s));

        const portal = inferPortal(url);
        const detected = detectLanguage(cvData.cartaIntencion || cvData.sobreMi);
        const idioma = langMap[detected] || 'es';

        const postId = await savePostulacion({
          empresa: cvData.empresaOferta || portal,
          portal,
          urlOferta: url,
          fecha: new Date().toISOString().split('T')[0],
          modeloIA: `${iaEngine} / ${iaModel}`,
          resumenOferta: cvData.resumenOferta || '',
          cartaIntencion: cvData.cartaIntencion || '',
          cvData,
          estado: 'Pendiente',
          notas: '',
          perfil: perfilKey,
          idioma,
          ofertaTexto: textoOferta,
        });

        setUrlStates((prev) => prev.map((s, idx) => idx === i ? {
          ...s, status: 'done', empresa: cvData.empresaOferta || portal, postId
        } : s));
      } catch (err) {
        setUrlStates((prev) => prev.map((s, idx) => idx === i ? {
          ...s, status: 'error', error: err instanceof Error ? err.message : 'Error desconocido'
        } : s));
      }
    }

    setProcessing(false);
    setDone(true);
  };

  const total = urlStates.length;
  const completadas = urlStates.filter((s) => s.status === 'done').length;
  const conError = urlStates.filter((s) => s.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Carga masiva</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Procesa múltiples ofertas automáticamente</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URLs de ofertas (una por línea)</label>
          <textarea
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder="https://linkedin.com/jobs/...&#10;https://infojobs.net/...&#10;https://indeed.com/..."
            rows={6}
            className="form-textarea w-full resize-y text-sm"
            disabled={processing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Perfil</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)} className="form-select w-full text-sm" disabled={processing}>
              {profiles.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              <option value="custom">Otro...</option>
            </select>
            {perfil === 'custom' && (
              <input
                value={perfilCustom}
                onChange={(e) => setPerfilCustom(e.target.value)}
                placeholder="Nombre del perfil"
                className="form-input w-full text-sm mt-1"
                disabled={processing}
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Motor IA</label>
            <select value={iaEngine} onChange={(e) => handleEngineChange(e.target.value)} className="form-select w-full text-sm" disabled={processing}>
              {Object.entries(IA_ENGINES).map(([key, eng]) => <option key={key} value={key}>{eng.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Modelo</label>
            <select value={iaModel} onChange={(e) => setIaModel(e.target.value)} className="form-select w-full text-sm" disabled={processing}>
              {IA_ENGINES[iaEngine].models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Instrucciones extra</label>
            <input
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Opcional"
              className="form-input w-full text-sm"
              disabled={processing}
            />
          </div>
        </div>

        <button
          onClick={procesar}
          disabled={processing || !urlsText.trim()}
          className="btn bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {processing ? (
            <><Loader className="w-4 h-4 animate-spin" /> Procesando...</>
          ) : (
            <><Upload className="w-4 h-4" /> Procesar URLs</>
          )}
        </button>
      </div>

      {/* Progress */}
      {urlStates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Progreso</h2>
              <span className="text-xs text-gray-500">
                {completadas + conError}/{total} · {completadas} ✅ {conError > 0 ? `· ${conError} ❌` : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${total > 0 ? ((completadas + conError) / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-64 overflow-y-auto">
            {urlStates.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <div className="shrink-0">
                  {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />}
                  {item.status === 'scraping' && <Loader className="w-4 h-4 text-sky-500 animate-spin" />}
                  {item.status === 'generating' && <Loader className="w-4 h-4 text-amber-500 animate-spin" />}
                  {item.status === 'saving' && <Loader className="w-4 h-4 text-violet-500 animate-spin" />}
                  {item.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {item.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
                <span className="text-gray-500 truncate flex-1 text-xs">{item.url}</span>
                <span className="text-xs font-medium text-gray-400 shrink-0 w-20 text-right">
                  {item.status === 'pending' && 'Pendiente'}
                  {item.status === 'scraping' && 'Scraping...'}
                  {item.status === 'generating' && 'Generando CV...'}
                  {item.status === 'saving' && 'Guardando...'}
                  {item.status === 'done' && 'Completado'}
                  {item.status === 'error' && 'Error'}
                </span>
                {item.status === 'done' && item.postId && (
                  <button onClick={() => navigate(`/cv/${item.postId}`)} className="text-violet-500 hover:text-violet-700 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.status === 'error' && item.error && (
                  <span className="text-[10px] text-red-400 truncate max-w-[120px] shrink-0" title={item.error}>{item.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {done && (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="btn bg-violet-500 hover:bg-violet-600 text-white">
            <ArrowLeft className="w-4 h-4" />
            Ir al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
