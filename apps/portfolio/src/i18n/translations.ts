import type { ProjectId } from "../data/projects";
export const languages = ["de", "en"] as const;

export type Language = "de" | "ru" | "en";

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
    id: ProjectId;
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
    projectsEyebrow: "MEINE ARBEIT",
    projectsTitle: "Jedes Business hat seinen Stil.",
    projectsDescription:
      "Ich übersetze ihn in Websites. Hier findest du unterschiedliche Designs und Lösungen zum Entdecken.",
    planned: "Geplant",
    languageLabel: "Sprache wählen",
    projects: [
      {
        id: "barbershop",
        title: "Barbershop",
        category: "Website für einen Barbershop",
      },
      {
        id: "cleaning",
        title: "Reinigungsservice",
        category: "Website für einen Reinigungsservice",
      },
      {
        id: "autoservice",
        title: "Auto-Service",
        category: "Website für eine Autowerkstatt",
      },
      {
        id: "nails",
        title: "Nail Atelier",
        category: "Website für ein Nagelstudio",
      },
    ],
    servicesTitle: "Was kann ich für dich tun?",
    servicesDescription: "Ob neue Website oder frischer Auftritt: Ich unterstütze dich mit Design und Entwicklung, die zu deinem Unternehmen passen.",
    services: [
      { title: "Websites & Landingpages", description: "Dein Angebot klar präsentiert — mit individuellem Design und einer Struktur, die Besucher schnell ans Ziel bringt." },
      { title: "Website-Redesign", description: "Ein neuer Look und eine bessere Nutzerführung für deine bestehende Website — auf dem Smartphone genauso wie am Desktop." },
      { title: "Weiterentwicklung & Pflege", description: "Neue Inhalte, zusätzliche Funktionen und technische Updates — damit deine Website mit deinem Unternehmen mitwächst." },
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
        id: "barbershop",
        title: "Барбершоп",
        category: "Сайт для барбершопа",
      },
      {
        id: "cleaning",
        title: "Клининг",
        category: "Сайт для клининговой компании",
      },
      {
        id: "autoservice",
        title: "Автосервис",
        category: "Сайт автомобильной мастерской",
      },
      {
        id: "nails",
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
    projectsEyebrow: "MY WORK",
    projectsTitle: "Every business has its own style.",
    projectsDescription:
      "I translate it into websites. Explore different designs and solutions here.",
    planned: "Planned",
    languageLabel: "Choose language",
    projects: [
      {
        id: "barbershop",
        title: "Barbershop",
        category: "Website for a barbershop",
      },
      {
        id: "cleaning",
        title: "Cleaning service",
        category: "Website for a cleaning service",
      },
      {
        id: "autoservice",
        title: "Auto service",
        category: "Website for an auto repair shop",
      },
      {
        id: "nails",
        title: "Nail atelier",
        category: "Website for a nail studio",
      },
    ],
    servicesTitle: "What can I do for you?",
    servicesDescription: "Whether you need a new website or a fresh look, I help with design and development tailored to your business.",
    services: [
      { title: "Websites & landing pages", description: "Present your offer clearly — with a distinctive design and a structure that helps visitors find what they need." },
      { title: "Website redesign", description: "A fresh look and easier navigation for your existing website — on mobile and desktop alike." },
      { title: "Development & maintenance", description: "New content, additional features and technical updates — so your website can grow with your business." },
    ],
  },
} satisfies Record<Language, Translation>;

export const languagePath = (lang: Language) =>
  import.meta.env.BASE_URL.replace(/\/$/, "") +
  (lang === "de" ? "/" : `/${lang}/`);
