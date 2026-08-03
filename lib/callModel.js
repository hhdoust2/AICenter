// Calls our serverless proxy. onProgress(percent) is used to drive a
// progress bar in the UI while the request is in flight (Groq responses
// don't stream progress, so we simulate a smooth climb up to ~90%).
export async function callModel({ apiKey, groqModel, systemPrompt, userText, onProgress }) {
  let pct = 8;
  onProgress?.(pct);
  const timer = setInterval(() => {
    pct = Math.min(pct + Math.random() * 12, 90);
    onProgress?.(pct);
  }, 350);

  try {
    const res = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        model: groqModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
    });
    const data = await res.json();
    clearInterval(timer);
    onProgress?.(100);
    if (!res.ok) throw new Error(data.error || "خطای ناشناخته");
    return data.text;
  } catch (err) {
    clearInterval(timer);
    onProgress?.(0);
    throw err;
  }
}
