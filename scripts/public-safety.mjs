// Только проверяемые технические ограничения; это не юридическая сертификация.
export function htmlSafetyIssues(html) {
  const issues = [];
  const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
  for (const tag of html.match(/<form\b[^>]*>/gi) ?? []) {
    if (attr(tag, 'method')?.toLowerCase() !== 'dialog') issues.push('network_form_submission');
  }
  for (const tag of html.match(/<(?:button|input)\b[^>]*>/gi) ?? []) {
    const method = attr(tag, 'formmethod');
    if (method && method.toLowerCase() !== 'dialog') issues.push('network_form_override');
  }
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(html)) issues.push('external_google_fonts');
  if (html.includes('hirda:last-visit')) issues.push('unrequested_visit_storage');
  return [...new Set(issues)];
}
