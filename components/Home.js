import { useRef, useState } from "react";
import { MODELS } from "../lib/models";
import { callModel } from "../lib/callModel";

export default function Home({ activeKey }) {
  const [modelId, setModelId] = useState("base");
  const [query, setQuery] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const model = MODELS.find((m) => m.id === modelId);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileText(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function handleSubmit() {
    setError("");
    if (!activeKey) {
      setError("ابتدا یک کلید API از گوشه بالا اضافه یا انتخاب کنید.");
      return;
    }
    const userText = [query, fileText].filter(Boolean).join("\n\n---\n\n");
    if (!userText.trim()) return;

    setLoading(true);
    setResult("");
    try {
      const text = await callModel({
        apiKey: activeKey.key,
        groqModel: model.groqModel,
        systemPrompt: model.systemPrompt,
        userText,
        onProgress: setProgress,
      });
      setResult(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-wrap">
      <div className="logo">Groq</div>
      <p className="hero-tagline">پنج ابزار هوشمند — سریع، ساده و روان ✨</p>

      <div className="search-box glass">
        <input
          placeholder="سوال خود را بپرسید یا فایلی الحاق کنید..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="file-btn"
          onClick={() => fileRef.current?.click()}
          title="الحاق فایل متنی"
        >
          📎 {fileName || "فایل"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv,.json"
          hidden
          onChange={handleFile}
        />
        <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : "جستجو"}
        </button>
      </div>

      <div className="model-row">
        {MODELS.map((m) => (
          <button
            key={m.id}
            className={`model-chip ${modelId === m.id ? "active" : ""}`}
            onClick={() => setModelId(m.id)}
            title={m.desc}
          >
            {m.title}
          </button>
        ))}
      </div>
      <div className="hint">مدل انتخاب‌شده پیش‌فرض روی «Base» است — {model.groqModel}</div>

      {loading && (
        <div style={{ width: "100%", maxWidth: 720, marginTop: 22 }}>
          <div className="progress-outer">
            <div className="progress-inner" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="error-text" style={{ marginTop: 16 }}>{error}</div>}

      {result && <div className="result-card glass">{result}</div>}
    </div>
  );
}
