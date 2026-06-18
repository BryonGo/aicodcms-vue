<template>
  <el-dialog
    v-model="store.previewDialogVisible"
    width="85%"
    top="3vh"
    :close-on-click-modal="true"
    destroy-on-close
    class="gallery-dialog"
    :class="{ 'is-image': isImage }"
    @opened="onOpened"
    @closed="onClosed"
  >
    <template #header>
      <div class="gallery-header">
        <span class="gallery-title">{{ fileName }}</span>
        <span v-if="showCounter" class="gallery-counter">
          {{ (store.previewFileIndex ?? 0) + 1 }} / {{ store.previewGallery?.length ?? 0 }}
        </span>
      </div>
    </template>

    <div class="gallery-body">
      <!-- PDF -->
      <iframe v-if="isPdf" :src="store.previewUrl" class="pdf-frame" />

      <!-- Image with gallery navigation -->
      <template v-else-if="isImage">
        <button v-if="showCounter" class="gallery-nav gallery-prev" @click="store.prevPreview()">
          <el-icon :size="22"><ArrowLeft /></el-icon>
        </button>

        <img
          :src="store.previewUrl"
          class="gallery-image"
          alt="preview"
          @click="showCounter ? store.nextPreview() : undefined"
        />

        <button v-if="showCounter" class="gallery-nav gallery-next" @click="store.nextPreview()">
          <el-icon :size="22"><ArrowRight /></el-icon>
        </button>

        <div v-if="showCounter" class="gallery-hint">
          {{ $t("message.pms.minio.galleryHint") }}
        </div>
      </template>

      <el-empty v-else :description="$t('message.pms.minio.unsupportedPreview')" />
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useMinioStore } from "../store";
import { displayName, isImageByExtension } from "../utils";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MinioPreviewDialog",
  setup() {
    const { t } = useI18n();
    const store = useMinioStore();

    const isImage = computed(() => {
      const mime = store.previewType ?? "";
      if (mime.startsWith("image/")) return true;
      // MIME 缺失或为 octet-stream 时，用扩展名兜底
      const file = store.previewGallery?.[store.previewFileIndex];
      return file ? isImageByExtension(file.key) : false;
    });
    const isPdf = computed(() => store.previewType === "application/pdf");
    const showCounter = computed(() => (store.previewGallery?.length ?? 0) > 1);
    const fileName = computed(() => {
      const file = store.previewGallery?.[store.previewFileIndex];
      return file ? displayName(file.key) : t("message.minio.filePreview");
    });

    function onKeydown(e: KeyboardEvent) {
      if (!store.previewDialogVisible) return;
      if (e.key === "ArrowLeft") {
        store.prevPreview();
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        store.nextPreview();
        e.preventDefault();
      }
    }

    function onOpened() {
      window.addEventListener("keydown", onKeydown);
    }

    function onClosed() {
      window.removeEventListener("keydown", onKeydown);
    }

    return {
      store,
      isImage,
      isPdf,
      showCounter,
      fileName,
      onOpened,
      onClosed,
      ArrowLeft,
      ArrowRight,
    };
  },
});
</script>

<style scoped>
.gallery-dialog {
  :deep(.el-dialog) {
    border-radius: var(--cc-radius-lg);
    overflow: hidden;
    background: #1a1a1a;
  }

  :deep(.el-dialog__header) {
    padding: 12px 20px;
    margin: 0;
    background: #1a1a1a;
    border-bottom: 1px solid var(--cc-color-border-light);
  }

  :deep(.el-dialog__title) {
    color: var(--cc-color-text-1);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: #0f0f0f;
  }

  :deep(.el-dialog__headerbtn) {
    .el-dialog__close {
      color: var(--cc-color-text-3);
      &:hover {
        color: var(--cc-color-text-1);
      }
    }
  }
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gallery-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--cc-color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.gallery-counter {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--cc-color-text-3);
  background: var(--cc-color-border-light);
  padding: 2px 10px;
  border-radius: var(--cc-radius-lg);
}

.gallery-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  user-select: none;
}

.pdf-frame {
  width: 100%;
  height: 75vh;
  border: none;
  border-radius: 4px;
}

.gallery-image {
  max-width: 100%;
  max-height: 78vh;
  display: block;
  object-fit: contain;
  cursor: zoom-in;
  transition: opacity 0.25s ease;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--cc-color-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  opacity: 0;
  transition:
    opacity 0.25s,
    transform 0.2s,
    background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    transform: translateY(-50%) scale(1.08);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
}

.gallery-prev {
  left: 16px;
}
.gallery-next {
  right: 16px;
}

.gallery-body:hover .gallery-nav {
  opacity: 1;
}

.gallery-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 12px;
  border-radius: 12px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
