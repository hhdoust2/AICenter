const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function runGroq({ apiKey, model, systemPrompt, userText }) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "خطا در ارتباط با Groq API");
  }
  return data?.choices?.[0]?.message?.content || "";
}

export async function runGroqChat({ apiKey, model, systemPrompt, history }) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "خطا در ارتباط با Groq API");
  }
  return data?.choices?.[0]?.message?.content || "";
}
