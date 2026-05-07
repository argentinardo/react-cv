import { useState } from 'react';
import type { CVMasterData } from '@/types/cv';
import { userData, type ProfileKey } from '@/data/user-profiles';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { generateCVFromOffer } from '@/services/ai_service';
import { savePostulacion } from '@/services/firestore_service';
import { inferPortal } from '@/utils/helpers';
import CVEditor from './CVEditor';

const IA_ENGINES: Record<string, { label: string; models: string[] }> = {
  gemini: { label: 'Gemini (Google)', models: ['gemma-4-31b-it','gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'] },
  openrouter: {
    label: 'OpenRouter', models: ['qwen/qwen3-coder:free',
      'qwen/qwen3-next-80b-a3b-instruct:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'minimax/minimax-m2.5:free',
      'openai/gpt-oss-120b:free',
      'inclusionai/ling-2.6-flash:free',
      'tencent/hy3-preview:free',
      'z-ai/glm-4.5-air:free',
      'openrouter/free']
  },
  ollama: { label: 'Ollama (Local)', models: ['gemma4:e4b', 'gemma4:26b', 'qwen2.5-coder'] },
  deepseek: { label: 'DeepSeek', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
};

const profiles = Object.entries(userData.profiles).map(([key]) => ({
  key: key as ProfileKey,
  label: userData.meta[key as ProfileKey]?.label || key,
}));

type Step = 'form' | 'editing' | 'done';

export default function NuevaPostulacion() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cvData, setCvData] = useState<CVMasterData | null>(null);
  const [saving, setSaving] = useState(false);

  const [urlOferta, setUrlOferta] = useState('');
  const [ofertaTexto, setOfertaTexto] = useState('');
  const [perfil, setPerfil] = useState<string>('desarrollador');
  const [perfilCustom, setPerfilCustom] = useState('');
  const [iaEngine, setIaEngine] = useState('gemini');
  const [iaModel, setIaModel] = useState(IA_ENGINES.gemini.models[0]);
  const [instrucciones, setInstrucciones] = useState('');

  const handleEngineChange = (engine: string) => {
    setIaEngine(engine);
    setIaModel(IA_ENGINES[engine].models[0]);
  };

  const handleGenerar = async () => {
    if (!ofertaTexto.trim()) {
      setError('Pega el texto de la oferta de trabajo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const perfilKey = perfil === 'custom' ? perfilCustom : perfil;
      const result = await generateCVFromOffer(
        ofertaTexto,
        perfilKey,
        iaEngine,
        iaModel,
        instrucciones
      );
      setCvData(result);
      setStep('editing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el CV con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (data: CVMasterData) => {
    setSaving(true);
    try {
      const perfilKey = perfil === 'custom' ? perfilCustom : perfil;
      const portal = urlOferta ? inferPortal(urlOferta) : 'Manual';
      await savePostulacion({
        empresa: urlOferta ? portal : perfilKey,
        portal,
        fecha: new Date().toISOString().split('T')[0],
        modeloIA: `${iaEngine} / ${iaModel}`,
        resumenOferta: '',
        cartaIntencion: '',
        cvData: data,
        estado: 'Pendiente',
        notas: '',
      });
      setCvData(data);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    setStep('form');
    setCvData(null);
  };

  if (step === 'editing' && cvData) {
    return <CVEditor cvData={cvData} onGuardar={handleGuardar} onVolver={handleVolver} saving={saving} />;
  }

  if (step === 'done') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">Postulación guardada</h2>
          <p className="text-green-600 dark:text-green-400 mt-2">El CV y la carta de intención se han generado correctamente.</p>
          <button
            onClick={handleVolver}
            className="btn mt-6 bg-violet-500 hover:bg-violet-600 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Nueva postulación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nueva Postulación</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pega la oferta y la IA generará tu CV adaptado</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            URL de la oferta <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="url"
            value={urlOferta}
            onChange={(e) => setUrlOferta(e.target.value)}
            placeholder="https://www.linkedin.com/jobs/view/..."
            className="form-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Texto de la oferta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={ofertaTexto}
            onChange={(e) => setOfertaTexto(e.target.value)}
            placeholder="Pega aquí el texto completo de la oferta de trabajo..."
            rows={8}
            className="form-textarea w-full resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Perfil</label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="form-select w-full"
            >
              {profiles.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
              <option value="custom">Otro (manual)</option>
            </select>
          </div>

          {perfil === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Perfil personalizado</label>
              <input
                type="text"
                value={perfilCustom}
                onChange={(e) => setPerfilCustom(e.target.value)}
                placeholder="Ej: Data Scientist"
                className="form-input w-full"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Motor IA</label>
            <select
              value={iaEngine}
              onChange={(e) => handleEngineChange(e.target.value)}
              className="form-select w-full"
            >
              {Object.entries(IA_ENGINES).map(([key, eng]) => (
                <option key={key} value={key}>{eng.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Modelo</label>
            <select
              value={iaModel}
              onChange={(e) => setIaModel(e.target.value)}
              className="form-select w-full"
            >
              {IA_ENGINES[iaEngine].models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Instrucciones adicionales <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            placeholder="Cualquier indicación especial para la IA..."
            rows={3}
            className="form-textarea w-full resize-y"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="btn bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generar CV con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
