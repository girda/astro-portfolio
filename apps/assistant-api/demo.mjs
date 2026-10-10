// Демонстрационный каталог: цены в центах, без оплаты и реальных заказов.
export const catalog = [
  { id: 'coffee', name: 'Cappuccino', cents: 390 },
  { id: 'croissant', name: 'Croissant', cents: 280 },
  { id: 'cake', name: 'Cheesecake', cents: 490 },
];
export function cart(value = []) {
  if (!Array.isArray(value) || value.length > catalog.length) throw new Error('invalid_cart');
  const seen = new Set();
  return value.map(row => {
    if (!row || !catalog.some(p => p.id === row.id) || seen.has(row.id) || !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 20) throw new Error('invalid_cart');
    seen.add(row.id);
    return { id: row.id, quantity: row.quantity };
  });
}
export const format = { type: 'json_schema', name: 'demo_order', strict: true, schema: {
  type: 'object', additionalProperties: false, required: ['text', 'cart'], properties: {
    text: { type: 'string' }, cart: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['id', 'quantity'], properties: {
        id: { type: 'string', enum: catalog.map(p => p.id) }, quantity: { type: 'integer' }
      }
    } }
  }
} };
export function demoInstructions(rows) {
  return `DEMO MODE: You are a cafe order assistant in an explicitly fictional interactive demo. The visitor is the customer. Offer this sample cafe to demonstrate ordering regardless of their industry; explain briefly that a real integration can use their own catalog. Catalog (EUR cents): ${JSON.stringify(catalog)}. Current cart is authoritative: ${JSON.stringify(rows)}. Return the COMPLETE desired cart, retaining unchanged items. Only change quantities on explicit customer requests, maximum 20 each. Remove items by omitting them. Never add items on greetings or ambiguous requests; ask one clarification. Never invent products or prices. You CAN update this demo cart, but cannot place real orders or take payment. Clearly say this is a demo at the start. Reply in the visitor's language, concise. Do not claim real fulfillment or redirect to website packages during ordering. Do not output totals in prose; the UI calculates them. If asked about a real agent, explain custom integrations are scoped separately. Empty cart stays empty unless ordered.`;
}
