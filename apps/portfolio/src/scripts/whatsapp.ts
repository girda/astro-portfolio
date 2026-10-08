export function buildWhatsAppUrl(phone: string, name: string, topic: string, message: string, english: boolean): string {
  const text = `${english ? 'Hi Artem, I’m' : 'Hallo Artem, ich bin'} ${name.trim()}.\n\n${english ? 'Topic' : 'Thema'}: ${topic.trim()}\n\n${message.trim()}`;
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
