export interface ExperienciaRaw {
  empresa: string;
  cargo: string;
  periodo: string;
  tareas: string[];
}

export type IdiomaItem = Record<string, string[]>;

export interface UserProfile {
  informacionPersonal: string;
  softSkills: string[];
  experiencia: ExperienciaRaw[];
  tecnologias: string[];
  formacion: string;
  idiomas: IdiomaItem[];
  foto: string;
}

export type LanguageKey = 'castellano' | 'catalan' | 'english';
export type ProfileKey = 'desarrollador' | 'conductor' | 'mozo-de-almacen';

const header = {
  nombre: 'Damián',
  apellidos: 'Nardini',
  telefono: '+34 717 719 387',
  direccion: '08018, Barcelona',
  correo: 'damiannardini@gmail.com',
  web: 'www.damiannardini.com',
};

export const userData = { header };

const castellanoIdiomas: IdiomaItem[] = [
  { 'Inglés': ['Comprensión: Alta', 'Escrito: Alto', 'Hablado: Medio'] },
  { 'Castellano': ['Nivel: Nativo'] },
  { 'Catalán': ['Comprensión: Alta', 'Hablado: Básico', 'Escrito: Básico'] },
];

const catalanIdiomas: IdiomaItem[] = [
  { 'Anglès': ['Comprensió: Alta', 'Escrit: Alt', 'Parlat: Mitjà'] },
  { 'Castellà': ['Nivell: Natiu'] },
  { 'Català': ['Comprensió: Alta', 'Parlat: Bàsic', 'Escrit: Bàsic'] },
];

const englishIdiomas: IdiomaItem[] = [
  { 'Spanish': ['Level: Native'] },
  { 'English': ['Comprehension: High', 'Written: High', 'Spoken: Medium'] },
  { 'Catalan': ['Comprehension: High', 'Spoken: Basic', 'Written: Basic'] },
];

const desarrolladorCastellano: UserProfile = {
  informacionPersonal: `Desarrollador frontend con una base técnica sólida y en evolución constante, enfocado en tecnologías modernas como React y TypeScript. Combino capacidad técnica, pensamiento estructurado y curiosidad intelectual. No solo implemento interfaces, sino que intento entender por qué se construyen de cierta manera. Detecto ineficiencias en procesos y propongo mejoras prácticas, con mentalidad de mejora de sistema, no solo de ejecución individual.`,
  softSkills: ['Pensamiento analítico y estructurado', 'Orientación a la mejora continua', 'Resolución de problemas', 'Aprendizaje autónomo', 'Pensamiento crítico', 'Capacidad de adaptación', 'Autonomía', 'Flexibilidad', 'Comunicación efectiva', 'Orientación a la eficiencia'],
  experiencia: [
    { empresa: 'Suntransfers, Beezy, Multiplica, Globant', cargo: 'Desarrollo Frontend', periodo: '+10 años', tareas: ['Desarrollo de interfaces web con HTML5, CSS3 y JavaScript', 'Arquitectura CSS escalable (BEMIT, ITCSS)', 'Creación de componentes reutilizables', 'Organización de código frontend en proyectos grandes', 'Optimización de rendimiento y tiempos de carga', 'Integración con APIs y servicios backend', 'Configuración de entornos con Webpack', 'Uso de React, TypeScript, Vue y Storybook'] },
    { empresa: 'Beezy, Suntransfers', cargo: 'Arquitecto CSS', periodo: '+6 años', tareas: ['Definición de sistemas de diseño y estructuras CSS', 'Arquitectura CSS escalable (BEMIT, ITCSS)', 'Creación de layouts complejos y sistemas modulares', 'Desarrollo de plantillas con Handlebars y HTML', 'Maquetación de emails responsive', 'Control de calidad visual y coherencia UI'] },
    { empresa: 'Freelance', cargo: 'Automatización & AI-driven Workflows', periodo: '+2 años', tareas: ['Automatización de procesos con n8n', 'Integración de APIs (WhatsApp, Google Workspace, etc.)', 'Diseño de flujos para reducir tareas manuales', 'Autoalojamiento con Docker', 'Integración de modelos LLM en entornos locales', 'Desarrollo de interfaces para automatizaciones', 'Mantenimiento y debugging en producción'] },
  ],
  tecnologias: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML / CSS / SCSS / Tailwind', 'Zustand / Redux Toolkit', 'TanStack Query (React Query)', 'Vite', 'Webpack', 'ESLint / Prettier', 'Jest', 'React Testing Library', 'Git (GitHub, Bitbucket)', 'REST APIs', 'GraphQL', 'n8n (automatización)', 'Figma', 'VS Code', 'Cursor', 'Wordpress'],
  formacion: `ANALISTA EN DISEÑO DIGITAL\nINSTITUTO BELGRANO | ROSARIO\n2005\nDurante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,
  idiomas: castellanoIdiomas,
  foto: '/assets/foto_dev.jpg',
};

const desarrolladorCatalan: UserProfile = {
  informacionPersonal: `Desenvolupador frontend amb una base tècnica sòlida i en evolució constant, especialment enfocat en tecnologies modernes com React i TypeScript. El meu perfil combina capacitat tècnica, pensament estructurat i curiositat intel·lectual. No només implemento interfícies, sinó que intento entendre per què es construeixen d'una certa manera. Detecto ineficiències en processos i proposo millores pràctiques, amb mentalitat de millora de sistema, no només d'execució individual.`,
  softSkills: ['Pensament analític i estructurat', 'Orientació a la millora contínua', 'Resolució de problemes', 'Aprenentatge autònom', 'Pensament crític', 'Capacitat d\'adaptació', 'Autonomia', 'Flexibilitat', 'Comunicació en desenvolupament', 'Treball en equip amb criteri propi'],
  experiencia: [
    { empresa: 'Suntransfers, Beezy, Multiplica, Globant', cargo: 'Desenvolupament Frontend', periodo: '+10 anys', tareas: ['Desenvolupament d\'interfícies web amb HTML5, CSS3 i JavaScript', 'Arquitectura CSS escalable (BEMIT, ITCSS)', 'Creació de components reutilitzables', 'Organització de codi frontend en projectes grans', 'Optimització de rendiment i temps de càrrega', 'Integració amb APIs i serveis backend', 'Configuració d\'entorns amb Webpack', 'Ús de React, TypeScript, Vue i Storybook'] },
    { empresa: 'Beezy, Suntransfers', cargo: 'Arquitecte CSS', periodo: '+6 anys', tareas: ['Definició de sistemes de disseny i estructures CSS', 'Arquitectura CSS escalable (BEMIT, ITCSS)', 'Creació de layouts complexos i sistemes modulars', 'Desenvolupament de plantilles amb Handlebars i HTML', 'Maquetació d\'emails responsive', 'Control de qualitat visual i coherència UI'] },
    { empresa: 'Freelance', cargo: 'Automatització i fluxos IA', periodo: '+2 anys', tareas: ['Automatització de processos amb n8n', 'Integració d\'APIs (WhatsApp, Google Workspace, etc.)', 'Disseny de fluxos per reduir tasques manuals', 'Autoallotjament amb Docker', 'Integració de models LLM en entorns locals', 'Desenvolupament d\'interfícies per automatitzacions', 'Manteniment i depuració en producció'] },
  ],
  tecnologias: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML / CSS / SCSS / Tailwind', 'Zustand / Redux Toolkit', 'TanStack Query (React Query)', 'Vite', 'Webpack', 'ESLint / Prettier', 'Jest', 'React Testing Library', 'Git (GitHub, Bitbucket)', 'REST APIs', 'GraphQL', 'n8n (automatització)', 'Figma', 'VS Code', 'Cursor'],
  formacion: `ANALISTA EN DISSENY DIGITAL\nINSTITUTO BELGRANO | ROSARIO\n2005\nDurant la carrera em vaig formar com a animador 3D i disseny multimèdia, adquirint experiència en creació de continguts per a vídeo, productes interactius i desenvolupament i programació de pàgines web.`,
  idiomas: catalanIdiomas,
  foto: '/assets/foto_dev.jpg',
};

const desarrolladorEnglish: UserProfile = {
  informacionPersonal: `Frontend developer with a solid technical foundation and continuous growth, especially focused on modern technologies such as React and TypeScript. My profile combines technical ability, structured thinking, and intellectual curiosity. I do not only implement interfaces—I try to understand why they are built a certain way. I spot inefficiencies in workflows and propose practical improvements, with a systems-improvement mindset, not only individual execution.`,
  softSkills: ['Analytical, structured thinking', 'Orientation to continuous improvement', 'Problem solving', 'Self-directed learning', 'Critical thinking', 'Adaptability', 'Autonomy', 'Flexibility', 'Communication in development', 'Teamwork with own judgment'],
  experiencia: [
    { empresa: 'Suntransfers, Beezy, Multiplica, Globant', cargo: 'Frontend Development', periodo: '+10 years', tareas: ['Web interface development with HTML5, CSS3 and JavaScript', 'Scalable CSS architecture (BEMIT, ITCSS)', 'Creation of reusable components', 'Frontend code organization in large projects', 'Performance optimization and load times', 'Integration with APIs and backend services', 'Environment configuration with Webpack', 'Use of React, TypeScript, Vue and Storybook'] },
    { empresa: 'Beezy, Suntransfers', cargo: 'CSS Architect', periodo: '+6 years', tareas: ['Design system definition and CSS structures', 'Scalable CSS architecture (BEMIT, ITCSS)', 'Creation of complex layouts and modular systems', 'Template development with Handlebars and HTML', 'Responsive email layout', 'Visual quality control and UI consistency'] },
    { empresa: 'Freelance', cargo: 'Automation & AI-driven Workflows', periodo: '+2 years', tareas: ['Process automation with n8n', 'API integration (WhatsApp, Google Workspace, etc.)', 'Workflow design to reduce manual tasks', 'Self-hosting with Docker', 'LLM model integration in local environments', 'Interface development for automations', 'Maintenance and debugging in production'] },
  ],
  tecnologias: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML / CSS / SCSS / Tailwind', 'Zustand / Redux Toolkit', 'TanStack Query (React Query)', 'Vite', 'Webpack', 'ESLint / Prettier', 'Jest', 'React Testing Library', 'Git (GitHub, Bitbucket)', 'REST APIs', 'GraphQL', 'n8n (automation)', 'Figma', 'VS Code', 'Cursor'],
  formacion: `DIGITAL DESIGN ANALYST\nINSTITUTO BELGRANO | ROSARIO\n2005\nDuring my studies I trained as a 3D animator and multimedia designer, gaining experience in content creation for video, interactive products, and web development and programming.`,
  idiomas: englishIdiomas,
  foto: '/assets/foto_dev.jpg',
};

const conductorCastellano: UserProfile = {
  informacionPersonal: `Conductor responsable y orientado al servicio, con experiencia previa en transporte de pasajeros en remisería durante 2 años. Acostumbrado a trabajar con clientes, gestionar rutas de forma eficiente y mantener altos estándares de puntualidad, seguridad y trato profesional. Destaco por mi capacidad de adaptación, resolución de imprevistos y enfoque en la experiencia del usuario.`,
  softSkills: ['Atención al cliente', 'Trato respetuoso y profesional', 'Comunicación clara y tranquila', 'Gestión del estrés en tráfico', 'Paciencia en situaciones difíciles', 'Orientación al servicio', 'Puntualidad y responsabilidad', 'Conducción segura y preventiva', 'Adaptación a rutas y cambios', 'Resolución rápida de incidencias', 'Discreción con los pasajeros', 'Autocontrol emocional', 'Capacidad de concentración prolongada', 'Conocimiento básico de la ciudad', 'Actitud resolutiva ante imprevistos'],
  experiencia: [
    { empresa: 'Fundación (Barcelona)', cargo: 'Conductor - Logística y Transporte', periodo: 'Actualmente', tareas: ['Transporte de pasajeros en trayectos urbanos y traslados al aeropuerto', 'Recogida y distribución de mercadería', 'Traslado de personas y mercancías dentro de Barcelona y alrededores', 'Planificación y optimización de rutas', 'Gestión de tiempos de entrega y recogida', 'Resolución de incidencias durante el servicio', 'Atención al cliente y trato profesional'] },
    { empresa: 'Remisería (Argentina)', cargo: 'Conductor - Remisería', periodo: '2 años', tareas: ['Transporte de pasajeros en trayectos urbanos e interurbanos', 'Atención al cliente y trato profesional', 'Gestión eficiente de rutas y tiempos', 'Resolución de imprevistos durante el servicio'] },
    { empresa: 'Sector agrícola (Argentina)', cargo: 'Operador de maquinaria agrícola / Conductor', periodo: '3 años', tareas: ['Manejo de maquinaria agrícola en entornos rurales', 'Conducción en condiciones variables (terreno irregular, clima, visibilidad)', 'Responsabilidad sobre equipos y seguridad operativa', 'Mantenimiento básico de maquinaria'] },
    { empresa: 'Servicio técnico de telecomunicaciones', cargo: 'Conductor - Vehículo técnico', periodo: '1 año aprox.', tareas: ['Conducción de camión de trabajo para mantenimiento de infraestructura', 'Desplazamientos a distintas ubicaciones para reparación de antenas de internet', 'Coordinación con equipo técnico', 'Apoyo en tareas logísticas del servicio'] },
  ],
  tecnologias: ['Google Maps, Waze', 'Uber, Cabify', 'GPS y optimización de rutas', 'Smartphone y aplicaciones móviles de trabajo', 'Gestión básica de incidencias en ruta'],
  formacion: `ANALISTA EN DISEÑO DIGITAL\nINSTITUTO BELGRANO | ROSARIO\n2005\nDurante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,
  idiomas: castellanoIdiomas,
  foto: '/assets/foto_conductor.jpg',
};

const mozoCastellano: UserProfile = {
  informacionPersonal: `Profesional responsable y eficiente con experiencia en gestión de almacén, preparación de pedidos y organización de mercancía. Orientado al trabajo en equipo, la seguridad operativa y la eficiencia en procesos logísticos. Puntual, organizado y con capacidad para trabajar en entornos dinámicos y ritmos intensos.`,
  softSkills: ['Organización y orden', 'Atención al detalle', 'Trabajo en equipo', 'Gestión del tiempo', 'Resistencia física', 'Responsabilidad', 'Cumplimiento de procedimientos', 'Adaptación a ritmos intensos', 'Precisión en la preparación de pedidos', 'Seguridad en el trabajo'],
  experiencia: [
    { empresa: 'Cooperativa Agrícola Berabevú', cargo: 'Mozo de almacén', periodo: '2 años', tareas: ['Recepción, organización y reposición de mercancía', 'Preparación y embalaje de pedidos', 'Control de stock e inventario básico', 'Mantenimiento del orden y limpieza del almacén', 'Cumplimiento de normas de seguridad'] },
    { empresa: 'Cibercafé, Heladería, Bar, Restaurante', cargo: 'Atención al público y restauración', periodo: '3 años', tareas: ['Atención directa al cliente en mostrador y sala', 'Toma de pedidos y servicio de productos', 'Preparación básica de alimentos y bebidas', 'Cobro en caja y gestión de pagos', 'Resolución de incidencias y trato cordial con clientes', 'Mantenimiento de limpieza y orden del local'] },
  ],
  tecnologias: ['Gestión de almacén', 'Preparación de pedidos', 'Control de inventario', 'Normas de seguridad', 'Trabajo en equipo'],
  formacion: `ANALISTA EN DISEÑO DIGITAL\nINSTITUTO BELGRANO | ROSARIO\n2005\nDurante la carrera me formé como animador 3D y diseño multimedia, adquiriendo experiencia en creación de contenidos para video, productos interactivos y desarrollo y programación de páginas web.`,
  idiomas: castellanoIdiomas,
  foto: '/assets/foto_mozo.jpg',
};

const mozoCatalan: UserProfile = {
  informacionPersonal: `Professional responsable i eficient amb experiència en gestió d'almacén, preparació de comandes i organització de mercaderia. Orientat al treball en equip, la seguretat operativa i l'eficiència en processos logístics. Puntual, organitzat i amb capacitat per treballar en entorns dinàmics i ritmes intensos.`,
  softSkills: ['Organització i ordre', 'Atenció al detall', 'Treball en equip', 'Gestió del temps', 'Resistència física', 'Responsabilitat', 'Compliment de procediments', 'Adaptació a ritmes intensos', 'Precisió en la preparació de comandes', 'Seguretat en el treball'],
  experiencia: [
    { empresa: 'Cooperativa Agrícola Berabevú', cargo: 'Moço d\'almacén', periodo: '2 anys', tareas: ['Recepció, organització i reposició de mercaderia', 'Preparació i embalatge de comandes', 'Control d\'estoc i inventari bàsic', 'Manteniment de l\'ordre i neteja de l\'almacén', 'Compliment de normes de seguretat'] },
    { empresa: 'Cibercafè, Gelateria, Bar, Restaurant', cargo: 'Atenció al públic i restauració', periodo: '3 anys', tareas: ['Atenció directa al client en mostrador i sala', 'Presa de comandes i servei de productes', 'Preparació bàsica d\'aliments i begudes', 'Cobrament en caixa i gestió de pagaments', 'Resolució d\'incidències i tracte cordial amb clients', 'Manteniment de neteja i ordre del local'] },
  ],
  tecnologias: ['Gestió d\'almacén', 'Preparació de comandes', 'Control d\'inventari', 'Normes de seguretat', 'Treball en equip'],
  formacion: `ANALISTA EN DISSENY DIGITAL\nINSTITUTO BELGRANO | ROSARIO\n2005\nDurant la carrera em vaig formar com a animador 3D i disseny multimèdia, adquirint experiència en creació de continguts per a vídeo, productes interactius i desenvolupament i programació de pàgines web.`,
  idiomas: catalanIdiomas,
  foto: '/assets/foto_mozo.jpg',
};

export const profileMap: Record<ProfileKey, Record<LanguageKey, UserProfile | null>> = {
  desarrollador: { castellano: desarrolladorCastellano, catalan: desarrolladorCatalan, english: desarrolladorEnglish },
  conductor: { castellano: conductorCastellano, catalan: null, english: null },
  'mozo-de-almacen': { castellano: mozoCastellano, catalan: mozoCatalan, english: null },
};

export const profileMeta: Record<ProfileKey, { label: string; foto: string }> = {
  desarrollador: { label: 'Desarrollador Frontend', foto: '/assets/foto_dev.jpg' },
  conductor: { label: 'Conductor VTC', foto: '/assets/foto_conductor.jpg' },
  'mozo-de-almacen': { label: 'Mozo de Almacén', foto: '/assets/foto_mozo.jpg' },
};

export function getProfile(profileKey: ProfileKey, language: LanguageKey): UserProfile {
  return profileMap[profileKey]?.[language] || profileMap[profileKey]?.castellano || desarrolladorCastellano;
}

export const languageLabels: Record<LanguageKey, string> = { castellano: 'Castellano', catalan: 'Catalán', english: 'Inglés' };
