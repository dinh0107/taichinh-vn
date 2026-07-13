"use client";

import { useMemo, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageInsertViaUrl,
  MediaEmbed,
  Indent,
  Autoformat,
  PasteFromOffice,
  HorizontalLine,
  RemoveFormat,
  GeneralHtmlSupport,
  type EditorConfig,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Uncontrolled after mount: do not feed `data` back on every keystroke
 * (that resets the caret / breaks typing). Remount only when switching
 * HTML → visual so edited source is loaded into CKEditor.
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [editorInstance, setEditorInstance] = useState({
    key: 0,
    data: value,
  });
  const lastEmitted = useRef(value);

  const config = useMemo<EditorConfig>(
    () => ({
      licenseKey: "GPL",
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Link,
        List,
        BlockQuote,
        Table,
        TableToolbar,
        Image,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageResize,
        ImageInsertViaUrl,
        MediaEmbed,
        Indent,
        Autoformat,
        PasteFromOffice,
        HorizontalLine,
        RemoveFormat,
        GeneralHtmlSupport,
      ],
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "removeFormat",
          "|",
          "link",
          "blockQuote",
          "insertTable",
          "insertImageViaUrl",
          "mediaEmbed",
          "horizontalLine",
          "|",
          "bulletedList",
          "numberedList",
          "outdent",
          "indent",
        ],
        shouldNotGroupWhenFull: true,
      },
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true,
          },
        ],
      },
      image: {
        toolbar: [
          "imageTextAlternative",
          "toggleImageCaption",
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
          "|",
          "resizeImage",
        ],
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
    }),
    []
  );

  const emit = (html: string) => {
    lastEmitted.current = html;
    setHtmlDraft(html);
    onChange(html);
  };

  const switchToHtml = () => {
    setMode("html");
  };

  const switchToVisual = () => {
    const html = htmlDraft;
    emit(html);
    setEditorInstance((prev) => ({ key: prev.key + 1, data: html }));
    setMode("visual");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={switchToVisual}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition",
            mode === "visual"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          Soạn thảo
        </button>
        <button
          type="button"
          onClick={switchToHtml}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition",
            mode === "html"
              ? "border-amber-600 bg-amber-500 text-white"
              : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
          )}
        >
          <Code2 className="h-3.5 w-3.5" />
          HTML / Source
        </button>
        <span className="text-[11px] text-slate-400">
          Bấm «HTML / Source» để xem và sửa mã HTML.
        </span>
      </div>

      {mode === "html" ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => emit(e.target.value)}
          spellCheck={false}
          className="min-h-[360px] w-full resize-y rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          placeholder="<p>Dán hoặc sửa HTML tại đây…</p>"
        />
      ) : (
        <div className="ck-tcvn">
          <CKEditor
            key={editorInstance.key}
            editor={ClassicEditor}
            config={config}
            data={editorInstance.data}
            onChange={(_e, editor) => emit(editor.getData())}
          />
        </div>
      )}
    </div>
  );
}
