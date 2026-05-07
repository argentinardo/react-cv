export interface IdiomaItem {
  [idioma: string]: string[];
}

export interface UserProfile {
  informacionPersonal: string;
  softSkills: string[];
  experiencia: ExperienciaRaw[];
  tecnologias: string[];
  formacion: string;
  idiomas: IdiomaItem[];
  foto: string;
}

export interface ExperienciaRaw {
  empresa: string;
  cargo: string;
  periodo: string;
  tareas: string[];
}

export const desarrollador: UserProfile = {
  informacionPersonal: `Desarrollador frontend con una base técnica sólida y en evolución constante, enfocado en tecnologías modernas como React y TypeScript. Combino capacidad técnica, pensamiento estructurado y curiosidad intelectual. No solo implemento interfaces, sino que intento entender por qué se construyen de cierta manera. Detecto ineficiencias en procesos y propongo mejoras prácticas, con mentalidad de mejora de sistema, no solo de ejecución individual.`,

  softSkills: [
    'Pensamiento analítico y estructurado',
    'Orientación a la mejora continua',
    'Resolución de problemas',
    'Aprendizaje autónomo',
    'Pensamiento crítico',
    'Capacidad de adaptación',
    'Autonomía',
    'Flexibilidad',
    'Comunicación efectiva',
    'Orientación a la eficiencia',
  ],

  experiencia: [
    {
      empresa: 'Suntransfers, Beezy, Multiplica, Globant',
      cargo: 'Desarrollo Frontend',
      periodo: '+10 años',
      tareas: [
        'Desarrollo de interfaces web con HTML5, CSS3 y JavaScript',
        'Arquitectura CSS escalable (BEMIT, ITCSS)',
        'Creación de componentes reutilizables',
        'Organización de código frontend en proyectos grandes',
        'Optimización de rendimiento y tiempos de carga',
        'Integración con APIs y servicios backend',
        'Configuración de entornos con Webpack',
        'Uso de React, TypeScript, Vue y Storybook',
      ],
    },
    {
      empresa: 'Beezy, Suntransfers',
      cargo: 'Arquitecto CSS',
      periodo: '+6 años',
      tareas: [
        'Definición de sistemas de diseño y estructuras CSS',
        'Arquitectura CSS escalable (BEMIT, ITCSS)',
        'Creación de layouts complejos y sistemas modulares',
        'Desarrollo de plantillas con Handlebars y HTML',
        'Maquetación de emails responsive',
        'Control de calidad visual y coherencia UI',
      ],
    },
    {
      empresa: 'Freelance',
      cargo: 'Automatización & AI-driven Workflows',
      periodo: '+2 años',
      tareas: [
        'Automatización de procesos con n8n',
        'Integración de APIs (WhatsApp, Google Workspace, etc.)',
        'Diseño de flujos para reducir tareas manuales',
        'Autoalojamiento con Docker',
        'Integración de modelos LLM en entornos locales',
        'Desarrollo de interfaces para automatizaciones',
        'Mantenimiento y debugging en producción',
      ],
    },
  ],

  tecnologias: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'HTML / CSS / SCSS / Tailwind',
    'Zustand / Redux Toolkit',
    'TanStack Query (React Query)',
    'Vite',
    'Webpack',
    'ESLint / Prettier',
    'Jest',
    'React Testing Library',
    'Git (GitHub, Bitbucket)',
    'REST APIs',
    'GraphQL',
    'n8n (automatización)',
    'Figma',
    'VS Code',
    'Cursor',
    'Wordpress',
  ],

  formacion: `ANALISTA EN DISEÑO DIGITAL
INSTITUTO BELGRANO | ROSARIO
2005
Durante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,

  idiomas: [
    { 'Inglés': [ 'Comprensión: Alta', 'Escrito: Alto', 'Hablado: Medio' ]},
    { 'Castellano': [ 'Nivel: Nativo' ]},
    { 'Catalán': [ 'Comprensión: Alta', 'Hablado: Básico', 'Escrito: Básico' ]},
  ],

  foto: '/assets/foto_dev.jpg',
};

export const conductor: UserProfile = {
  informacionPersonal: `Conductor responsable y orientado al servicio, con experiencia previa en transporte de pasajeros en remisería durante 2 años. Acostumbrado a trabajar con clientes, gestionar rutas de forma eficiente y mantener altos estándares de puntualidad, seguridad y trato profesional. Destaco por mi capacidad de adaptación, resolución de imprevistos y enfoque en la experiencia del usuario. Busco incorporarme como conductor VTC aportando compromiso, conducción segura y atención al cliente de calidad.`,

  softSkills: [
    'Atención al cliente',
    'Trato respetuoso y profesional',
    'Comunicación clara y tranquila',
    'Gestión del estrés en tráfico',
    'Paciencia en situaciones difíciles',
    'Orientación al servicio',
    'Puntualidad y responsabilidad',
    'Conducción segura y preventiva',
    'Adaptación a rutas y cambios',
    'Resolución rápida de incidencias',
    'Discreción con los pasajeros',
    'Autocontrol emocional',
    'Capacidad de concentración prolongada',
    'Conocimiento básico de la ciudad',
    'Actitud resolutiva ante imprevistos',
  ],

  experiencia: [
    {
      empresa: 'Fundación (Barcelona)',
      cargo: 'Conductor - Logística y Transporte',
      periodo: 'Actualmente',
      tareas: [
        'Transporte de pasajeros en trayectos urbanos y traslados al aeropuerto',
        'Recogida y distribución de mercadería',
        'Traslado de personas y mercancías dentro de Barcelona y alrededores',
        'Planificación y optimización de rutas',
        'Gestión de tiempos de entrega y recogida',
        'Resolución de incidencias durante el servicio',
        'Atención al cliente y trato profesional',
      ],
    },
    {
      empresa: 'Remisería (Argentina)',
      cargo: 'Conductor - Remisería',
      periodo: '2 años',
      tareas: [
        'Transporte de pasajeros en trayectos urbanos e interurbanos',
        'Atención al cliente y trato profesional',
        'Gestión eficiente de rutas y tiempos',
        'Resolución de imprevistos durante el servicio',
      ],
    },
    {
      empresa: 'Sector agrícola (Argentina)',
      cargo: 'Operador de maquinaria agrícola / Conductor',
      periodo: '3 años',
      tareas: [
        'Manejo de maquinaria agrícola en entornos rurales',
        'Conducción en condiciones variables (terreno irregular, clima, visibilidad)',
        'Responsabilidad sobre equipos y seguridad operativa',
        'Mantenimiento básico de maquinaria',
      ],
    },
    {
      empresa: 'Servicio técnico de telecomunicaciones',
      cargo: 'Conductor - Vehículo técnico',
      periodo: '1 año aprox.',
      tareas: [
        'Conducción de camión de trabajo para mantenimiento de infraestructura',
        'Desplazamientos a distintas ubicaciones para reparación de antenas de internet',
        'Coordinación con equipo técnico',
        'Apoyo en tareas logísticas del servicio',
      ],
    },
  ],

  tecnologias: [
    'Google Maps, Waze',
    'Uber, Cabify',
    'GPS y optimización de rutas',
    'Smartphone y aplicaciones móviles de trabajo',
    'Gestión básica de incidencias en ruta',
  ],

  formacion: `ANALISTA EN DISEÑO DIGITAL
INSTITUTO BELGRANO | ROSARIO
2005
Durante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,

  idiomas: [
    { 'Inglés': [ 'Comprensión: Alta', 'Escrito: Alto', 'Hablado: Medio' ]},
    { 'Castellano': [ 'Nivel: Nativo' ]},
    { 'Catalán': [ 'Comprensión: Alta', 'Hablado: Básico', 'Escrito: Básico' ]},
  ],

  foto: '/assets/foto_conductor.jpg',
};

export const mozoDeAlmacen: UserProfile = {
  informacionPersonal: `Profesional responsable y eficiente con experiencia en gestión de almacén, preparación de pedidos y organización de mercancía. Orientado al trabajo en equipo, la seguridad operativa y la eficiencia en procesos logísticos. Puntual, organizado y con capacidad para trabajar en entornos dinámicos y ritmos intensos.`,

  softSkills: [
    'Organización y orden',
    'Atención al detalle',
    'Trabajo en equipo',
    'Gestión del tiempo',
    'Resistencia física',
    'Responsabilidad',
    'Cumplimiento de procedimientos',
    'Adaptación a ritmos intensos',
    'Precisión en la preparación de pedidos',
    'Seguridad en el trabajo',
  ],

  experiencia: [
    {
      empresa: 'Cooperativa Agrícola Berabevú',
      cargo: 'Mozo de almacén',
      periodo: '2 años',
      tareas: [
        'Recepción, organización y reposición de mercancía',
        'Preparación y embalaje de pedidos',
        'Control de stock e inventario básico',
        'Mantenimiento del orden y limpieza del almacén',
        'Cumplimiento de normas de seguridad',
      ],
    },
    {
      empresa: 'Cibercafé, Heladería, Bar, Restaurante',
      cargo: 'Atención al público y restauración',
      periodo: '3 años',
      tareas: [
        'Atención directa al cliente en mostrador y sala',
        'Toma de pedidos y servicio de productos',
        'Preparación básica de alimentos y bebidas',
        'Cobro en caja y gestión de pagos',
        'Resolución de incidencias y trato cordial con clientes',
        'Mantenimiento de limpieza y orden del local',
      ],
    },
  ],

  tecnologias: [
    'Gestión de almacén',
    'Preparación de pedidos',
    'Control de inventario',
    'Normas de seguridad',
    'Trabajo en equipo',
  ],

  formacion: `ANALISTA EN DISEÑO DIGITAL
INSTITUTO BELGRANO | ROSARIO
2005
Durante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,

  idiomas: [
    { 'Inglés': [ 'Comprensión: Alta', 'Escrito: Alto', 'Hablado: Medio' ]},
    { 'Castellano': [ 'Nivel: Nativo' ]},
    { 'Catalán': [ 'Comprensión: Alta', 'Hablado: Básico', 'Escrito: Básico' ]},
  ],

  foto: '/assets/foto_mozo.jpg',
};

export const profileMap: Record<string, UserProfile> = {
  desarrollador,
  conductor,
  'mozo-de-almacen': mozoDeAlmacen,
};

export const profileMeta: Record<string, { label: string; foto: string }> = {
  desarrollador: { label: 'Desarrollador Frontend', foto: '/assets/foto_dev.jpg' },
  conductor: { label: 'Conductor VTC', foto: '/assets/foto_conductor.jpg' },
  'mozo-de-almacen': { label: 'Mozo de Almacén', foto: '/assets/foto_mozo.jpg' },
};

export const userData = {
  header: {
    nombre: 'Damián',
    apellidos: 'Nardini',
    telefono: '+34 717 719 387',
    direccion: '08018, Barcelona',
    correo: 'damiannardini@gmail.com',
    web: 'www.damiannardini.com',
  },
  profiles: profileMap,
  meta: profileMeta,
};

export type ProfileKey = keyof typeof profileMap;
