// Serverless proxy to Groq's OpenAI-compatible Chat Completions API.
// The user's API key is sent from the browser with each request and
// is never stored on the server - it only passes through this function.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "فقط متد POST مجاز است." });
  }

  const { apiKey, model, messages, max_tokens, temperature } = req.body || {};

  if (!apiKey) {
    return res.status(400).json({ error: "کلید API وارد نشده است." });
  }
  if (!model || !messages) {
    return res.status(400).json({ error: "پارامترهای درخواست ناقص است." });
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: max_tokens || 1024,
        temperature: typeof temperature === "number" ? temperature : 0.7,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        error: data?.error?.message || "خطا در ارتباط با Groq API",
      });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text, raw: data });
  } catch (err) {
    return res.status(500).json({ error: "خطای سرور: " + err.message });
  }
}
