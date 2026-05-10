import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Send, Hourglass, XCircle, Trash2, FileText, Pencil, X } from 'lucide-react';
import { getCountByEstado, getPostulacionesByEstado, getPostulaciones, deletePostulacion, updatePostulacion, type PaginatedResult } from '@/services/firestore_service';
import type { Postulacion } from '@/types/cv';

const ESTADOS: Array<{ label: string; color: string; bgColor: string }> = [
  { label: 'Pendiente', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { label: 'Enviado', color: 'text-sky-500', bgColor: 'bg-sky-500/20' },
  { label: 'En proceso', color: 'text-green-500', bgColor: 'bg-green-500/20' },
  { label: 'Descartado', color: 'text-red-500', bgColor: 'bg-red-500/20' },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0, 'Pendiente': 0, 'Enviado': 0, 'En proceso': 0, 'Descartado': 0 });
  const [filter, setFilter] = useState<string | null>(null);
  const [items, setItems] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cartaPost, setCartaPost] = useState<Postulacion | null>(null);
  const [resumenPost, setResumenPost] = useState<Postulacion | null>(null);
  const [notasPost, setNotasPost] = useState<Postulacion | null>(null);

  const loadCounts = async () => {
    const c = await getCountByEstado();
    setCounts(c);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      let result: PaginatedResult;
      if (filter) {
        const filtered = await getPostulacionesByEstado(filter);
        result = { items: filtered.slice(0, 15), lastVisible: null, hasMore: filtered.length > 15 };
      } else {
        result = await getPostulaciones(15);
      }
      setItems(result.items);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('Error loading items:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCounts(); }, []);
  useEffect(() => { loadItems(); }, [filter]);

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

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resumen de tus postulaciones</p>
      </div>

      {/* Metric cards - single row */}
      <div className="flex gap-3 mb-6">
        <div
          className={`flex items-center gap-3 flex-1 min-w-0 bg-white dark:bg-gray-800 shadow-xs rounded-lg cursor-pointer transition py-2.5 px-3 ${!filter ? 'ring-2 ring-violet-500/50' : 'ring-1 ring-violet-500/20'}`}
          onClick={() => setFilter(null)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 shrink-0">
            <Briefcase className="w-4 h-4 text-violet-500" />
          </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Total</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-auto">{counts.total}</span>
        </div>

        {ESTADOS.map((estado) => (
          <div
            key={estado.label}
            className={`flex items-center gap-3 flex-1 min-w-0 bg-white dark:bg-gray-800 shadow-xs rounded-lg cursor-pointer transition py-2.5 px-3 ${filter === estado.label ? 'ring-2 ring-violet-500/50' : 'ring-1 ring-violet-500/20'}`}
            onClick={() => setFilter(filter === estado.label ? null : estado.label)}
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${estado.bgColor} shrink-0`}>
              {estado.label === 'Pendiente' && <Clock className={`w-3.5 h-3.5 ${estado.color}`} />}
              {estado.label === 'Enviado' && <Send className={`w-3.5 h-3.5 ${estado.color}`} />}
              {estado.label === 'En proceso' && <Hourglass className={`w-3.5 h-3.5 ${estado.color}`} />}
              {estado.label === 'Descartado' && <XCircle className={`w-3.5 h-3.5 ${estado.color}`} />}
            </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{estado.label}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-auto">{counts[estado.label] || 0}</span>
          </div>
        ))}
      </div>

      {filter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtrando por: <strong className="text-gray-900 dark:text-gray-100">{filter}</strong></span>
          <button onClick={() => setFilter(null)} className="text-sm text-violet-500 hover:underline">Mostrar todo</button>
        </div>
      )}

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
                          onClick={(e) => { e.stopPropagation(); navigate(`/editar/${item.id}`); }}
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
    </div>
  );
}
