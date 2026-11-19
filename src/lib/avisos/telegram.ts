/**
 * Aviso a Xavi y Marc por Telegram (gratuito). Necesita TELEGRAM_BOT_TOKEN y
 * TELEGRAM_CHAT_ID (un grupo con los dos). Si faltan, no hace nada.
 * Un fallo del aviso nunca impide la reserva.
 */
export const escaparHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function avisarTelegram(html: string, f: typeof fetch = fetch): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const r = await f(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    return r.ok;
  } catch {
    return false;
  }
}
