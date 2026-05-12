import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Send, Hourglass, XCircle, Trash2, FileText, Pencil, X, Monitor, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { getCountByEstado, getPostulacionesByEstado, getPostulaciones, deletePostulacion, updatePostulacion, type PaginatedResult } from '@/services/firestore_service';
import type { Postulacion } from '@/types/cv';

const ESTADOS: Array<{ label: string; color: string; bgColor: string }> = [
  { label: 'Pendiente', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { label: 'Enviado', color: 'text-sky-500', bgColor: 'bg-sky-500/20' },
  { label: 'En proceso', color: 'text-green-500', bgColor: 'bg-green-500/20' },
  { label: 'Descartado', color: 'text-red-500', bgColor: 'bg-red-500/20' },
];

const PERFILES = [
  { key: 'desarrollador', label: 'Desarrollador', icon: Monitor, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { key: 'conductor', label: 'Conductor', icon: Truck, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  { key: 'mozo-de-almacen', label: 'Mozo Almacén', icon: Package, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
];

function getPerfilIcon(post: Postulacion) {
  const p = post.perfil || '';
  const found = PERFILES.find((pf) => pf.key === p);
  if (found) return found.icon;
  return null;
}

function getLangFlag(post: Postulacion): string | null {
  if (post.idioma && ['es', 'ca', 'en'].includes(post.idioma)) return post.idioma.toUpperCase();
  const text = ((post.cvData?.sobreMi || '') + ' ' + (post.cartaIntencion || '')).toLowerCase();
  const caScore = (text.match(/\b(els|les|una|per|que|amb|dels|més|entre|sobre|però|sinó|també)\b/g) || []).length;
  const enScore = (text.match(/\b(the|you|we|they|for|with|about|and|this|that|from|have|will|your|our|their|experience|skills|job|work|team|must|should|able|ability)\b/g) || []).length;
  if (caScore > enScore && caScore > 2) return 'CA';
  if (enScore > caScore && enScore > 2) return 'EN';
  return 'ES';
}

function CartaModal({ post, onClose }: { post: Postulacion; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Carta de Intención</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {post.cartaIntencion || 'No se generó carta de intención para esta postulación.'}
        </div>
      </div>
    </div>
  );
}

function ResumenModal({ post, onClose }: { post: Postulacion; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Resumen de la Oferta</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {post.resumenOferta || 'No se generó resumen de la oferta para esta postulación.'}
        </div>
      </div>
    </div>
  );
}

function NotasModal({ post, onClose, onSave }: { post: Postulacion; onClose: () => void; onSave: (notas: string) => void }) {
  const [text, setText] = useState(post.notas || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notas</h3>
          <button
            onClick={() => { onSave(text); onClose(); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Añade notas sobre esta postulación..."
          rows={8}
          className="form-textarea w-full resize-y text-sm"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => { onSave(text); onClose(); }}
            className="btn bg-violet-500 hover:bg-violet-600 text-white"
          >
            <X className="w-4 h-4" />
            Cerrar y guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ post, onClose, onSave }: { post: Postulacion; onClose: () => void; onSave: (data: Partial<Postulacion>) => void }) {
  const [empresa, setEmpresa] = useState(post.empresa || '');
  const [portal, setPortal] = useState(post.portal || '');
  const [urlOferta, setUrlOferta] = useState(post.urlOferta || '');
  const [perfil, setPerfil] = useState(post.perfil || '');
  const [idioma, setIdioma] = useState(post.idioma || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Editar postulación</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
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
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="form-select w-full text-sm">
              <option value="">Auto (detectar)</option>
              <option value="es">Español</option>
              <option value="ca">Català</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 text-sm">Cancelar</button>
          <button
            onClick={() => { onSave({ empresa, portal, urlOferta, perfil, idioma }); onClose(); }}
            className="btn bg-violet-500 hover:bg-violet-600 text-white text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0, 'Pendiente': 0, 'Enviado': 0, 'En proceso': 0, 'Descartado': 0 });
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [perfilFilter, setPerfilFilter] = useState<string | null>(null);
  const [items, setItems] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cartaPost, setCartaPost] = useState<Postulacion | null>(null);
  const [resumenPost, setResumenPost] = useState<Postulacion | null>(null);
  const [notasPost, setNotasPost] = useState<Postulacion | null>(null);
  const [editPost, setEditPost] = useState<Postulacion | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const loadCounts = async () => {
    const c = await getCountByEstado();
    setCounts(c);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      let result: PaginatedResult;
      if (estadoFilter) {
        const raw = await getPostulacionesByEstado(estadoFilter);
        result = { items: raw.slice(0, 15), lastVisible: null, hasMore: raw.length > 15 };
      } else {
        result = await getPostulaciones(15);
      }
      const filtered = perfilFilter ? result.items.filter((i) => i.perfil === perfilFilter) : result.items;
      setItems(filtered);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('Error loading items:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCounts(); }, []);
  useEffect(() => { loadItems(); }, [estadoFilter, perfilFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta postulación?')) return;
    await deletePostulacion(id);
    loadCounts();
    loadItems();
  };

  const handleEstadoChange = async (id: string, estado: string) => {
    await updatePostulacion(id, { estado: estado as Postulacion['estado'] });
    loadCounts();
    loadItems();
  };

  const handleNotasSave = async (id: string, notas: string) => {
    await updatePostulacion(id, { notas });
    loadItems();
  };

  const handleEditSave = async (id: string, data: Partial<Postulacion>) => {
    await updatePostulacion(id, data);
    loadItems();
    loadCounts();
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resumen de tus postulaciones</p>
      </div>

      {/* Metric cards - collapsible on mobile */}
      <div className="mb-6">
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="flex lg:hidden items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
        >
          {showMetrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showMetrics ? 'Ocultar' : 'Mostrar'} resumen
        </button>
        <div className={`${showMetrics ? 'grid' : 'hidden'} lg:grid grid-cols-5 gap-2`}>
          <div
            className={`flex items-center justify-center lg:justify-start gap-2 bg-white dark:bg-gray-800 shadow-xs rounded-lg cursor-pointer transition py-2 px-3 ${!estadoFilter ? 'ring-2 ring-violet-500/50' : 'ring-1 ring-violet-500/20'}`}
            onClick={() => setEstadoFilter(null)}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-500/10 shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div className="min-w-0 hidden lg:block">
              <p className="text-[11px] font-medium text-gray-400 leading-tight">Total</p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">{counts.total}</p>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 lg:hidden">{counts.total}</span>
          </div>

          {ESTADOS.map((estado) => (
            <div
              key={estado.label}
              className={`flex items-center justify-center lg:justify-start gap-2 bg-white dark:bg-gray-800 shadow-xs rounded-lg cursor-pointer transition py-2 px-3 ${estadoFilter === estado.label ? 'ring-2 ring-violet-500/50' : 'ring-1 ring-violet-500/20'}`}
              onClick={() => setEstadoFilter(estadoFilter === estado.label ? null : estado.label)}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full ${estado.bgColor} shrink-0`}>
                {estado.label === 'Pendiente' && <Clock className={`w-3.5 h-3.5 ${estado.color}`} />}
                {estado.label === 'Enviado' && <Send className={`w-3.5 h-3.5 ${estado.color}`} />}
                {estado.label === 'En proceso' && <Hourglass className={`w-3.5 h-3.5 ${estado.color}`} />}
                {estado.label === 'Descartado' && <XCircle className={`w-3.5 h-3.5 ${estado.color}`} />}
              </div>
              <div className="min-w-0 hidden lg:block">
                <p className="text-[11px] font-medium text-gray-400 leading-tight truncate">{estado.label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{counts[estado.label] || 0}</p>
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-gray-100 lg:hidden">{counts[estado.label] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {estadoFilter && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtrando por: <strong className="text-gray-900 dark:text-gray-100">{estadoFilter}</strong></span>
          <button onClick={() => setEstadoFilter(null)} className="text-sm text-violet-500 hover:underline">Mostrar todo</button>
        </div>
      )}

      {/* Profile filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPerfilFilter(null)}
          className={`inline-flex items-center justify-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition ${!perfilFilter ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <span className="hidden lg:inline">Todos</span>
          <span className="lg:hidden w-3.5 h-3.5 rounded-full ring-2 ring-current" />
        </button>
        {PERFILES.map((pf) => {
          const Icon = pf.icon;
          return (
            <button
              key={pf.key}
              onClick={() => setPerfilFilter(perfilFilter === pf.key ? null : pf.key)}
              className={`inline-flex items-center justify-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition ${perfilFilter === pf.key ? `${pf.bgColor} ${pf.color}` : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">{pf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Empresa</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">URL</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Modelo IA</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Resumen</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">CV</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Carta</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Notas</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} className="text-center py-8 text-gray-500">Cargando...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No hay postulaciones registradas</p>
                    </div>
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-800/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 cursor-pointer" onClick={() => navigate(`/detalle/${item.id}`)}>
                  <td className="px-4 py-3 font-medium text-violet-600 dark:text-violet-400 max-w-[160px] truncate">{item.empresa}</td>
                  <td className="px-4 py-3">
                    {item.urlOferta ? (
                      <a href={item.urlOferta} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-700 text-xs font-medium" onClick={(e) => e.stopPropagation()}>{item.portal || 'Ver oferta'}</a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{item.fecha}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">{item.modeloIA}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {(() => { const Icon = getPerfilIcon(item); return Icon ? <Icon className="w-4 h-4 text-gray-400 shrink-0" /> : null; })()}
                      {(() => { const flag = getLangFlag(item); return flag ? <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none">{flag}</span> : null; })()}
                      {item.resumenOferta ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setResumenPost(item); }}
                          className="text-amber-500 hover:text-amber-700 flex items-center gap-1 text-xs font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ver
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cv/${item.id}`); }}
                        className="text-violet-500 hover:text-violet-700 flex items-center gap-1 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.cartaIntencion ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCartaPost(item); }}
                        className="text-sky-500 hover:text-sky-700 flex items-center gap-1 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.estado}
                      onChange={(e) => handleEstadoChange(item.id!, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="form-select text-xs py-1"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Enviado">Enviado</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Descartado">Descartado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {item.notas ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setNotasPost(item); }}
                        className="text-green-500 hover:text-green-700 flex items-center gap-1 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setNotasPost(item); }}
                        className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Añadir
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditPost(item); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id!); }}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="flex justify-center py-3 border-t border-gray-100 dark:border-gray-700/50">
            <span className="text-sm text-gray-500">Hay más registros. Usa el filtro para navegar.</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {cartaPost && <CartaModal post={cartaPost} onClose={() => setCartaPost(null)} />}
      {resumenPost && <ResumenModal post={resumenPost} onClose={() => setResumenPost(null)} />}
      {notasPost && <NotasModal post={notasPost} onClose={() => setNotasPost(null)} onSave={(notas) => handleNotasSave(notasPost.id!, notas)} />}
      {editPost && <EditModal post={editPost} onClose={() => setEditPost(null)} onSave={(data) => handleEditSave(editPost.id!, data)} />}
    </div>
  );
}
