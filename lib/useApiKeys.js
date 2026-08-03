import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "groq_webapp_keys_v1";
const SELECTED_KEY = "groq_webapp_selected_v1";

function loadKeys() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useApiKeys() {
  const [keys, setKeys] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const k = loadKeys();
    const sel = localStorage.getItem(SELECTED_KEY);
    setKeys(k);
    setSelectedId(sel || (k[0] && k[0].id) || null);
    setLoaded(true);
  }, []);

  const persist = useCallback((newKeys) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
    setKeys(newKeys);
  }, []);

  const addKey = useCallback(
    (label, key) => {
      const id = Date.now().toString(36);
      const newKeys = [...keys, { id, label: label || "کلید بدون نام", key }];
      persist(newKeys);
      setSelectedId(id);
      localStorage.setItem(SELECTED_KEY, id);
    },
    [keys, persist]
  );

  const removeKey = useCallback(
    (id) => {
      const newKeys = keys.filter((k) => k.id !== id);
      persist(newKeys);
      if (selectedId === id) {
        const next = newKeys[0]?.id || null;
        setSelectedId(next);
        if (next) localStorage.setItem(SELECTED_KEY, next);
        else localStorage.removeItem(SELECTED_KEY);
      }
    },
    [keys, persist, selectedId]
  );

  const selectKey = useCallback((id) => {
    setSelectedId(id);
    localStorage.setItem(SELECTED_KEY, id);
  }, []);

  const activeKey = keys.find((k) => k.id === selectedId) || null;

  return { keys, selectedId, activeKey, addKey, removeKey, selectKey, loaded };
}

export function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}
