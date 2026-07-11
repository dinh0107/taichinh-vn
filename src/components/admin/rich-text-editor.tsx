"use client";

import { useMemo } from "react";
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
  SourceEditing,
  GeneralHtmlSupport,
  type EditorConfig,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
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
        SourceEditing,
        GeneralHtmlSupport,
      ],
      toolbar: {
        items: [
          "sourceEditing",
          "|",
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

  return (
    <div className="ck-tcvn">
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        onChange={(_e, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
