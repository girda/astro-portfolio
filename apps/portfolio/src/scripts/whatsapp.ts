export function buildWhatsAppUrl(phone: string, name: string, topic: string, message: string, locale: boolean | "de" | "en" | "ru"): string {
  const english = locale === true || locale === 'en';
  const ru = locale === 'ru';
  const text = `${english ? 'Hi Artem, I’m' : ru ? 'Привет, Артём! Меня зовут' : 'Hallo Artem, ich bin'} ${name.trim()}.\n\n${english ? 'Topic' : ru ? 'Тема' : 'Thema'}: ${topic.trim()}\n\n${message.trim()}`;
  return buildWhatsAppMessageUrl(phone, text);
}

// Общий путь для формы и редактируемого черновика Pixel: сохраняем текст без изменений.
export function buildWhatsAppMessageUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
