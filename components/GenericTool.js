import { useRef, useState } from "react";
import { getModel } from "../lib/models";
import { callModel } from "../lib/callModel";

export default function GenericTool({ modelId, placeholder, buttonLabel, activeKey }) {
  const model = getModel(modelId);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function handleRun() {
    setError("");
    if (!activeKey) {
      setError("ابتدا یک کلید API از گوشه بالا اضافه یا انتخاب کنید.");
      return;
    }
    if (!text.trim()) return;

    setLoading(true);
    setResult("");
    try {
      const out = await callModel({
        apiKey: activeKey.key,
        groqModel: model.groqModel,
        systemPrompt: model.systemPrompt,
        userText: text,
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
    a.download = `${modelId}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-wrap">
      <div>
        <div className="tool-title">{model.title}</div>
        <div className="tool-desc">{model.desc}</div>
      </div>

      <div className="panel glass">
        <div className="row">
          <button className="file-btn" onClick={() => fileRef.current?.click()}>
            📎 {fileName || "بارگذاری فایل"}
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" hidden onChange={handleFile} />
        </div>

        <textarea
          className="input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="row">
          <button className="primary-btn" onClick={handleRun} disabled={loading}>
            {loading ? "در حال پردازش..." : buttonLabel}
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
