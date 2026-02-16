"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type QuillSelection = {
  index: number;
  length: number;
};

type QuillInstance = {
  root: HTMLElement;
  clipboard: {
    dangerouslyPasteHTML: (index: number, html: string, source?: string) => void;
  };
  getSelection?: (focus?: boolean) => QuillSelection | null;
  setSelection?: (index: number, length?: number, source?: string) => void;
  on: (eventName: "text-change", handler: () => void) => void;
  off?: (eventName: "text-change", handler: () => void) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "blockquote",
  "list",
  "bullet",
  "link",
];

function normalizeQuillHtml(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  return normalized === "<p><br></p>" ? "" : normalized;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function plainTextToQuillHtml(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .split("\n")
    .map((line) => {
      const text = escapeHtml(line.trim());
      return `<p>${text || "<br />"}</p>`;
    })
    .join("");
}

export function quillHtmlToPlainText(value: string): string {
  if (!value) {
    return "";
  }

  if (typeof window !== "undefined") {
    const container = window.document.createElement("div");
    container.innerHTML = value;
    return (container.innerText || container.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const changeHandlerRef = useRef<(() => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const placeholderRef = useRef(placeholder);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;

    async function initEditor() {
      if (!hostRef.current || quillRef.current) {
        return;
      }

      const { default: Quill } = await import("quill");
      if (!active || !hostRef.current || quillRef.current) {
        return;
      }

      const editor = new Quill(hostRef.current, {
        theme: "snow",
        modules: QUILL_MODULES,
        formats: QUILL_FORMATS,
        placeholder: placeholderRef.current,
      }) as unknown as QuillInstance;

      quillRef.current = editor;
      editor.clipboard.dangerouslyPasteHTML(0, initialValueRef.current || "<p><br></p>", "silent");

      const handleTextChange = () => {
        const html = normalizeQuillHtml(editor.root.innerHTML);
        onChangeRef.current(html);
      };

      changeHandlerRef.current = handleTextChange;
      editor.on("text-change", handleTextChange);
      setReady(true);
    }

    initEditor();

    return () => {
      active = false;
      const editor = quillRef.current;
      const handler = changeHandlerRef.current;

      if (editor && handler && typeof editor.off === "function") {
        editor.off("text-change", handler);
      }

      quillRef.current = null;
      changeHandlerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = quillRef.current;
    if (!editor) {
      return;
    }

    const incoming = normalizeQuillHtml(value);
    const current = normalizeQuillHtml(editor.root.innerHTML);
    if (incoming === current) {
      return;
    }

    const selection = editor.getSelection?.(true);
    editor.clipboard.dangerouslyPasteHTML(0, incoming || "<p><br></p>", "silent");

    if (selection) {
      editor.setSelection?.(selection.index, selection.length, "silent");
    }
  }, [value]);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-primary-light/25 bg-white text-dark-900 shadow-sm [&_.ql-container.ql-snow]:min-h-[220px] [&_.ql-container.ql-snow]:rounded-b-xl [&_.ql-container.ql-snow]:border-0 [&_.ql-editor]:min-h-[220px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-7 [&_.ql-toolbar.ql-snow]:rounded-t-xl [&_.ql-toolbar.ql-snow]:border-0 [&_.ql-toolbar.ql-snow]:border-b [&_.ql-toolbar.ql-snow]:border-primary-light/20",
        className
      )}
    >
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 text-sm text-dark-900/55 backdrop-blur-[1px]">
          Editor yuklanmoqda...
        </div>
      ) : null}
      <div ref={hostRef} />
    </div>
  );
}
