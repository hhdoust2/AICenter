import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import TabBar from "../components/TabBar";
import Home from "../components/Home";
import Translate from "../components/Translate";
import GenericTool from "../components/GenericTool";
import ChatBox from "../components/ChatBox";
import { useApiKeys } from "../lib/useApiKeys";

export default function IndexPage() {
  const [tab, setTab] = useState("home");
  const { keys, selectedId, activeKey, addKey, removeKey, selectKey, loaded } =
    useApiKeys();

  return (
    <div className="app-shell">
      <Head>
        <title>Groq Web</title>
      </Head>

      <Header
        keys={keys}
        selectedId={selectedId}
        addKey={addKey}
        removeKey={removeKey}
        selectKey={selectKey}
      />

      <TabBar active={tab} onChange={setTab} />

      <main className="main">
        {loaded && tab === "home" && <Home activeKey={activeKey} />}
        {loaded && tab === "translator" && <Translate activeKey={activeKey} />}
        {loaded && tab === "summarizer" && (
          <GenericTool
            modelId="summarizer"
            placeholder="متن طولانی خود را برای خلاصه‌سازی وارد کنید..."
            buttonLabel="خلاصه کن"
            activeKey={activeKey}
          />
        )}
        {loaded && tab === "chat" && <ChatBox activeKey={activeKey} />}
        {loaded && tab === "text-classifier" && (
          <GenericTool
            modelId="text-classifier"
            placeholder="متنی را برای دسته‌بندی وارد کنید..."
            buttonLabel="دسته‌بندی کن"
            activeKey={activeKey}
          />
        )}
      </main>

      <div className="footer-note">
        کلید API شما فقط در مرورگر شما ذخیره می‌شود و به هیچ سروری غیر از Groq ارسال نمی‌گردد.
      </div>
    </div>
  );
}
