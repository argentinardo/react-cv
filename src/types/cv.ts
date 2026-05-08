export interface Experiencia {
  titulo: string;
  duracion: string;
  ocupacion: string;
  empresas: string[];
  tareas: string[];
}

export interface IdiomaItem {
  [idioma: string]: string[];
}

export interface CVMasterData {
  header: {
    nombre: string;
    apellidos: string;
    titulacion: string;
    telefono: string;
    direccion: string;
    correo: string;
    web: string;
  };
  foto: string;
  sobreMi: string;
  tecnologias: string[];
  softSkills: string[];
  idiomas: IdiomaItem[];
  experiencia: Experiencia[];
  formacion: string;
  cartaIntencion: string;
  resumenOferta: string;
  empresaOferta: string;
}

export interface Postulacion {
  id?: string;
  empresa: string;
  portal: string;
  urlOferta: string;
  fecha: string;
  modeloIA: string;
  resumenOferta: string;
  cartaIntencion: string;
  cvData: CVMasterData;
  estado: 'Pendiente' | 'Enviado' | 'En proceso' | 'Descartado';
  notas: string;
}
