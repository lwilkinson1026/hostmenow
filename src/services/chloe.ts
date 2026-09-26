// Chloe, the help assistant. The server route (api/chloe.ts) holds the xAI key.
export type ChloeMsg = { role: 'user' | 'assistant'; content: string };

const URL = process.env.EXPO_PUBLIC_CHLOE_URL ?? 'https://hostmenow.vercel.app/api/chloe';

export async function ask(messages: ChloeMsg[]): Promise<{ reply: string } | { error: 'not_configured' | 'failed' }> {
  try {
    const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
    const data = (await r.json().catch(() => ({}))) as { reply?: string; error?: string };
    if (data.reply) return { reply: data.reply };
    return { error: data.error === 'not_configured' ? 'not_configured' : 'failed' };
  } catch {
    return { error: 'failed' };
  }
}
