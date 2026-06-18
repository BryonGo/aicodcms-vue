<template>
  <div class="gf-tiptap" :class="{ 'is-focused': isFocused, 'is-dragover': isDragOver }">
    <editor-toolbar
      v-if="toolbar"
      :editor="editor"
      :mode="toolbar"
      @upload-image="handleInsertImage"
      @upload-attachment="handleInsertAttachment"
    />
    <div v-if="isUploading" class="gf-tiptap-uploading">
      <el-progress :percentage="uploadProgress" :stroke-width="4" striped />
      <span>{{ uploadingText }}</span>
    </div>
    <editor-content :editor="editor" class="gf-tiptap-content" />
    <div v-if="showCount" class="gf-tiptap-counter">
      {{ editor?.storage.characterCount?.characters?.() || 0 }} 字符
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onBeforeUnmount } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { ElMessage } from "element-plus";
import { getExtensions } from "./editor-extensions";
import { toolbarPresets, type ToolbarMode } from "./editor-config";
import EditorToolbar from "./editor-toolbar.vue";
import { smartUpload } from "/@/api/pms/upload";
import { useI18n } from "vue-i18n"; // ← 加回 import

export default defineComponent({
  name: "GfTiptap",
  components: { EditorContent, EditorToolbar },
  props: {
    modelValue: { type: String, default: "" },
    toolbar: { type: String as () => ToolbarMode, default: "full" },
    placeholder: { type: String, default: "" },
    showCount: { type: Boolean, default: false },
    editorId: { type: String, default: "gf-tiptap-editor" },
    /** 启用 Markdown 模式：v-model 读写 Markdown 字符串而非 HTML */
    markdown: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "setEditContent"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const resolvedPlaceholder = computed(
      () => props.placeholder || t("message.component.editorPlaceholder"),
    );
    const isFocused = ref(false);
    const isDragOver = ref(false);
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const uploadingText = ref("");

    /** 拖拽-粘贴上传的文件队列 */
    let uploadQueue: number = 0;

    function updateProgress() {
      // 模拟进度（后端不支持实时进度，用动画效果）
      if (uploadQueue > 0) {
        isUploading.value = true;
        if (uploadProgress.value < 80) {
          uploadProgress.value += Math.random() * 15;
        }
        setTimeout(updateProgress, 300);
      } else {
        uploadProgress.value = 100;
        setTimeout(() => {
          isUploading.value = false;
          uploadProgress.value = 0;
        }, 500);
      }
    }

    async function processFileDrop(file: File) {
      uploadQueue++;
      uploadingText.value = `${t("message.component.uploading")}: ${file.name}`;
      updateProgress();
      try {
        const result = await smartUpload(file);
        if (result.isImage) {
          editor.value?.chain().focus().setImage({ src: result.url }).run();
        } else {
          insertAttachment(result);
        }
      } catch {
        // 错误已在 handleEditorFileUpload 中提示
      } finally {
        uploadQueue--;
        if (uploadQueue <= 0) {
          uploadQueue = 0;
        }
      }
    }

    /** 处理文件拖拽 */
    function handleDrop(view: any, event: DragEvent, slice: any, moved: boolean) {
      if (moved || !event.dataTransfer?.files?.length) return false;

      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return false;

      // 阻止编辑器默认行为
      event.preventDefault();

      for (const file of files) {
        processFileDrop(file);
      }
      return true;
    }

    /** 处理粘贴文件 */
    function handlePaste(view: any, event: ClipboardEvent, slice: any) {
      if (!event.clipboardData?.files?.length) return false;

      const files = Array.from(event.clipboardData.files);
      if (files.length === 0) return false;

      event.preventDefault();
      for (const file of files) {
        processFileDrop(file);
      }
      return true;
    }

    function getContent(ed: any): string {
      if (props.markdown) {
        return (ed.storage.markdown?.getMarkdown?.() ?? ed.getHTML()) as string;
      }
      return ed.getHTML();
    }

    const editor = useEditor({
      content: props.modelValue,
      extensions: getExtensions(resolvedPlaceholder.value),
      onUpdate: ({ editor: ed }) => {
        const val = getContent(ed);
        emit("update:modelValue", val);
        emit("setEditContent", val);
      },
      onFocus: () => {
        isFocused.value = true;
      },
      onBlur: () => {
        isFocused.value = false;
      },
      editorProps: {
        attributes: { id: props.editorId },
        handleDrop,
        handlePaste,
      },
    });

    // 外部 modelValue 变化时同步到编辑器
    watch(
      () => props.modelValue,
      (val) => {
        if (!editor.value) return;
        const current = getContent(editor.value);
        if (val === current) return;
        editor.value.commands.setContent(val || "", false);
      },
    );

    onBeforeUnmount(() => {
      editor.value?.destroy();
    });

    /** 通过工具栏选择的图片文件上传并插入 */
    async function handleInsertImage(fileResult: { url: string; name: string }) {
      if (!editor.value) return;
      editor.value.chain().focus().setImage({ src: fileResult.url }).run();
    }

    /** 插入附件到编辑器 */
    function insertAttachment(result: { url: string; name: string; size?: number }) {
      if (!editor.value) return;
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "fileAttachment",
          attrs: {
            href: result.url,
            filename: result.name,
            size: result.size || 0,
          },
        })
        .run();
    }

    /** 通过工具栏选择的附件上传并插入 */
    function handleInsertAttachment(result: { url: string; name: string; size?: number }) {
      insertAttachment(result);
    }

    return {
      editor,
      isFocused,
      isDragOver,
      isUploading,
      uploadProgress,
      uploadingText,
      handleInsertImage,
      handleInsertAttachment,
    };
  },
});
</script>

<style scoped>
.gf-tiptap {
  border: 1px solid var(--cc-color-border);
  border-radius: var(--cc-radius-md);
  transition: border-color 0.18s ease;
  background: var(--cc-color-surface);
}
.gf-tiptap.is-focused {
  border-color: var(--cc-color-primary);
  box-shadow: 0 0 0 3px var(--cc-color-focus-ring);
}
.gf-tiptap.is-dragover {
  border-color: var(--cc-color-success);
  border-style: dashed;
  background: var(--cc-color-success-soft);
}
.gf-tiptap-uploading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--cc-color-success-soft);
  font-size: var(--cc-font-12);
  color: var(--cc-color-success);
}
.gf-tiptap-uploading .el-progress {
  flex: 1;
  max-width: 200px;
}
.gf-tiptap-content {
  padding: 8px 12px;
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  color: var(--cc-color-text-1);
}
.gf-tiptap-content :deep(.ProseMirror) {
  outline: none;
  min-height: 280px;
}
.gf-tiptap-content :deep(.ProseMirror) p {
  margin: 0.5em 0;
}
.gf-tiptap-content :deep(.ProseMirror) img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}
.gf-tiptap-content :deep(.ProseMirror) table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.gf-tiptap-content :deep(.ProseMirror) th,
.gf-tiptap-content :deep(.ProseMirror) td {
  border: 1px solid var(--cc-color-border-light);
  padding: 8px 12px;
  text-align: left;
}
.gf-tiptap-content :deep(.ProseMirror) th {
  background: var(--cc-color-bg);
  font-weight: 600;
}
.gf-tiptap-content :deep(.ProseMirror) ul,
.gf-tiptap-content :deep(.ProseMirror) ol {
  padding-left: 1.5em;
}
.gf-tiptap-content :deep(.ProseMirror) blockquote {
  border-left: 3px solid var(--cc-color-primary);
  padding-left: 1em;
  color: var(--cc-color-text-2);
  margin: 1em 0;
}
.gf-tiptap-content :deep(.ProseMirror) pre {
  background: var(--cc-gray-800);
  color: var(--cc-gray-100);
  padding: 12px;
  border-radius: var(--cc-radius-sm);
  overflow-x: auto;
  font-size: var(--cc-font-13);
  font-family: var(--cc-font-mono);
}
.gf-tiptap-content :deep(.ProseMirror) code {
  font-family: var(--cc-font-mono);
}
.gf-tiptap-content :deep(.ProseMirror) p:first-child {
  margin-top: 0;
}
.gf-tiptap-content :deep(.ProseMirror) p:last-child {
  margin-bottom: 0;
}
.gf-tiptap-content :deep(.ProseMirror) p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--cc-color-text-4);
  pointer-events: none;
  float: left;
  height: 0;
}
.gf-tiptap-content :deep(.ProseMirror) .file-attachment-block {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 0.5em 0;
  background: var(--cc-color-bg);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-sm);
  cursor: pointer;
  transition: all 0.18s ease;
}
.gf-tiptap-content :deep(.ProseMirror) .file-attachment-block:hover {
  background: var(--cc-color-primary-softer);
  border-color: var(--cc-color-primary);
}
.gf-tiptap-content :deep(.ProseMirror) .file-attachment-link {
  color: var(--cc-color-primary);
  text-decoration: none;
  font-size: var(--cc-font-14);
}
.gf-tiptap-content :deep(.ProseMirror) .file-attachment-link:hover {
  text-decoration: underline;
}
.gf-tiptap-counter {
  padding: 4px 12px;
  font-size: var(--cc-font-12);
  color: var(--cc-color-text-3);
  border-top: 1px solid var(--cc-color-border-light);
  text-align: right;
}
</style>
