import { useState, useRef, useEffect } from "react";
import { maskKey } from "../lib/useApiKeys";

export default function Header({ keys, selectedId, addKey, removeKey, selectKey }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const hasActive = Boolean(selectedId);

  function handleAdd() {
    if (!newKey.trim()) return;
    addKey(label.trim(), newKey.trim());
    setLabel("");
    setNewKey("");
  }

  return (
    <header className="header">
      <span className="brand">Groq Web</span>
      <div className="key-manager" ref={ref}>
        <button className="key-btn" onClick={() => setOpen((o) => !o)}>
          <span className={`dot ${hasActive ? "" : "off"}`} />
          {hasActive
            ? keys.find((k) => k.id === selectedId)?.label
            : "کلید API"}
          <span style={{ opacity: 0.6 }}>▾</span>
        </button>

        {open && (
          <div className="key-dropdown glass">
            {keys.length === 0 && (
              <div className="hint" style={{ margin: "6px 0" }}>
                هنوز کلیدی ثبت نشده است
              </div>
            )}
            {keys.map((k) => (
              <div
                key={k.id}
                className={`key-row ${k.id === selectedId ? "active" : ""}`}
              >
                <div className="key-row-main" onClick={() => selectKey(k.id)}>
                  <span className="key-row-label">{k.label}</span>
                  <span className="key-row-masked">{maskKey(k.key)}</span>
                </div>
                <button
                  className="icon-btn"
                  title="حذف کلید"
                  onClick={() => removeKey(k.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="add-key-form" style={{ flexDirection: "column" }}>
              <input
                className="input"
                placeholder="نام دلخواه (اختیاری)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <div className="row" style={{ marginTop: 6 }}>
                <input
                  className="input"
                  placeholder="کلید API Groq را وارد کنید"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  style={{ direction: "ltr", textAlign: "left" }}
                  type="password"
                />
                <button className="primary-btn" onClick={handleAdd}>
                  افزودن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
