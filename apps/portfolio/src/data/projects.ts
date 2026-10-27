export type ProjectStatus = "demo" | "client";
export const projects = {
  lindenhof: { name: "LINDENHOF", category: "Website für ein Autohaus", port: 4326, status: "demo", group: "automotive", accent: "#849f83" },
  hausbau: { name: "FALKENRIED", category: "Website für individuellen Hausbau", port: 4332, status: "demo", group: "handwerk", accent: "#719a95" },
  streetfood: { name: "STREET FOOD", category: "Digitales Menü & Warenkorb", port: 4334, status: "demo", group: "food", accent: "#ffdc2a" },
  khlibnyi: { name: "KHLIBNYI", category: "Website für Café & Bäckerei", port: 4333, status: "demo", group: "food", accent: "#d7c75e" },
  ecohomes: { name: "EICHENHAIN", category: "Website für Holzhausbau & Energie", port: 4328, status: "demo", group: "handwerk", accent: "#a3936b" },
  barbershop: { name: "KANT", category: "Website für einen Barbershop", port: 4322, status: "demo", group: "beauty", accent: "#a66d54" },
  cleaning: { name: "KLAR", category: "Website für einen Reinigungsservice", port: 4323, status: "demo", group: "handwerk", accent: "#8bcbc1" },
  autoservice: { name: "WERKRAUM", category: "Website für eine Autowerkstatt", port: 4324, status: "demo", group: "automotive", accent: "#a9d9ed" },
  nails: { name: "STILL", category: "Website für Beauty, Haare & Spa", port: 4325, status: "demo", group: "beauty", accent: "#9c6c80" },
  electrical: { name: "STROMWERK", category: "Website für einen Elektrofachbetrieb", port: 4329, status: "demo", group: "handwerk", accent: "#d4b949" },
  homeservice: { name: "HAUSWERK", category: "Website für Montage & Hausservice", port: 4330, status: "demo", group: "handwerk", accent: "#719ae7" },
  gardens: { name: "GRÜNWERK", category: "Website für Garten- und Landschaftsbau", port: 4331, status: "demo", group: "handwerk", accent: "#99b880" },
} satisfies Record<
  string,
  { name: string; category: string; port: number; status: ProjectStatus; group: "automotive" | "beauty" | "handwerk" | "food"; accent: string }
>;
export type ProjectId = keyof typeof projects;

// BASE_URL сохраняет подпапку при публикации на GitHub Pages.
export function projectHref(id: ProjectId): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return import.meta.env.PROD
    ? `${base}/demos/${id}/`
    : `http://localhost:${projects[id].port}/`;
}
