"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { setLangCookie } from "@/lib/lang-client";

function subscribeNavActions(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getNavActionsSnapshot() {
  return document.getElementById("nav-actions");
}

function getServerSnapshot() {
  return null;
}

export function LanguageSwitcher({ current }: { current: "en" | "id" }) {
  const host = useSyncExternalStore(subscribeNavActions, getNavActionsSnapshot, getServerSnapshot);
  const [pending, setPending] = useState(false);

  if (!host) return null;

  const options: { value: "en" | "id"; label: string }[] = [
    { value: "id", label: "ID" },
    { value: "en", label: "EN" },
  ];

  return createPortal(
    <div
      className="hidden items-center rounded-lg border border-line bg-surface p-0.5 md:flex"
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={pending}
          onClick={async () => {
            if (opt.value === current) return;
            setPending(true);
            setLangCookie(opt.value);
            window.location.reload();
          }}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            current === opt.value ? "bg-navy text-white" : "text-ink-soft hover:text-navy"
          }`}
          aria-pressed={current === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>,
    host,
  );
}
