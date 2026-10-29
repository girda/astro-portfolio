type Language = 'de' | 'en' | 'ru';
const draftActions = [
  { aliases: ['entwurf passt', 'draft fits', 'draft looks good', 'черновик подходит', 'всё верно', 'все верно'], labels: {de:'Entwurf passt',en:'Draft looks good',ru:'Всё верно'} },
  { aliases: ['ändern', 'change', 'edit', 'изменить'], labels: {de:'Ändern',en:'Change',ru:'Изменить'} },
];
// Для стандартных действий не полагаемся на язык кнопки, выбранный моделью.
export function localizeDemoChoice(choice: string, lang: Language): string {
  const clean = choice.trim();
  return draftActions.find(action => action.aliases.includes(clean.toLocaleLowerCase()))?.labels[lang] ?? clean;
}
