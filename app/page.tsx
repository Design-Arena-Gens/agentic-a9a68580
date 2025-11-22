"use client";
import { useCallback, useRef, useState } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    if (isLoading) return;
    setText("");
    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/long", { signal: controller.signal });
      if (!res.ok || !res.body) {
        throw new Error("??? ?????");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value));
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setText((prev) => prev + "\n\n??? ??? ??? ?????.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <div className="brand">????? ????? ? Long Answer</div>
        <div className="badge">
          <span>?? ????? ????</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#8cffd1"><circle cx="12" cy="12" r="6"/></svg>
        </div>
      </div>

      <div className="card">
        <div className="controls">
          <button className="button" onClick={start} disabled={isLoading}>
            {isLoading ? "...???? ???????" : "???? ????? ?????"}
          </button>
          <button className="button secondary" onClick={stop} disabled={!isLoading}>
            ?????
          </button>
        </div>
        <div className="output">{text || "???? ??? \"???? ????? ?????\" ???? ????."}</div>
      </div>

      <div className="footer">
        ?? ?????? ?? Next.js ???? Vercel. ??? ?????? ????? ????? ?? ???????? ??????? ???????? ??? ?????? ??? ?? ?????? API.
      </div>
    </div>
  );
}
