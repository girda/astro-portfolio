export type ProjectStatus = "demo" | "client";
export const projects = {
  barbershop: { name: "KANT", port: 4322, status: "demo" },
  cleaning: { name: "KLAR", port: 4323, status: "demo" },
  autoservice: { name: "WERKRAUM", port: 4324, status: "demo" },
  nails: { name: "STILL", port: 4325, status: "demo" },
} satisfies Record<
  string,
  { name: string; port: number; status: ProjectStatus }
>;
export type ProjectId = keyof typeof projects;

// BASE_URL сохраняет подпапку при публикации на GitHub Pages.
export function projectHref(id: ProjectId): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return import.meta.env.PROD
    ? `${base}/demos/${id}/`
    : `http://localhost:${projects[id].port}/`;
}
