/** 工具栏预设模式 */
export type ToolbarMode = "full" | "cms" | "mini";

export const toolbarPresets: Record<ToolbarMode, string[][]> = {
  /** 完整工具栏 — 文章编辑使用 */
  full: [
    ["heading", "bold", "italic", "underline", "strike", "code"],
    ["orderedList", "bulletList", "taskList"],
    ["image", "attachment", "link", "table"],
    ["blockquote", "codeBlock", "horizontalRule"],
    ["textAlign", "highlight"],
    ["undo", "redo"],
  ],

  /** 精简工具栏 — 栏目/模型字段使用 */
  cms: [
    ["bold", "italic", "underline", "strike"],
    ["orderedList", "bulletList"],
    ["image", "attachment", "link"],
    ["blockquote", "codeBlock"],
    ["undo", "redo"],
  ],

  /** 极简工具栏 */
  mini: [["bold", "italic", "underline"], ["link"], ["undo", "redo"]],
};
