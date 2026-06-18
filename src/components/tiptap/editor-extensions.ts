import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Node, mergeAttributes } from "@tiptap/core";
import { Markdown } from "tiptap-markdown";

const lowlight = createLowlight(common);

/** 文件附件自定义节点 — 在编辑器中显示为可点击的下载链接 */
export const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      href: { default: null },
      filename: { default: "附件" },
      size: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file-attachment]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const sizeText = HTMLAttributes.size
      ? HTMLAttributes.size >= 1024 * 1024
        ? ` (${(HTMLAttributes.size / 1024 / 1024).toFixed(1)}MB)`
        : ` (${Math.round(HTMLAttributes.size / 1024)}KB)`
      : "";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-file-attachment": "",
        class: "file-attachment-block",
      }),
      [
        "a",
        {
          href: HTMLAttributes.href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "file-attachment-link",
        },
        `📎 ${HTMLAttributes.filename}${sizeText}`,
      ],
    ];
  },
});

/** Tiptap 编辑器扩展集合 */
export function getExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Underline,
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Link.configure({
      openOnClick: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight,
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder }),
    CodeBlockLowlight.configure({ lowlight }),
    FileAttachment,
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: "-",
    }),
  ];
}
