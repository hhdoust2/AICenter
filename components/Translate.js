import { useRef, useState } from "react";
import { getModel } from "../lib/models";
import { callModel } from "../lib/callModel";

const LANGS = [
  { code: "fa", label: "فارسی" },
  { code: "en", label: "انگلیسی" },
  { code: "ar", label: "عربی" },
  { code: "fr", label: "فرانسه" },
  { code: "de", label: "آلمانی" },
  { code: "es", label: "اسپانیایی" },
  { code: "tr", label: "ترکی" },
];

export default function Translate({ activeKey }) {
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("fa");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const model = getModel("translator");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function handleTranslate() {
    setError("");
    if (!activeKey) {
      setError("ابتدا یک کلید API از گوشه بالا اضافه یا انتخاب کنید.");
      return;
    }
    if (!text.trim()) return;

    setLoading(true);
    setResult("");
    const srcLabel = LANGS.find((l) => l.code === source)?.label;
    const tgtLabel = LANGS.find((l) => l.code === target)?.label;
    const prompt = `Translate the following text from ${srcLabel} to ${tgtLabel}. Only output the translation:\n\n${text}`;

    try {
      const out = await callModel({
        apiKey: activeKey.key,
        groqModel: model.groqModel,
        systemPrompt: model.systemPrompt,
        userText: prompt,
        onProgress: setProgress,
      });
      setResult(out);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadResult() {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-wrap">
      <div>
        <div className="tool-title">ترجمه متن</div>
        <div className="tool-desc">فایل متنی را بارگذاری کنید یا متن را جای‌گذاری کنید</div>
      </div>

      <div className="panel glass">
        <div className="row">
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>از {l.label}</option>
            ))}
          </select>
          <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>به {l.label}</option>
            ))}
          </select>
          <button className="file-btn" onClick={() => fileRef.current?.click()}>
            📎 {fileName || "بارگذاری فایل"}
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" hidden onChange={handleFile} />
        </div>

        <textarea
          className="input"
          placeholder="متن را اینجا جای‌گذاری کنید..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="row">
          <button className="primary-btn" onClick={handleTranslate} disabled={loading}>
            {loading ? "در حال ترجمه..." : "ترجمه کن"}
          </button>
          {result && (
            <button className="download-btn" onClick={downloadResult}>
              ⬇ دانلود نتیجه
            </button>
          )}
        </div>

        {loading && (
          <div className="progress-outer">
            <div className="progress-inner" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
      </div>

      {result && <div className="result-card glass">{result}</div>}
    </div>
  );
}
