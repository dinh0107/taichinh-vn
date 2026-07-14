"use client";

import { useMemo, useRef, useState, memo } from "react";
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

type Props = {
  /** Initial HTML only — do not pass a changing controlled value while typing. */
  initialValue?: string;
  /** Called when content changes (parent should NOT setState that re-renders this editor). */
  onChange?: (html: string) => void;
  /** Optional hidden input name — keeps FormData in sync without parent re-renders. */
  name?: string;
};

/**
 * Self-contained editor. Parent must not feed `value` back on every keystroke
 * or React re-renders will steal focus / block clicks inside CKEditor.
 */
function RichTextEditorInner({
  initialValue = "",
  onChange,
  name = "content",
}: Props) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlDraft, setHtmlDraft] = useState(initialValue);
  const [editorKey, setEditorKey] = useState(0);
  const [seed, setSeed] = useState(initialValue);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef(initialValue);

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

  const sync = (html: string) => {
    draftRef.current = html;
    if (hiddenRef.current) hiddenRef.current.value = html;
    onChange?.(html);
  };

  const switchToHtml = () => {
    setHtmlDraft(draftRef.current);
    setMode("html");
  };

  const switchToVisual = () => {
    if (mode === "visual") return;
    const html = draftRef.current;
    setSeed(html);
    setHtmlDraft(html);
    setEditorKey((k) => k + 1);
    setMode("visual");
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={initialValue} />

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
          Click vào khung trắng bên dưới để gõ nội dung.
        </span>
      </div>

      {mode === "html" ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            const html = e.target.value;
            setHtmlDraft(html);
            sync(html);
          }}
          spellCheck={false}
          className="min-h-[360px] w-full resize-y rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          placeholder="<p>Dán hoặc sửa HTML tại đây…</p>"
        />
      ) : (
        <div className="ck-tcvn relative z-10 isolate rounded-lg border border-slate-200 bg-white">
          <CKEditor
            key={editorKey}
            editor={ClassicEditor}
            config={config}
            data={seed}
            onChange={(_e, editor) => {
              sync(editor.getData());
            }}
            onReady={(editor) => {
              const root = editor.editing.view.getDomRoot();
              if (root instanceof HTMLElement) {
                root.setAttribute("contenteditable", "true");
                root.style.pointerEvents = "auto";
                root.style.userSelect = "text";
                root.style.cursor = "text";
                root.style.minHeight = "360px";
              }
            }}
            onError={(err, { willEditorRestart }) => {
              console.error("[RichTextEditor]", err, { willEditorRestart });
            }}
          />
        </div>
      )}
    </div>
  );
}

export const RichTextEditor = memo(RichTextEditorInner);
