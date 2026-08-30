"use client";

import { useEffect } from "react";

export type ConsentDocument = "service" | "privacy" | null;

const documentDetails = {
  service: { title: "이용약관", src: "/terms/service" },
  privacy: { title: "개인정보 수집·이용 동의", src: "/terms/privacy" },
} as const;

export function ConsentDocumentModal({ document, onClose }: { document: ConsentDocument; onClose: () => void }) {
  useEffect(() => {
    if (!document) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document ? window.document.body.style.overflow : "";
    window.document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.document.body.style.overflow = previousOverflow;
    };
  }, [document, onClose]);

  if (!document) return null;
  const details = documentDetails[document];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="consent-document-title" className="flex h-[min(78vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#e4e9e6] px-5 py-4">
          <h2 id="consent-document-title" className="text-lg font-bold text-[#1e2d25]">{details.title}</h2>
          <button type="button" onClick={onClose} aria-label="약관 창 닫기" className="flex size-9 items-center justify-center rounded-full bg-[#f1f5f2] text-xl text-[#536159] transition hover:bg-[#e5ece7]">×</button>
        </header>
        <iframe title={details.title} src={details.src} className="min-h-0 flex-1 border-0 bg-[#f3f7f4]" />
        <footer className="border-t border-[#e4e9e6] p-4">
          <button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white hover:bg-[#00783a]">확인</button>
        </footer>
      </section>
    </div>
  );
}
