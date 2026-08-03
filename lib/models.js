// نگاشت ۵ مورد استفاده به مدل‌های واقعی و فعلی Groq
// (نام‌هایی مثل groq/base یا groq/translator وجود واقعی در API ندارند؛
// این‌ها معادل واقعی و در دسترس روی Groq هستند - قابل تغییر در آینده)

export const MODELS = [
  {
    id: "base",
    title: "مدل عمومی (Base)",
    desc: "پاسخ به سوالات عمومی، تولید متن و کارهای همه‌منظوره",
    groqModel: "llama-3.3-70b-versatile",
    systemPrompt:
      "You are a helpful, accurate general-purpose assistant. Answer clearly and concisely.",
  },
  {
    id: "translator",
    title: "مترجم (Translator)",
    desc: "ترجمه متن بین زبان‌های مختلف",
    groqModel: "llama-3.3-70b-versatile",
    systemPrompt:
      "You are a professional translator. Translate the given text faithfully, preserving tone and meaning. Only output the translation, nothing else.",
  },
  {
    id: "summarizer",
    title: "خلاصه‌ساز (Summarizer)",
    desc: "خلاصه‌سازی متون طولانی",
    groqModel: "llama-3.1-8b-instant",
    systemPrompt:
      "You are a summarization assistant. Summarize the given text concisely while keeping the key points. Only output the summary.",
  },
  {
    id: "chat",
    title: "چت (Chat)",
    desc: "گفتگوی دوستانه و طبیعی",
    groqModel: "llama-3.1-8b-instant",
    systemPrompt:
      "You are a friendly, conversational chat assistant. Keep replies natural and engaging.",
  },
  {
    id: "text-classifier",
    title: "دسته‌بند متن (Text Classifier)",
    desc: "طبقه‌بندی متن بر اساس موضوع یا دسته",
    groqModel: "qwen/qwen3-32b",
    systemPrompt:
      "You are a text classification assistant. Given a text, determine its topic/category and briefly justify why. Reply in a short structured format.",
  },
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
