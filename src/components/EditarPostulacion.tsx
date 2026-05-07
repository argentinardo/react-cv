import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CVMasterData } from '@/types/cv';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { getPostulacionById, updatePostulacion } from '@/services/firestore_service';
import CVEditor from './CVEditor';

export default function EditarPostulacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cvData, setCvData] = useState<CVMasterData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPostulacionById(id).then((post) => {
      if (post?.cvData) {
        setCvData(post.cvData);
      }
      setLoading(false);
    });
  }, [id]);

  const handleGuardar = async (data: CVMasterData) => {
    if (!id) return;
    setSaving(true);
    try {
      await updatePostulacion(id, { cvData: data });
      setDone(true);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">Postulación actualizada</h2>
          <p className="text-green-600 dark:text-green-400 mt-2">Los cambios se han guardado correctamente.</p>
          <button onClick={() => navigate('/')} className="btn mt-6 bg-violet-500 hover:bg-violet-600 text-white">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Postulación no encontrada</p>
        <button className="btn mt-4 bg-violet-500 text-white" onClick={() => navigate('/')}>Volver</button>
      </div>
    );
  }

  return (
    <CVEditor
      cvData={cvData}
      onGuardar={handleGuardar}
      onVolver={() => navigate(`/cv/${id}`)}
      saving={saving}
      postId={id}
    />
  );
}
