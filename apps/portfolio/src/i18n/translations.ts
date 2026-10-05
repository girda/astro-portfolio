export const languages = ["de", "ru", "en"] as const;

export type Language = (typeof languages)[number];

interface Translation {
    pageTitle: string;
    description: string;
    navigation: string;
    eyebrow: string;
    headline: [string, string];
    introduction: string;
    button: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectsDescription: string;
    planned: string;
    languageLabel: string;
    projects: {
        title: string;
        category: string;
    }[];
    servicesTitle: string;
    servicesDescription: string;
    services: {
        title: string;
        description: string;
    }[];
}

export const translations = {
    de: {
        pageTitle: "HIRDA. — Webdesign & Entwicklung",
        description:
            "Individuelle Websites für Selbstständige und kleine Unternehmen.",
        navigation: "Projekte ansehen",
        eyebrow: "WEBDESIGN & ENTWICKLUNG",
        headline: ["Dein Unternehmen.", "Ein klarer Auftritt."],
        introduction:
            "Ich bin Artem Hirda. Ich gestalte und entwickle Websites für Selbstständige und kleine Unternehmen — mit durchdachtem Design und klarer Struktur.",
        button: "Projekte ansehen",
        projectsEyebrow: "KONZEPTE & IDEEN",
        projectsTitle: "Vier Branchen. Neue Perspektiven.",
        projectsDescription:
            "Barbershop, Reinigung, Werkstatt und Nail Atelier: eigene Website-Konzepte, die ich Schritt für Schritt ausarbeite. Keine Kundenaufträge.",
        planned: "Geplant",
        languageLabel: "Sprache wählen",
        projects: [
            {
                title: "Barbershop",
                category: "Website für einen Barbershop",
            },
            {
                title: "Reinigungsservice",
                category: "Website für einen Reinigungsservice",
            },
            {
                title: "Auto-Service",
                category: "Website für eine Autowerkstatt",
            },
            {
                title: "Nail Atelier",
                category: "Website für ein Nagelstudio",
            },
        ],
        servicesTitle: "Websites mit einem klaren Ziel.",
        servicesDescription:
            "Ein passender Auftritt für dein Angebot — verständlich, übersichtlich und auf allen Geräten nutzbar.",
        services: [
            {
                title: "Business-Website",
                description:
                    "Stelle dein Unternehmen und deine Leistungen vor. Damit Interessierte schnell verstehen, was du anbietest und wie sie dich erreichen.",
            },
            {
                title: "Landingpage",
                description:
                    "Eine fokussierte Seite für ein konkretes Angebot, eine Kampagne oder den Start einer neuen Geschäftsidee.",
            },
            {
                title: "Website-Redesign",
                description:
                    "Ein neuer Auftritt für deine bestehende Website — mit klarer Struktur, zeitgemäßem Design und mobiler Ansicht.",
            },
        ],
    },

    ru: {
        pageTitle: "HIRDA. — Дизайн и разработка сайтов",
        description:
            "Индивидуальные сайты для частных специалистов и малого бизнеса.",
        navigation: "Посмотреть проекты",
        eyebrow: "ДИЗАЙН И РАЗРАБОТКА САЙТОВ",
        headline: ["Твой бизнес.", "Сайт с характером."],
        introduction:
            "Я Artem Hirda. Разрабатываю сайты для частных специалистов и малого бизнеса — с продуманным дизайном и понятной структурой.",
        button: "Посмотреть проекты",
        projectsEyebrow: "КОНЦЕПТЫ И ИДЕИ",
        projectsTitle: "Разные задачи. Свой подход.",
        projectsDescription:
            "Барбершоп, клининг, автосервис и маникюр: демонстрационные проекты, которые я постепенно разрабатываю. Это концепты, а не заказы клиентов.",
        planned: "В планах",
        languageLabel: "Выбрать язык",
        projects: [
            {
                title: "Барбершоп",
                category: "Сайт для барбершопа",
            },
            {
                title: "Клининг",
                category: "Сайт для клининговой компании",
            },
            {
                title: "Автосервис",
                category: "Сайт автомобильной мастерской",
            },
            {
                title: "Маникюр",
                category: "Сайт студии маникюра",
            },
        ],
        servicesTitle: "Сайты под задачи бизнеса.",
        servicesDescription:
            "Помогу понятно представить твои услуги и сделать сайт удобным на компьютере и телефоне.",
        services: [
            {
                title: "Сайт-визитка",
                description:
                    "Расскажет о компании и услугах, поможет посетителям разобраться в предложении и связаться с тобой.",
            },
            {
                title: "Лендинг",
                description:
                    "Страница для конкретной услуги, рекламной кампании или запуска новой бизнес-идеи.",
            },
            {
                title: "Редизайн сайта",
                description:
                    "Обновление существующего сайта: понятная структура, современное оформление и удобная мобильная версия.",
            },
        ],
    },

    en: {
        pageTitle: "HIRDA. — Web Design & Development",
        description:
            "Custom websites for independent professionals and small businesses.",
        navigation: "View projects",
        eyebrow: "WEB DESIGN & DEVELOPMENT",
        headline: ["Your business.", "A clear presence."],
        introduction:
            "I'm Artem Hirda. I design and develop websites for independent professionals and small businesses — with thoughtful design and a clear structure.",
        button: "View projects",
        projectsEyebrow: "CONCEPTS & IDEAS",
        projectsTitle: "Different businesses. Distinct websites.",
        projectsDescription:
            "Barbershop, cleaning service, auto service and nail atelier: independent website concepts in development, rather than client commissions.",
        planned: "Planned",
        languageLabel: "Choose language",
        projects: [
            {
                title: "Barbershop",
                category: "Website for a barbershop",
            },
            {
                title: "Cleaning service",
                category: "Website for a cleaning service",
            },
            {
                title: "Auto service",
                category: "Website for an auto repair shop",
            },
            {
                title: "Nail atelier",
                category: "Website for a nail studio",
            },
        ],
        servicesTitle: "Websites with a clear purpose.",
        servicesDescription:
            "Present your services clearly with a website that works well on desktop and mobile.",
        services: [
            {
                title: "Business website",
                description:
                    "Introduce your business and services so visitors can understand your offer and get in touch.",
            },
            {
                title: "Landing page",
                description:
                    "A focused page for a specific service, advertising campaign or new business idea.",
            },
            {
                title: "Website redesign",
                description:
                    "Refresh your existing website with a clearer structure, a modern design and a mobile-friendly layout.",
            },
        ],
    },
} satisfies Record<Language, Translation>;

export const languagePath = (lang: Language) => import.meta.env.BASE_URL.replace(/\/$/, "") + (lang === "de" ? "/" : `/${lang}/`);
