import type { Language } from '../i18n/translations';
export const PROJECTS_PER_PAGE = 6;
export const projectGroups = ['all', 'homes', 'handwerk', 'beauty', 'automotive', 'food'] as const;
export const galleryCopy = {
 de: { filters: ['Alle Projekte','Hausbau','Handwerk & Service','Beauty & Lifestyle','Automotive','Cafés & Gastronomie'], all:'Alle Arbeiten ansehen', title:'Ideen zum Anklicken.', intro:'Vom Hauskatalog bis zum digitalen Menü: Schau dich um und probiere aus, was zu deinem Unternehmen passen könnte.', back:'Zur Startseite', label:'Arbeiten filtern', pagination:'Projektseiten', previous:'Zurück', next:'Weiter', page:'Seite', of:'von', empty:'Hier gibt es noch keine Projekte.' },
 en: { filters: ['All projects','Homes & building','Trades & services','Beauty & lifestyle','Automotive','Cafés & food'], all:'Explore all work', title:'Ideas you can try.', intro:'From house catalogues to digital menus: explore the websites and try the features that could work for your business.', back:'Back to home', label:'Filter projects', pagination:'Project pages', previous:'Previous', next:'Next', page:'Page', of:'of', empty:'No projects here yet.' },
 ru: { filters: ['Все проекты','Дома и строительство','Мастера и сервис','Красота и уход','Автомобили','Кафе и гастрономия'], all:'Весь каталог работ', title:'Не только посмотреть. Попробовать.', intro:'Каталоги домов, сайты для мастеров и цифровое меню. Открывай проекты, пробуй функции и находи идеи для своего бизнеса.', back:'На главную', label:'Фильтры проектов', pagination:'Страницы проектов', previous:'Назад', next:'Дальше', page:'Страница', of:'из', empty:'В этой категории пока нет проектов.' },
} satisfies Record<Language, Record<string, string | string[]>>;
export function selectProjectPage<T extends { group: string }>(projects: readonly T[], group = 'all', page = 1) {
 const matches = projects.filter(project => group === 'all' || project.group === group);
 const pages = Math.max(1, Math.ceil(matches.length / PROJECTS_PER_PAGE));
 const current = Math.min(pages, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
 return { items: matches.slice((current - 1) * PROJECTS_PER_PAGE, current * PROJECTS_PER_PAGE), total: matches.length, pages, current };
}
