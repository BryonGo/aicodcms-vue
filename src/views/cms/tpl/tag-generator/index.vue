<template>
  <div class="tgg-page" @keydown.esc="searchQuery = ''">
    <el-breadcrumb separator="→" class="mb15">
      <el-breadcrumb-item :to="{ path: '/' }"
        ><el-icon><HomeFilled /></el-icon> {{ $t("message.router.home") }}</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCms") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.cms.tplList.breadcrumbCurrent") }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("message.router.cmsTplTagGenerator") }}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- HEADER -->
    <header class="tgg-hd">
      <div class="tgg-hd__left">
        <h1 class="tgg-hd__title">{{ $t("message.router.cmsTplTagGenerator") }}</h1>
        <span class="tgg-hd__count">
          <span class="tgg-hd__count-val">{{ totalFuncs }}</span>
          <span class="tgg-hd__count-lab">{{ $t("message.tpl.stats.funcs") }}</span>
        </span>
      </div>
      <div class="tgg-hd__right">
        <el-button
          :disabled="!previewCode"
          :type="copied ? 'success' : 'default'"
          size="small"
          plain
          @click="copyCode"
        >
          {{ copied ? "✓ " + $t("message.tpl.copied") : $t("message.tpl.action.copy") }}
        </el-button>
        <div class="tgg-engine">
          <button
            class="tgg-engine__btn"
            :class="{ 'is-active': engine === 'gview' }"
            @click="engine = 'gview'"
          >
            gview
          </button>
          <button
            class="tgg-engine__btn"
            :class="{ 'is-active': engine === 'templ' }"
            @click="engine = 'templ'"
          >
            templ
          </button>
        </div>
      </div>
    </header>

    <!-- BODY -->
    <div class="tgg-body">
      <!-- SIDEBAR -->
      <aside class="tgg-side">
        <div class="tgg-side__bar">
          <svg
            class="tgg-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref="searchRef"
            v-model="searchQuery"
            class="tgg-search-input"
            :placeholder="$t('message.tpl.searchPlaceholder')"
            @keydown.esc="searchQuery = ''"
          />
          <kbd v-if="!searchQuery" class="tgg-search-key">/</kbd>

          <!-- category filters -->
          <div class="tgg-cats">
            <button
              v-for="cat in categoryList"
              :key="cat"
              class="tgg-cat"
              :class="{ 'is-active': activeCategory === cat }"
              @click="filterCategory(cat)"
            >
              {{ cat === "all" ? $t("message.common.all") : categoryLabelMap[cat] || cat }}
            </button>
          </div>
        </div>

        <!-- function list -->
        <div class="tgg-fnlist" v-loading="loadingCatalog">
          <template v-for="cat in filteredCatalog" :key="cat.id">
            <div class="tgg-fngroup">
              <div class="tgg-fngroup__hd">{{ $t("message." + cat.label_key) }}</div>
              <button
                v-for="fn in cat.functions"
                :key="`${cat.id}:${fn.name}`"
                class="tgg-fnitem"
                :class="{ 'is-selected': selectedFunc?.name === fn.name }"
                @click="selectFunc(fn)"
              >
                <span class="tgg-fnitem__label">{{ $t("message." + fn.label_key) }}</span>
                <span class="tgg-fnitem__sig">{{ fn.signature }}</span>
              </button>
            </div>
          </template>
          <div v-if="filteredCatalog.length === 0 && !loadingCatalog" class="tgg-fnlist__empty">
            {{ searchQuery ? $t("message.tpl.noMatch") : $t("message.common.noData") }}
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <section class="tgg-main">
        <template v-if="selectedFunc">
          <!-- function info -->
          <div class="tgg-card tgg-card--func">
            <div class="tgg-card__hd">
              <code class="tgg-funcname">{{ selectedFunc.name }}</code>
              <el-tag v-if="selectedFunc.has_loop" size="small" type="warning" effect="plain"
                >loop</el-tag
              >
            </div>
            <p class="tgg-funcsig">{{ selectedFunc.signature }}</p>
            <p v-if="selectedFunc.desc_key" class="tgg-funcdesc">
              {{ $t("message." + selectedFunc.desc_key) }}
            </p>
          </div>

          <!-- parameters -->
          <div v-if="currentParams.length" class="tgg-card">
            <div class="tgg-card__hd">{{ $t("message.tpl.param.title") }}</div>
            <div class="tgg-params">
              <div v-for="p in currentParams" :key="p.name" class="tgg-param">
                <label class="tgg-param__label">
                  {{ $t("message." + p.label_key) }}
                  <span v-if="p.required" class="tgg-param__req">*</span>
                </label>
                <el-select
                  v-if="p.type === 'select' && dynamicOpts[p.options_key || '']"
                  :model-value="params[p.name]"
                  @update:model-value="
                    (v: string) => {
                      params[p.name] = v;
                    }
                  "
                  size="small"
                  :placeholder="$t('message.' + p.label_key)"
                  clearable
                >
                  <el-option
                    v-for="opt in dynamicOpts[p.options_key || '']"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-select
                  v-else-if="p.type === 'dynamic_select' && dynamicOpts[p.name]"
                  :model-value="params[p.name]"
                  @update:model-value="
                    (v: string) => {
                      params[p.name] = v;
                    }
                  "
                  size="small"
                  :placeholder="$t('message.' + p.label_key)"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="opt in dynamicOpts[p.name]"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-input
                  v-else
                  size="small"
                  :model-value="params[p.name] || ''"
                  @update:model-value="
                    (v: string) => {
                      params[p.name] = v;
                    }
                  "
                  :placeholder="p.default || $t('message.' + p.label_key)"
                  :disabled="p.name === 'channel_id' && dynamicChannel"
                />
              </div>
            </div>
          </div>

          <!-- loop config -->
          <div v-if="selectedFunc.has_loop" class="tgg-card">
            <div class="tgg-card__hd">
              <el-switch v-model="loopMode" size="small" />
              <span class="tgg-card__hd-text">{{ $t("message.tpl.action.enableLoop") }}</span>
            </div>
            <div v-if="loopMode" class="tgg-loop-opts">
              <div class="tgg-param">
                <label class="tgg-param__label">{{ $t("message.tpl.form.loopVar") }}</label>
                <el-input v-model="loopVar" size="small" placeholder="it" style="width: 100%" />
              </div>
              <div v-if="selectedFunc.item_methods?.length" class="tgg-param tgg-param--wide">
                <label class="tgg-param__label">{{ $t("message.tpl.form.itemFields") }}</label>
                <div class="tgg-chips">
                  <div v-for="m in selectedFunc.item_methods" :key="m.name" class="tgg-field-row">
                    <span
                      class="tgg-chip"
                      :class="{ 'is-active': hasField(m.name) }"
                      @click="toggleField(m)"
                      >{{ m.name }}</span
                    >
                    <template v-if="hasField(m.name) && m.params?.length">
                      <template v-for="p in m.params" :key="p.name">
                        <el-select
                          v-if="p.type === 'select' && dynamicOpts[p.options_key || '']"
                          :model-value="getFieldParams(m.name)[p.name] || p.default"
                          @update:model-value="
                            (v: string) => updateItemFieldParam(m.name, p.name, v)
                          "
                          size="small"
                          class="tgg-field-param"
                        >
                          <el-option
                            v-for="opt in dynamicOpts[p.options_key || '']"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                          />
                        </el-select>
                        <el-input
                          v-else
                          :model-value="getFieldParams(m.name)[p.name] || ''"
                          @update:model-value="
                            (v: string) => updateItemFieldParam(m.name, p.name, v)
                          "
                          size="small"
                          :placeholder="p.name"
                          class="tgg-field-param"
                        />
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- dynamic channel -->
          <div v-if="selectedFunc.name === 'Articles'" class="tgg-card">
            <div class="tgg-card__hd">
              <el-switch v-model="dynamicChannel" size="small" />
              <span class="tgg-card__hd-text">{{ $t("message.tpl.toggle.dynamicChannel") }}</span>
            </div>
            <p v-if="dynamicChannel" class="tgg-hint">
              {{ $t("message.tpl.hint.dynamicChannel") }}
            </p>
          </div>

          <!-- code output -->
          <div v-if="previewCode" class="tgg-code">
            <div class="tgg-code__bar">
              <span class="tgg-code__dot tgg-code__dot--r"></span>
              <span class="tgg-code__dot tgg-code__dot--y"></span>
              <span class="tgg-code__dot tgg-code__dot--g"></span>
              <span class="tgg-code__lang">{{ engine }}</span>
              <el-button size="small" link @click="copyCode">{{
                copied ? "✓" : $t("message.tpl.action.copy")
              }}</el-button>
            </div>
            <pre class="tgg-code__body"><code>{{ previewCode }}</code></pre>
          </div>
        </template>

        <!-- empty state -->
        <div v-else class="tgg-empty">
          <el-icon class="tgg-empty__icon"><Switch /></el-icon>
          <p class="tgg-empty__text">{{ $t("message.tpl.tips.selectFunction") }}</p>
          <p class="tgg-empty__hint">{{ $t("message.tpl.emptyHint") }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { Switch } from "@element-plus/icons-vue";
import { useTagGenerator } from "./composables/useTagGenerator";

const { t } = useI18n();

const {
  catalog,
  searchQuery,
  activeCategory,
  selectedFunc,
  params,
  loopMode,
  dynamicChannel,
  loopVar,
  itemFields,
  engine,
  previewCode,
  loadingCatalog,
  copied,
  dynamicOpts,
  categoryList,
  filteredCatalog,
  totalFuncs,
  currentParams,
  loadCatalog,
  selectFunc,
  filterCategory,
  copyCode,
  generatePreview,
  toggleField,
  hasField,
  getFieldParams,
  updateItemFieldParam,
} = useTagGenerator();

const searchRef = ref<any>(null);

const categoryLabelMap = computed(() => {
  const map: Record<string, string> = {};
  for (const cat of catalog.value) {
    map[cat.id] = t("message." + cat.label_key);
  }
  return map;
});

watch(
  [params, loopMode, dynamicChannel, loopVar, itemFields, engine],
  () => {
    if (selectedFunc.value) generatePreview();
  },
  { deep: true },
);

watch(selectedFunc, (next) => {
  if (!next) previewCode.value = "";
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
    e.preventDefault();
    searchRef.value?.focus();
  }
}

onMounted(() => {
  loadCatalog();
  window.addEventListener("keydown", onKeydown);
});
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
/* ═══ PAGE ═══ */
.tgg-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page, #f5f7fa);
  overflow: hidden;
}

/* ═══ HEADER ═══ */
.tgg-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.tgg-hd__left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.tgg-hd__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.tgg-hd__count {
  font-size: 13px;
  color: #909399;
}
.tgg-hd__count-val {
  font-weight: 600;
  color: #606266;
  margin-right: 2px;
}
.tgg-hd__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tgg-engine {
  display: flex;
  background: #f0f2f5;
  border-radius: 6px;
  padding: 2px;
}
.tgg-engine__btn {
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: "JetBrains Mono", monospace;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #909399;
  cursor: pointer;
  transition: all 0.15s;
}
.tgg-engine__btn.is-active {
  background: #fff;
  color: var(--el-color-primary, #409eff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ═══ BODY ═══ */
.tgg-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ═══ SIDEBAR ═══ */
.tgg-side {
  width: 280px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* search bar */
.tgg-side__bar {
  position: relative;
  margin: 12px 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tgg-search-icon {
  position: absolute;
  left: 10px;
  top: 8px;
  width: 14px;
  height: 14px;
  color: #c0c4cc;
  pointer-events: none;
  z-index: 1;
}
.tgg-search-input {
  width: 100%;
  padding: 7px 32px 7px 30px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  color: #303133;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.tgg-search-input::placeholder {
  color: #c0c4cc;
}
.tgg-search-input:focus {
  border-color: var(--el-color-primary, #409eff);
  background: #fff;
}
.tgg-search-key {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 1px 6px;
  font-size: 11px;
  font-family: inherit;
  color: #c0c4cc;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
}

/* category filters */
.tgg-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px 8px;
  border-bottom: 1px solid #ebeef5;
}
.tgg-cat {
  padding: 3px 10px;
  font-size: 11px;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  background: #fff;
  color: #909399;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.tgg-cat:hover {
  border-color: #c0c4cc;
  color: #606266;
}
.tgg-cat.is-active {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-color: var(--el-color-primary, #409eff);
  color: var(--el-color-primary, #409eff);
}

/* function list */
.tgg-fnlist {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 12px;
}
.tgg-fngroup {
  margin-bottom: 2px;
}
.tgg-fngroup__hd {
  padding: 10px 10px 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #c0c4cc;
}
.tgg-fnitem {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #303133;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  font-size: 12px;
  gap: 1px;
}
.tgg-fnitem:hover {
  background: #f5f7fa;
}
.tgg-fnitem.is-selected {
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
}
.tgg-fnitem__label {
  font-weight: 500;
}
.tgg-fnitem__sig {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tgg-fnlist__empty {
  padding: 32px 16px;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}
.tgg-fnlist::-webkit-scrollbar {
  width: 4px;
}
.tgg-fnlist::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

/* ═══ MAIN ═══ */
.tgg-main {
  flex: 1;
  min-width: 0;
  padding: 20px;
  overflow-y: auto;
}
.tgg-main::-webkit-scrollbar {
  width: 4px;
}
.tgg-main::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

/* cards */
.tgg-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 14px;
}
.tgg-card__hd {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.tgg-card__hd-text {
  font-weight: 500;
  font-size: 13px;
}

.tgg-funcname {
  font-family: "JetBrains Mono", monospace;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}
.tgg-funcsig {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  color: #909399;
  margin: 0 0 6px;
}
.tgg-funcdesc {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

/* params */
.tgg-params {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.tgg-param {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tgg-param--wide {
  grid-column: 1 / -1;
}
.tgg-param__label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}
.tgg-param__req {
  color: #f56c6c;
}

/* loop opts */
.tgg-loop-opts {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* chips */
.tgg-chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.tgg-field-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.tgg-field-param {
  width: 160px;
}
.tgg-chip {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.tgg-chip:hover {
  border-color: var(--el-color-primary, #409eff);
  color: var(--el-color-primary, #409eff);
}
.tgg-chip.is-active {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-color: var(--el-color-primary, #409eff);
  color: var(--el-color-primary, #409eff);
}

/* hint */
.tgg-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* ═══ CODE OUTPUT — CodeMirror One Dark ═══ */
.tgg-code {
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  background: #282c34;
}
.tgg-code__bar {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background: #21252b;
  border-bottom: 1px solid #333;
  gap: 8px;
}
.tgg-code__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tgg-code__dot--r {
  background: #e06c75;
}
.tgg-code__dot--y {
  background: #e5c07b;
}
.tgg-code__dot--g {
  background: #98c379;
}
.tgg-code__lang {
  flex: 1;
  font-size: 11px;
  font-family: "JetBrains Mono", monospace;
  color: #5c6370;
  text-transform: uppercase;
}
.tgg-code__body {
  margin: 0;
  padding: 16px 20px;
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #abb2bf;
  overflow-x: auto;
  white-space: pre;
  tab-size: 2;
  max-height: 460px;
  counter-reset: line;
}
.tgg-code__body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.tgg-code__body::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 3px;
}
.tgg-code__body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.tgg-code__body::-webkit-scrollbar-track {
  background: #21252b;
}

/* ═══ EMPTY ═══ */
.tgg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 10px;
}
.tgg-empty__icon {
  font-size: 48px;
  color: #dcdfe6;
}
.tgg-empty__text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
.tgg-empty__hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

/* el-plus inner height fix */
.tgg-main :deep(.el-input__wrapper),
.tgg-main :deep(.el-select__wrapper),
.tgg-main :deep(.el-select .el-input__wrapper),
.tgg-side :deep(.el-input__wrapper) {
  min-height: 35px;
}
</style>
