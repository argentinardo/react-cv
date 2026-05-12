import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CVMasterData, Postulacion } from '@/types/cv';
import { Sparkles, ArrowLeft, RefreshCw, Loader } from 'lucide-react';
import { getPostulacionById, updatePostulacion } from '@/services/firestore_service';
import { generateCVFromOffer } from '@/services/ai_service';
import { scrapeUrl } from '@/services/scraping_service';
import CVEditor from './CVEditor';

export default function EditarPostulacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Postulacion | null>(null);
  const [empresa, setEmpresa] = useState('');
  const [portal, setPortal] = useState('');
  const [urlOferta, setUrlOferta] = useState('');
  const [perfil, setPerfil] = useState('');
  const [idioma, setIdioma] = useState('');
  const [cvData, setCvData] = useState<CVMasterData | null>(null);
  const [saving, setSaving] = useState(false);
  const [retraducir, setRetraducir] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPostulacionById(id).then((p) => {
      if (p) {
        setPost(p);
        setEmpresa(p.empresa || '');
        setPortal(p.portal || '');
        setUrlOferta(p.urlOferta || '');
        setPerfil(p.perfil || '');
        setIdioma(p.idioma || '');
        if (p.cvData) setCvData(p.cvData);
      }
      setLoading(false);
    });
  }, [id]);

  const handleGuardar = async (data: CVMasterData) => {
    if (!id) return;
    setSaving(true);
    try {
      await updatePostulacion(id, {
        empresa,
        portal,
        urlOferta,
        perfil,
        idioma,
        cvData: data,
      });
      setDone(true);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleRetraducir = async () => {
    if (!post || !id || !idioma) return;
    setRetraducir(true);
    try {
      let texto = post.ofertaTexto || '';
      if (!texto && post.urlOferta) {
        texto = await scrapeUrl(post.urlOferta);
      }
      if (!texto) return;

      const perfilKey = post.perfil || 'desarrollador';
      const engine = post.modeloIA?.split(' / ')[0] || 'gemini';
      const model = post.modeloIA?.split(' / ')[1] || 'gemini-2.0-flash';

      const result = await generateCVFromOffer(texto, perfilKey, engine, model, '', idioma);
      setCvData(result);
      setPost({ ...post, cvData: result, idioma });
    } catch {
      // silently fail
    } finally {
      setRetraducir(false);
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
          <button onClick={() => navigate(`/cv/${id}`)} className="btn mt-6 bg-violet-500 hover:bg-violet-600 text-white">
            <ArrowLeft className="w-4 h-4" />
            Volver al CV
          </button>
        </div>
      </div>
    );
  }

  if (!post || !cvData) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Postulación no encontrada</p>
        <button className="btn mt-4 bg-violet-500 text-white" onClick={() => navigate('/')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Datos de la postulación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Empresa</label>
            <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="form-input w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Portal</label>
            <input value={portal} onChange={(e) => setPortal(e.target.value)} className="form-input w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL de la oferta</label>
            <input value={urlOferta} onChange={(e) => setUrlOferta(e.target.value)} className="form-input w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rol</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)} className="form-select w-full text-sm">
              <option value="">Sin especificar</option>
              <option value="desarrollador">Desarrollador</option>
              <option value="conductor">Conductor</option>
              <option value="mozo-de-almacen">Mozo de Almacén</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Idioma del CV</label>
            <div className="flex gap-2">
              <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="form-select w-full text-sm">
                <option value="">Auto (detectar)</option>
                <option value="es">Español</option>
                <option value="ca">Català</option>
                <option value="en">English</option>
              </select>
              <button
                onClick={handleRetraducir}
                disabled={retraducir || !idioma || !post?.ofertaTexto && !post?.urlOferta}
                className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Re-traducir contenido al idioma seleccionado"
              >
                {retraducir ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            {retraducir && <p className="text-xs text-violet-500 mt-1">Re-traduciendo contenido...</p>}
          </div>
        </div>
      </div>

      <CVEditor
        cvData={cvData}
        onGuardar={handleGuardar}
        onVolver={() => navigate(`/cv/${id}`)}
        saving={saving}
        postId={id}
      />
    </div>
  );
}
