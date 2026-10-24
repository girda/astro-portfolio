// Один контракт ограничений для формы и локального сервера.
export const leadLimits = Object.freeze({ name: 100, contact: 160, requirements: 1500, budget: 100 });
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class LeadError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export function validateLead(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new LeadError(400, 'invalid_fields');
  const fields = {};
  for (const [key, limit] of Object.entries(leadLimits)) {
    const item = value[key] ?? (key === 'budget' ? '' : null);
    if (typeof item !== 'string' || item.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(item)) throw new LeadError(400, 'invalid_fields');
    fields[key] = item.trim();
  }
  if (!fields.name || fields.requirements.length < 10) throw new LeadError(400, 'invalid_fields');
  const contact = fields.contact;
  const email = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(contact);
  const phone = /^\+[\d\s().-]+$/.test(contact) && /^\d{7,15}$/.test(contact.replace(/\D/g, ''));
  if (!email && !phone) throw new LeadError(400, 'invalid_contact');
  return fields;
}
export function validateEnvelope(body) {
  if (!body || typeof body.sessionId !== 'string' || !uuidPattern.test(body.sessionId) || body.scope !== 'consult') throw new LeadError(400, 'invalid_request');
  return { sessionId: body.sessionId, fields: validateLead(body.fields) };
}
