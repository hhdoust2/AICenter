import { useEffect, useRef, useState } from "react";
import { getModel } from "../lib/models";

const model = getModel("chat");

export default function ChatBox({ activeKey }) {
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', content}
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  function autoGrow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    if (!activeKey) {
      setError("ابتدا یک کلید API از گوشه بالا اضافه یا انتخاب کنید.");
      return;
    }
    setError("");

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput(""); // پاک شدن خودکار باکس بلافاصله بعد از ارسال
    requestAnimationFrame(autoGrow);
    setSending(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: activeKey.key,
          model: model.groqModel,
          messages: [
            { role: "system", content: model.systemPrompt },
            ...nextMessages,
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطای ناشناخته");
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">گفتگو را با یک پیام شروع کنید 💬</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="msg-row assistant">
            <div className="msg-bubble msg-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-text" style={{ padding: "0 8px 8px" }}>{error}</div>}

      <div className="chat-input-bar glass">
        <textarea
          ref={taRef}
          rows={1}
          placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter برای خط جدید)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoGrow();
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          title="ارسال"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
