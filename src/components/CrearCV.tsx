import { useNavigate } from 'react-router-dom';
import { Sparkles, Pencil, Briefcase, FileText } from 'lucide-react';

export default function CrearCV() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Crear CV</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Elige cómo quieres generar tu currículum</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Option */}
        <button
          onClick={() => navigate('/nueva')}
          className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 text-left hover:shadow-md hover:ring-2 hover:ring-violet-500/30 transition group"
        >
          <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-violet-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Nueva Postulación (IA)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Pega una oferta de trabajo y la IA generará tu CV adaptado automáticamente al puesto.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3" /> Gemini / DeepSeek
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">
              <Briefcase className="w-3 h-3" /> CV + Carta
            </span>
          </div>
        </button>

        {/* Manual Option */}
        <button
          onClick={() => navigate('/cv-builder')}
          className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6 text-left hover:shadow-md hover:ring-2 hover:ring-sky-500/30 transition group"
        >
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center mb-4">
            <Pencil className="w-6 h-6 text-sky-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            CV Manual
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Selecciona un perfil base y edita el CV manualmente con el editor visual.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              <FileText className="w-3 h-3" /> Editor visual
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
              <Briefcase className="w-3 h-3" /> Print / Export
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
