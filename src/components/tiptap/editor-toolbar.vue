<template>
  <div class="gf-tiptap-toolbar">
    <input
      ref="fileInputRef"
      type="file"
      accept="*/*"
      multiple
      style="display: none"
      @change="handleFileInputChange"
    />
    <template v-for="(group, gi) in groups" :key="gi">
      <template v-for="(btn, bi) in group" :key="bi">
        <el-tooltip
          v-if="btn !== '|'"
          :content="labels[btn] || btn"
          placement="top"
          :show-after="400"
        >
          <el-button
            size="small"
            :type="isActive(btn) ? 'primary' : 'default'"
            @click="exec(btn)"
            plain
          >
            {{ labels[btn] || btn }}
          </el-button>
        </el-tooltip>
      </template>
      <span v-if="gi < groups.length - 1" class="gf-tiptap-divider" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { toolbarPresets, type ToolbarMode } from "./editor-config";
import { smartUpload } from "/@/api/pms/upload";

const labels: Record<string, string> = {
  heading: "H",
  bold: "B",
  italic: "I",
  underline: "U",
  strike: "S",
  code: "<>",
  orderedList: "1.",
  bulletList: "•",
  taskList: "☑",
  image: "🖼",
  attachment: "📎",
  link: "🔗",
  table: "⊞",
  blockquote: "❝",
  codeBlock: "{ }",
  horizontalRule: "—",
  textAlign: "≡",
  highlight: "🖍",
  undo: "↩",
  redo: "↪",
};

export default defineComponent({
  name: "EditorToolbar",
  props: {
    editor: { type: Object, required: true },
    mode: { type: String as () => ToolbarMode, default: "full" },
    canUpload: { type: Boolean, default: true },
  },
  emits: ["uploadImage", "uploadAttachment"],
  setup(props, { emit }) {
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const groups = computed(() => toolbarPresets[props.mode] || toolbarPresets.full);

    function isActive(btn: string): boolean {
      const ed = props.editor;
      if (!ed) return false;
      const map: Record<string, string> = {
        bold: "bold",
        italic: "italic",
        underline: "underline",
        strike: "strike",
        code: "code",
        orderedList: "orderedList",
        bulletList: "bulletList",
        taskList: "taskList",
        blockquote: "blockquote",
        codeBlock: "codeBlock",
        link: "link",
        highlight: "highlight",
      };
      const key = map[btn];
      return key ? ed.isActive(key) : false;
    }

    function openFilePicker(uploadType: "image" | "attachment") {
      if (!fileInputRef.value) return;
      if (uploadType === "image") {
        fileInputRef.value.accept = "image/*";
      } else {
        fileInputRef.value.accept = "*/*";
      }
      // 存储上传类型，供 change 事件读取
      (fileInputRef.value as any)._uploadType = uploadType;
      fileInputRef.value.value = "";
      fileInputRef.value.click();
    }

    async function handleFileInputChange(event: Event) {
      const input = event.target as HTMLInputElement;
      const uploadType = (input as any)._uploadType || "image";
      if (!input.files || input.files.length === 0) return;

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        try {
          const result = await smartUpload(file);
          if (result.isImage) {
            emit("uploadImage", result);
          } else {
            emit("uploadAttachment", result);
          }
        } catch {
          // handleEditorFileUpload 已显示错误消息
        }
      }
    }

    function exec(btn: string) {
      const ed = props.editor;
      if (!ed) return;
      switch (btn) {
        case "bold":
          ed.chain().focus().toggleBold().run();
          break;
        case "italic":
          ed.chain().focus().toggleItalic().run();
          break;
        case "underline":
          ed.chain().focus().toggleUnderline().run();
          break;
        case "strike":
          ed.chain().focus().toggleStrike().run();
          break;
        case "code":
          ed.chain().focus().toggleCode().run();
          break;
        case "orderedList":
          ed.chain().focus().toggleOrderedList().run();
          break;
        case "bulletList":
          ed.chain().focus().toggleBulletList().run();
          break;
        case "taskList":
          ed.chain().focus().toggleTaskList().run();
          break;
        case "blockquote":
          ed.chain().focus().toggleBlockquote().run();
          break;
        case "codeBlock":
          ed.chain().focus().toggleCodeBlock().run();
          break;
        case "horizontalRule":
          ed.chain().focus().setHorizontalRule().run();
          break;
        case "image":
          openFilePicker("image");
          break;
        case "attachment":
          openFilePicker("attachment");
          break;
        case "link": {
          const url = window.prompt("输入链接地址:");
          if (url) ed.chain().focus().setLink({ href: url }).run();
          break;
        }
        case "table":
          ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          break;
        case "undo":
          ed.chain().focus().undo().run();
          break;
        case "redo":
          ed.chain().focus().redo().run();
          break;
        case "highlight":
          ed.chain().focus().toggleHighlight().run();
          break;
        default:
          break;
      }
    }

    return { groups, isActive, exec, labels, fileInputRef, handleFileInputChange };
  },
});
</script>

<style scoped>
.gf-tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--cc-color-border-light);
  background: var(--cc-color-bg);
  border-radius: var(--cc-radius-md) var(--cc-radius-md) 0 0;
}
.gf-tiptap-divider {
  width: 1px;
  height: 20px;
  background: var(--cc-color-border);
  margin: 0 4px;
}
</style>
