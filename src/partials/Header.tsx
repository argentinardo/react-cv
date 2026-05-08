import { Briefcase } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  variant?: 'default' | 'v2' | 'v3';
}

const jobPortals = [
  { name: 'Indeed', url: 'https://es.indeed.com/jobs?q=frontend&l=Barcelona%2C+Barcelona&fromage=7&radius=25', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'Tecnoempleo', url: 'https://www.tecnoempleo.com/ofertas-trabajo/?te=frontend&pr=240', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'Hays', url: 'https://www.hays.es/busqueda-empleo/front-end-developer-empleos-en-barcelona-spain?q=Front%20End%20Developer&location=Barcelona,%20Spain', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'PagePersonnel', url: 'https://www.pagepersonnel.es/jobs/front-end/barcelona', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'InfoJobs', url: 'https://www.infojobs.net/jobsearch/search-results/list.xhtml?id=58923308450&referer=search-recent', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'Jobtome', url: 'https://es.jobtome.com/empleos?keyword=front+end&location=Barcelona', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'Jooble', url: 'https://es.jooble.org/SearchResult?loc=10&p=2&rgns=Barcelona&ukw=front%20end%20developer', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=frontend&origin=JOB_COLLECTION_PAGE_SEARCH_BUTTON&location=Barcelona', color: 'text-gray-700 hover:text-violet-600 bg-gray-100 hover:bg-violet-50' },
];

export default function Header({ sidebarOpen, setSidebarOpen, variant = 'default' }: HeaderProps) {
  return (
    <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}>
      {/* Main bar */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}>
          <div className="flex">
            <button
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-500" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Job Manager</span>
          </div>
        </div>
      </div>
      {/* Job portals bar */}
      <div className="px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-1.5 h-8 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0 mr-1">Portales:</span>
          {jobPortals.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${portal.color}`}
            >
              {portal.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
