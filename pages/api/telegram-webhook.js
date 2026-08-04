import { getUsersCollection } from "../../lib/mongodb";
import {
  sendMessage,
  editMessageText,
  sendChatAction,
  answerCallbackQuery,
  sendTextDocument,
  downloadFileText,
  inlineKeyboard,
} from "../../lib/telegram";
import { MODELS, getModel } from "../../lib/models";
import { runGroq, runGroqChat } from "../../lib/groq";

const LANGS = [
  { code: "fa", label: "فارسی" },
  { code: "en", label: "انگلیسی" },
  { code: "ar", label: "عربی" },
  { code: "fr", label: "فرانسه" },
  { code: "tr", label: "ترکی" },
];

const MAX_HISTORY = 12; // تعداد پیام‌های اخیر که برای حافظه چت نگه داشته می‌شود

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

async function getOrCreateUser(users, telegramId) {
  let user = await users.findOne({ telegramId });
  if (!user) {
    user = {
      telegramId,
      apiKey: null,
      model: "base",
      state: null,
      pendingLang: null,
      history: [],
      createdAt: new Date(),
    };
    await users.insertOne(user);
  }
  return user;
}

function modelKeyboard(prefix = "setmodel") {
  return inlineKeyboard(
    MODELS.map((m) => [{ text: m.title, callback_data: `${prefix}:${m.id}` }])
  );
}

function langKeyboard() {
  return inlineKeyboard([
    LANGS.map((l) => ({ text: l.label, callback_data: `setlang:${l.code}` })),
  ]);
}

async function handleCommand(users, user, chatId, text) {
  const [cmd, ...rest] = text.trim().split(/\s+/);
  const arg = rest.join(" ");

  if (cmd === "/start") {
    await sendMessage(
      chatId,
      "سلام 👋\n" +
        "به ربات هوش مصنوعی Groq خوش آمدید.\n\n" +
        "برای استفاده، ابتدا کلید API خودتان را از https://console.groq.com بگیرید و با دستور زیر ثبت کنید:\n" +
        "<code>/setkey YOUR_API_KEY</code>\n\n" +
        "دستورات:\n" +
        "/setkey [کلید] - ثبت کلید API\n" +
        "/mykey - نمایش کلید فعلی (پوشیده)\n" +
        "/deletekey - حذف کلید\n" +
        "/model - انتخاب ابزار فعال (Base, Translator, Summarizer, Chat, Classifier)\n" +
        "/translate - ترجمه متن یا فایل\n" +
        "/reset - پاک‌کردن حافظه گفتگوی چت\n\n" +
        "بعد از ثبت کلید و انتخاب مدل، کافیست پیام متنی یا فایل بفرستید."
    );
    return;
  }

  if (cmd === "/setkey") {
    if (arg) {
      await users.updateOne({ telegramId: user.telegramId }, { $set: { apiKey: arg, state: null } });
      await sendMessage(chatId, "✅ کلید API با موفقیت ثبت شد: " + maskKey(arg));
    } else {
      await users.updateOne({ telegramId: user.telegramId }, { $set: { state: "awaiting_key" } });
      await sendMessage(chatId, "کلید API خود را در پیام بعدی ارسال کنید:");
    }
    return;
  }

  if (cmd === "/mykey") {
    if (user.apiKey) {
      await sendMessage(chatId, "کلید فعلی شما: " + maskKey(user.apiKey));
    } else {
      await sendMessage(chatId, "هنوز کلیدی ثبت نکرده‌اید. از /setkey استفاده کنید.");
    }
    return;
  }

  if (cmd === "/deletekey") {
    await users.updateOne({ telegramId: user.telegramId }, { $set: { apiKey: null } });
    await sendMessage(chatId, "🗑 کلید API حذف شد.");
    return;
  }

  if (cmd === "/model") {
    await sendMessage(chatId, "یک ابزار را انتخاب کنید:", modelKeyboard());
    return;
  }

  if (cmd === "/translate") {
    await sendMessage(chatId, "متن را می‌خواهید به چه زبانی ترجمه شود؟", langKeyboard());
    return;
  }

  if (cmd === "/reset") {
    await users.updateOne({ telegramId: user.telegramId }, { $set: { history: [] } });
    await sendMessage(chatId, "🧹 حافظه گفتگو پاک شد.");
    return;
  }

  await sendMessage(chatId, "دستور ناشناخته. برای راهنما /start را بفرستید.");
}

async function handleCallback(users, user, cq) {
  const chatId = cq.message.chat.id;
  const data = cq.data || "";

  if (data.startsWith("setmodel:")) {
    const modelId = data.split(":")[1];
    await users.updateOne({ telegramId: user.telegramId }, { $set: { model: modelId, state: null } });
    const m = getModel(modelId);
    await answerCallbackQuery(cq.id, "انتخاب شد: " + m.title);
    await editMessageText(chatId, cq.message.message_id, `✅ ابزار فعال: <b>${m.title}</b>\n${m.desc}`);
    return;
  }

  if (data.startsWith("setlang:")) {
    const lang = data.split(":")[1];
    await users.updateOne(
      { telegramId: user.telegramId },
      { $set: { state: "awaiting_translate_text", pendingLang: lang } }
    );
    await answerCallbackQuery(cq.id, "زبان انتخاب شد");
    await editMessageText(chatId, cq.message.message_id, "✍️ حالا متن یا فایل موردنظر برای ترجمه را ارسال کنید.");
    return;
  }

  await answerCallbackQuery(cq.id);
}

async function processWithProgress(chatId, task) {
  await sendChatAction(chatId, "typing");
  const placeholder = await sendMessage(chatId, "⏳ در حال پردازش...");
  const msgId = placeholder?.result?.message_id;
  try {
    const result = await task();
    if (msgId) {
      await editMessageText(chatId, msgId, result.length > 3800 ? result.slice(0, 3800) + "…" : result);
    } else {
      await sendMessage(chatId, result);
    }
    return result;
  } catch (err) {
    const errText = "❌ خطا: " + err.message;
    if (msgId) await editMessageText(chatId, msgId, errText);
    else await sendMessage(chatId, errText);
    throw err;
  }
}

async function handleUserContent(users, user, chatId, userText) {
  if (!user.apiKey) {
    await sendMessage(chatId, "ابتدا با دستور /setkey کلید API خود را ثبت کنید.");
    return;
  }
  if (!userText || !userText.trim()) return;

  // حالت در جریان: ترجمه
  if (user.state === "awaiting_translate_text") {
    const langLabel = LANGS.find((l) => l.code === user.pendingLang)?.label || "فارسی";
    const model = getModel("translator");
    const prompt = `Translate the following text to ${langLabel}. Only output the translation:\n\n${userText}`;
    try {
      const result = await processWithProgress(chatId, () =>
        runGroq({ apiKey: user.apiKey, model: model.groqModel, systemPrompt: model.systemPrompt, userText: prompt })
      );
      await sendTextDocument(chatId, "translation.txt", result, "⬇ فایل ترجمه");
    } catch {}
    await users.updateOne({ telegramId: user.telegramId }, { $set: { state: null, pendingLang: null } });
    return;
  }

  const activeModelId = user.model || "base";
  const model = getModel(activeModelId);

  // حالت چت: حافظه مکالمه نگه داشته می‌شود
  if (activeModelId === "chat") {
    const history = [...(user.history || []), { role: "user", content: userText }];
    try {
      const result = await processWithProgress(chatId, () =>
        runGroqChat({ apiKey: user.apiKey, model: model.groqModel, systemPrompt: model.systemPrompt, history })
      );
      const newHistory = [...history, { role: "assistant", content: result }].slice(-MAX_HISTORY);
      await users.updateOne({ telegramId: user.telegramId }, { $set: { history: newHistory } });
    } catch {}
    return;
  }

  // Base / Summarizer / Classifier: تک‌مرحله‌ای
  try {
    const result = await processWithProgress(chatId, () =>
      runGroq({ apiKey: user.apiKey, model: model.groqModel, systemPrompt: model.systemPrompt, userText })
    );
    if (activeModelId === "summarizer" || activeModelId === "text-classifier") {
      await sendTextDocument(chatId, `${activeModelId}-result.txt`, result, "⬇ فایل نتیجه");
    }
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Groq Telegram bot webhook is alive.");

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers["x-telegram-bot-api-secret-token"] !== secret) {
    return res.status(401).send("unauthorized");
  }

  const update = req.body;
  res.status(200).send("ok"); // فوراً به تلگرام جواب می‌دهیم تا retry نکند

  try {
    const users = await getUsersCollection();

    if (update.callback_query) {
      const cq = update.callback_query;
      const telegramId = cq.from.id;
      const user = await getOrCreateUser(users, telegramId);
      await handleCallback(users, user, cq);
      return;
    }

    const msg = update.message;
    if (!msg) return;
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const user = await getOrCreateUser(users, telegramId);

    // دریافت فایل متنی (سند)
    if (msg.document) {
      const fileText = await downloadFileText(msg.document.file_id);
      const caption = msg.caption || "";
      await handleUserContent(users, user, chatId, [caption, fileText].filter(Boolean).join("\n\n---\n\n"));
      return;
    }

    const text = msg.text || "";
    if (!text) return;

    if (user.state === "awaiting_key") {
      await users.updateOne({ telegramId }, { $set: { apiKey: text.trim(), state: null } });
      await sendMessage(chatId, "✅ کلید API با موفقیت ثبت شد: " + maskKey(text.trim()));
      return;
    }

    if (text.startsWith("/")) {
      await handleCommand(users, user, chatId, text);
      return;
    }

    await handleUserContent(users, user, chatId, text);
  } catch (err) {
    console.error("Webhook error:", err);
  }
}
