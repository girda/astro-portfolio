import { leadLimits } from '../data/lead-contract.mjs';

type Fields = { name: string; contact: string; requirements: string; budget: string };
type Options = { endpoint: string; sessionId: string; lang: 'de' | 'en' | 'ru'; draft: string };
const copy = {
  de: { title: 'Deine Anfrage', name: 'Dein Name', contact: 'E-Mail oder WhatsApp (+Ländervorwahl)', requirements: 'Dein Projekt', budget: 'Budget (optional)', review: 'Angaben prüfen', edit: 'Bearbeiten', save: 'Anfrage speichern', pending: 'Wird gespeichert …', saved: 'Anfrage gespeichert', note: 'Erst mit „Anfrage speichern“ wird diese Anfrage für Artem gespeichert. Es wird keine Nachricht versendet.', reviewNote: 'Bitte prüfe deine Angaben. Mit dem nächsten Klick bestätigst du die Speicherung.', error: 'Speichern nicht bestätigt. Bitte erneut versuchen.', invalid: 'Bitte prüfe Name, Kontakt und Projektbeschreibung (mindestens 10 Zeichen).', expired: 'Bestätigung abgelaufen. Bitte Angaben erneut prüfen.' },
  en: { title: 'Your enquiry', name: 'Your name', contact: 'Email or WhatsApp (+country code)', requirements: 'Your project', budget: 'Budget (optional)', review: 'Review details', edit: 'Edit', save: 'Save enquiry', pending: 'Saving …', saved: 'Enquiry saved', note: 'Only “Save enquiry” saves these details for Artem. No message is sent.', reviewNote: 'Please check your details. The next click confirms saving.', error: 'Saving could not be confirmed. Please try again.', invalid: 'Please check your name, contact and project description (at least 10 characters).', expired: 'Confirmation expired. Please review your details again.' },
  ru: { title: 'Твоя заявка', name: 'Имя', contact: 'Email или WhatsApp (+код страны)', requirements: 'Твой проект', budget: 'Бюджет (необязательно)', review: 'Проверить данные', edit: 'Изменить', save: 'Сохранить заявку', pending: 'Сохраняю …', saved: 'Заявка сохранена', note: 'Только кнопка «Сохранить заявку» сохранит данные для Артёма. Сообщение в мессенджер не отправляется.', reviewNote: 'Проверь данные. Следующее нажатие подтвердит сохранение.', error: 'Сохранение не подтверждено. Попробуй ещё раз.', invalid: 'Проверь имя, контакт и описание проекта (минимум 10 символов).', expired: 'Подтверждение истекло. Проверь данные ещё раз.' },
};

export function enquiryText(messages: { role: string; content: string }[]): string {
  // В карточку не попадают ответы модели: даже строгий prompt не исключает выдуманных условий.
  const text = messages.filter(message => message.role === 'user').map(message => message.content).join('\n\n');
  return text.length <= leadLimits.requirements ? text : '';
}

export function createLeadCard(options: Options): HTMLElement {
  const t = copy[options.lang];
  const card = document.createElement('form');
  card.className = 'cat-brief cat-lead'; card.dataset.leadCard = '';
  const title = document.createElement('strong'); title.textContent = t.title;
  const note = document.createElement('p'); note.textContent = t.note;
  card.append(title, note);
  const fields = {} as Record<keyof Fields, HTMLInputElement | HTMLTextAreaElement>;
  for (const key of ['name', 'contact', 'requirements', 'budget'] as const) {
    const label = document.createElement('label'); label.textContent = t[key];
    const input = key === 'requirements' ? document.createElement('textarea') : document.createElement('input');
    input.name = key; input.maxLength = leadLimits[key]; input.required = key !== 'budget';
    if (input instanceof HTMLTextAreaElement) { input.rows = 4; input.minLength = 10; input.value = options.draft.slice(0, leadLimits.requirements); }
    else { input.type = 'text'; input.autocomplete = key === 'name' ? 'name' : key === 'contact' ? 'email' : 'off'; }
    fields[key] = input; label.append(input); card.append(label);
  }
  const status = document.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const submit = document.createElement('button'); submit.type = 'submit'; submit.className = 'cat-action'; submit.textContent = t.review;
  const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'cat-retry'; edit.textContent = t.edit; edit.hidden = true;
  card.append(status, submit, edit);
  let draftId = '', token = '', requestId = crypto.randomUUID(), busy = false, saved = false;
  const readFields = (): Fields => Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value])) as Fields;
  const lockFields = (locked: boolean) => { for (const input of Object.values(fields)) input.readOnly = locked; };
  const clearConfirmation = () => { draftId = ''; token = ''; requestId = crypto.randomUUID(); lockFields(false); edit.hidden = true; submit.textContent = t.review; status.textContent = ''; };
  edit.addEventListener('click', () => { if (!busy && !saved) { clearConfirmation(); fields.requirements.focus(); } });
  card.addEventListener('input', () => { if (!busy && !saved && draftId) clearConfirmation(); });
  async function post(path: string, body: object) {
    const response = await fetch(`${options.endpoint}${path}`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'unavailable');
    return result;
  }
  card.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || saved || !card.reportValidity()) return;
    const confirming = Boolean(draftId);
    busy = true; submit.disabled = true; edit.disabled = true; lockFields(true); card.setAttribute('aria-busy', 'true');
    status.textContent = ''; submit.textContent = t.pending;
    try {
      const payload = { scope: 'consult', sessionId: options.sessionId, fields: readFields() };
      if (!confirming) {
        const result = await post('/draft', { ...payload, requestId });
        if (typeof result.draftId !== 'string' || typeof result.token !== 'string') throw new Error('invalid_response');
        draftId = result.draftId; token = result.token;
        status.textContent = t.reviewNote; edit.hidden = false;
      } else {
        const result = await post('/confirm', { ...payload, draftId, token, confirmed: true });
        if (!Number.isSafeInteger(result.id) || result.id < 1 || result.status !== 'saved') throw new Error('invalid_response');
        saved = true; card.dataset.leadSaved = String(result.id);
        status.textContent = `${t.saved} · #${result.id}`; edit.hidden = true;
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (['invalid_fields', 'invalid_contact'].includes(code)) status.textContent = t.invalid;
      else if (['draft_expired', 'draft_changed'].includes(code)) { clearConfirmation(); status.textContent = t.expired; }
      else status.textContent = t.error;
      // При неизвестном результате сохраняем draftId/token: повтор вернёт ту же запись.
    } finally {
      busy = false; submit.disabled = saved; edit.disabled = false;
      submit.textContent = saved ? t.saved : draftId ? t.save : t.review;
      lockFields(Boolean(draftId) || saved); card.removeAttribute('aria-busy');
      if (!saved) submit.focus({ preventScroll: true });
    }
  });
  return card;
}
