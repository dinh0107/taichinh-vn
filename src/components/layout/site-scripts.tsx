"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function isBarePath(pathname: string | null) {
  return Boolean(
    pathname?.startsWith("/admin") || pathname === "/dang-nhap"
  );
}

/** Re-create <script> nodes so browsers actually execute them. */
function injectHtml(html: string, parent: HTMLElement, marker: string) {
  const wrap = document.createElement("div");
  wrap.setAttribute("data-tcvn-scripts", marker);
  wrap.style.display = "contents";

  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();

  for (const node of Array.from(tpl.content.childNodes)) {
    if (node.nodeName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const script = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      if (old.textContent) script.text = old.textContent;
      wrap.appendChild(script);
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
      wrap.appendChild(node.cloneNode(true));
    }
  }

  parent.appendChild(wrap);
  return () => {
    wrap.remove();
  };
}

function extractNoscriptHtml(html: string): string {
  if (!html.trim()) return "";
  const matches = html.match(/<noscript[\s\S]*?<\/noscript>/gi);
  return matches?.join("\n") ?? "";
}

/**
 * Injects admin-configured Google / tracking snippets on public pages only.
 * Scripts are executed client-side (React does not run <script> via innerHTML).
 */
export function SiteScripts({
  headHtml = "",
  bodyHtml = "",
}: {
  headHtml?: string;
  bodyHtml?: string;
}) {
  const pathname = usePathname();
  const skip = isBarePath(pathname);
  const cleanups = useRef<(() => void)[]>([]);

  useEffect(() => {
    cleanups.current.forEach((fn) => fn());
    cleanups.current = [];

    if (skip) return;

    if (headHtml.trim()) {
      cleanups.current.push(injectHtml(headHtml, document.head, "head"));
    }
    if (bodyHtml.trim()) {
      cleanups.current.push(injectHtml(bodyHtml, document.body, "body"));
    }

    return () => {
      cleanups.current.forEach((fn) => fn());
      cleanups.current = [];
    };
  }, [headHtml, bodyHtml, skip]);

  if (skip) return null;

  // SSR-friendly GTM <noscript> iframe (scripts still injected in useEffect).
  const noscript = extractNoscriptHtml(bodyHtml);
  if (!noscript) return null;

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: noscript }}
    />
  );
}
