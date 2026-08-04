const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

async function call(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error("Telegram API error:", method, data);
  }
  return data;
}

export function sendMessage(chatId, text, extra = {}) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export function editMessageText(chatId, messageId, text, extra = {}) {
  return call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export function sendChatAction(chatId, action = "typing") {
  return call("sendChatAction", { chat_id: chatId, action });
}

export function answerCallbackQuery(id, text) {
  return call("answerCallbackQuery", { callback_query_id: id, text });
}

// ارسال فایل متنی به‌عنوان خروجی قابل دانلود (معادل دکمه دانلود در وب)
export async function sendTextDocument(chatId, filename, content, caption) {
  const form = new FormData();
  form.append("chat_id", chatId);
  if (caption) form.append("caption", caption);
  const blob = new Blob([content], { type: "text/plain" });
  form.append("document", blob, filename);

  const res = await fetch(`${API}/sendDocument`, { method: "POST", body: form });
  return res.json();
}

export async function getFileUrl(fileId) {
  const data = await call("getFile", { file_id: fileId });
  if (!data.ok) return null;
  return `${FILE_API}/${data.result.file_path}`;
}

export async function downloadFileText(fileId) {
  const url = await getFileUrl(fileId);
  if (!url) return "";
  const res = await fetch(url);
  return res.text();
}

export function inlineKeyboard(rows) {
  // rows: [[{text, callback_data}], ...]
  return { reply_markup: { inline_keyboard: rows } };
}
