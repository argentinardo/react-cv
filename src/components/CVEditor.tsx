import { useState, useEffect } from 'react';
import type { CVMasterData, IdiomaItem } from '@/types/cv';
import { Save, ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap, MessageSquare, Languages, Wrench, FileText, ClipboardList } from 'lucide-react';

interface Props {
  cvData: CVMasterData;
  onGuardar: (data: CVMasterData) => Promise<void>;
  onVolver: () => void;
  saving?: boolean;
  postId?: string;
}

export default function CVEditor({ cvData, onGuardar, onVolver, saving = false, postId }: Props) {
  const [data, setData] = useState<CVMasterData>(cvData);
  const [activeTab, setActiveTab] = useState<string>('header');

  useEffect(() => {
    setData(cvData);
  }, [cvData]);

  const updateHeader = (field: string, value: string) => {
    setData((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));
  };

  const addExperience = () => {
    const newExp = { titulo: '', duracion: '', ocupacion: '', empresas: [], tareas: [] };
    setData((prev) => ({ ...prev, experiencia: [...prev.experiencia, newExp] }));
  };

  const removeExperience = (index: number) => {
    setData((prev) => ({ ...prev, experiencia: prev.experiencia.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setData((prev) => {
      const exp = [...prev.experiencia];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experiencia: exp };
    });
  };

  const addArrayItem = (section: 'tecnologias' | 'softSkills' | 'idiomas') => {
    const emptyValue = section === 'idiomas' ? { 'Nuevo idioma': ['Nivel: Nativo'] } as IdiomaItem : '';
    setData((prev) => ({ ...prev, [section]: [...prev[section], emptyValue] }));
  };

  const updateArrayItem = (section: 'tecnologias' | 'softSkills' | 'idiomas', index: number, value: string | IdiomaItem) => {
    setData((prev) => {
      const arr = [...prev[section]];
      arr[index] = value as any;
      return { ...prev, [section]: arr };
    });
  };

  const removeArrayItem = (section: 'tecnologias' | 'softSkills' | 'idiomas', index: number) => {
    setData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const tabs = [
    { id: 'header', label: 'Datos Personales', icon: User },
    { id: 'sobremi', label: 'Sobre mí', icon: MessageSquare },
    { id: 'experiencia', label: 'Experiencia', icon: Briefcase },
    { id: 'formacion', label: 'Formación', icon: GraduationCap },
    { id: 'skills', label: 'Tecnologías', icon: Wrench },
    { id: 'softskills', label: 'Soft Skills', icon: Wrench },
    { id: 'idiomas', label: 'Idiomas', icon: Languages },
    { id: 'resumen', label: 'Resumen Oferta', icon: ClipboardList },
    { id: 'carta', label: 'Carta Intención', icon: FileText },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Editar CV Generado</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revisa y ajusta los datos antes de guardar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onVolver} className="btn border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button onClick={() => onGuardar(data)} disabled={saving} className="btn bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {postId ? 'Actualizar' : 'Guardar Postulación'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-64 shrink-0">
          <nav className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow-xs rounded-xl p-6">
          {activeTab === 'header' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(data.header).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 capitalize">{key}</label>
                  <input value={value} onChange={(e) => updateHeader(key, e.target.value)} className="form-input w-full" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sobremi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sobre mí</label>
              <textarea
                value={data.sobreMi}
                onChange={(e) => setData((prev) => ({ ...prev, sobreMi: e.target.value }))}
                rows={6}
                className="form-textarea w-full resize-y"
              />
            </div>
          )}

          {activeTab === 'experiencia' && (
            <div className="space-y-4">
              {data.experiencia.map((exp, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experiencia #{i + 1}</span>
                    <button onClick={() => removeExperience(i)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={exp.titulo} onChange={(e) => updateExperience(i, 'titulo', e.target.value)} placeholder="Título" className="form-input w-full" />
                    <input value={exp.duracion} onChange={(e) => updateExperience(i, 'duracion', e.target.value)} placeholder="Duración" className="form-input w-full" />
                  </div>
                  <input value={exp.ocupacion} onChange={(e) => updateExperience(i, 'ocupacion', e.target.value)} placeholder="Ocupación" className="form-input w-full" />
                  <textarea
                    value={exp.tareas.join('\n')}
                    onChange={(e) => {
                      const tareas = e.target.value.split('\n').filter(Boolean);
                      setData((prev) => {
                        const exps = [...prev.experiencia];
                        exps[i] = { ...exps[i], tareas };
                        return { ...prev, experiencia: exps };
                      });
                    }}
                    placeholder="Tareas (una por línea)"
                    rows={4}
                    className="form-textarea w-full resize-y"
                  />
                </div>
              ))}
              <button onClick={addExperience} className="btn border-dashed border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                <Plus className="w-4 h-4" />
                Añadir experiencia
              </button>
            </div>
          )}

          {activeTab === 'formacion' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Formación</label>
              <textarea value={data.formacion} onChange={(e) => setData((prev) => ({ ...prev, formacion: e.target.value }))} rows={4} className="form-textarea w-full resize-y" />
            </div>
          )}

          {(activeTab === 'skills' || activeTab === 'softskills' || activeTab === 'idiomas') && (
            <div className="space-y-3">
              {(() => {
                const section = activeTab === 'skills' ? 'tecnologias' : activeTab === 'softskills' ? 'softSkills' : 'idiomas';
                const items = data[section];
                return (
                  <>
                     {items.map((item, i) => {
                       if (section === 'idiomas') {
                         const langItem = item as IdiomaItem;
                         const langName = Object.keys(langItem)[0] || '';
                         const attrs = langItem[langName] || [];
                         return (
                           <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                             <input value={langName} onChange={(e) => {
                               const newKey = e.target.value;
                               updateArrayItem(section, i, { [newKey]: attrs } as any);
                             }} placeholder="Idioma" className="form-input w-full" />
                             <textarea
                               value={attrs.join('\n')}
                               onChange={(e) => {
                                 const newAttrs = e.target.value.split('\n').filter(Boolean);
                                 updateArrayItem(section, i, { [langName]: newAttrs } as any);
                               }}
                               placeholder="Atributos (uno por línea)"
                               rows={3}
                               className="form-textarea w-full resize-y"
                             />
                             <button onClick={() => removeArrayItem(section, i)} className="text-red-500 hover:text-red-700 p-1">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         );
                       }
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <input value={item as string} onChange={(e) => updateArrayItem(section, i, e.target.value as any)} className="form-input flex-1" />
                          <button onClick={() => removeArrayItem(section, i)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    <button onClick={() => addArrayItem(section)} className="btn border-dashed border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                      <Plus className="w-4 h-4" />
                      Añadir
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'resumen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Resumen de la Oferta</label>
              <textarea
                value={data.resumenOferta || ''}
                onChange={(e) => setData((prev) => ({ ...prev, resumenOferta: e.target.value }))}
                placeholder="2-3 frases resumiendo la oferta..."
                rows={4}
                className="form-textarea w-full resize-y"
              />
            </div>
          )}

          {activeTab === 'carta' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Carta de Intención</label>
              <textarea
                value={data.cartaIntencion || ''}
                onChange={(e) => setData((prev) => ({ ...prev, cartaIntencion: e.target.value }))}
                placeholder="Carta de presentación adaptada a la oferta (máx 60 palabras)..."
                rows={6}
                className="form-textarea w-full resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
