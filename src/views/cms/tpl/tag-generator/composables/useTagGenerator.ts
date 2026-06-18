import { ref, computed, shallowRef } from "vue";
import { getTagCatalog, previewTag, getDynamicParams } from "/@/api/cms/tpl";
import type {
  TplFuncCategory,
  TplFuncInfo,
  TplFuncParam,
  DynamicOption,
  ItemFieldConfig,
} from "../types";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

export function useTagGenerator() {
  // ── state ──
  const catalog = ref<TplFuncCategory[]>([]);
  const searchQuery = ref("");
  const activeCategory = ref("all");
  const selectedFunc = shallowRef<TplFuncInfo | null>(null);
  const params = ref<Record<string, any>>({});
  const loopMode = ref(false);
  const dynamicChannel = ref(false);
  const loopVar = ref("it");
  const itemFields = ref<ItemFieldConfig[]>([]);
  const engine = ref<"gview" | "templ">("gview");
  const previewCode = ref("");
  const loading = ref(false);
  const loadingCatalog = ref(false);
  const copied = ref(false);
  const dynamicOpts = ref<Record<string, DynamicOption[]>>({});

  // ── helpers ──
  function resetParams(func: TplFuncInfo) {
    params.value = {};
    if (func.params) {
      for (const p of func.params) {
        if (p.default !== undefined && p.default !== "") {
          params.value[p.name] = p.default;
        }
      }
    }
    loopMode.value = !!func.has_loop;
    dynamicChannel.value = false;
    // 默认勾选前 4 个 Item 方法，自动填充默认参数
    itemFields.value = func.item_methods
      ? func.item_methods.slice(0, 4).map((m) => buildItemFieldConfig(m))
      : [];
  }

  /** 根据方法元数据构造带默认参数的 ItemFieldConfig */
  function buildItemFieldConfig(method: TplFuncInfo): ItemFieldConfig {
    const p: Record<string, any> = {};
    if (method.params) {
      for (const fp of method.params) {
        if (fp.default !== undefined && fp.default !== "") {
          p[fp.name] = fp.default;
        }
      }
    }
    return { name: method.name, params: p };
  }

  // ── computed ──
  const categoryList = computed(() => {
    const ids = catalog.value.map((c) => c.id);
    return ["all", ...ids];
  });

  const filteredCatalog = computed(() => {
    let cats = catalog.value;
    if (activeCategory.value !== "all") {
      cats = cats.filter((c) => c.id === activeCategory.value);
    }
    if (!searchQuery.value) return cats;
    const q = searchQuery.value.toLowerCase();
    return cats
      .map((cat) => ({
        ...cat,
        functions: cat.functions.filter(
          (f) => f.name.toLowerCase().includes(q) || f.signature.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.functions.length > 0);
  });

  const totalFuncs = computed(() => catalog.value.reduce((s, c) => s + c.functions.length, 0));

  const currentParams = computed<TplFuncParam[]>(() => {
    return selectedFunc.value?.params || [];
  });

  // ── actions ──

  /** Load the function catalog from the backend */
  async function loadCatalog() {
    loadingCatalog.value = true;
    try {
      const res = await getTagCatalog();
      catalog.value = (res.data?.catalogs || []) as TplFuncCategory[];
    } catch {
      catalog.value = [];
    } finally {
      loadingCatalog.value = false;
    }
  }

  /** Select a function and reset form state */
  function selectFunc(func: TplFuncInfo) {
    selectedFunc.value = func;
    resetParams(func);
    // Pre-fetch dynamic options for select / dynamic_select type params
    if (func.params) {
      for (const p of func.params) {
        if (p.type === "select" && p.options_key) {
          loadDynamicOptions(p.options_key);
        } else if (p.type === "dynamic_select") {
          loadDynamicOptions(p.name);
        }
      }
    }
    // Pre-fetch dynamic options for Item method params
    if (func.item_methods) {
      for (const m of func.item_methods) {
        if (m.params) {
          for (const p of m.params) {
            if (p.type === "select" && p.options_key) {
              loadDynamicOptions(p.options_key);
            }
          }
        }
      }
    }
    generatePreview();
  }

  /** Generate preview with debounce */
  function generatePreview() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => _generateNow(), DEBOUNCE_MS);
  }

  /** Force immediate generation */
  async function generatePreviewNow() {
    if (debounceTimer) clearTimeout(debounceTimer);
    return _generateNow();
  }

  async function _generateNow() {
    const fn = selectedFunc.value;
    if (!fn) {
      previewCode.value = "";
      return;
    }
    loading.value = true;
    try {
      const cleanParams: Record<string, any> = {};
      for (const p of fn.params || []) {
        cleanParams[p.name] = params.value[p.name] ?? "";
      }
      const res = await previewTag({
        func_name: fn.name,
        params: cleanParams,
        engine: engine.value,
        loop_mode: loopMode.value,
        loop_var: loopVar.value,
        item_fields: loopMode.value ? itemFields.value : [],
        dynamic_channel: dynamicChannel.value,
      });
      const result = res as unknown as { data?: { code?: string }; code?: string };
      previewCode.value = result.data?.code || result.code || "// no output";
    } catch {
      previewCode.value = "// ⚠ preview failed — check the console for details";
    } finally {
      loading.value = false;
    }
  }

  /** Load dynamic select options for a given param */
  async function loadDynamicOptions(key: string) {
    if (dynamicOpts.value[key]) return;
    try {
      const res = await getDynamicParams(key);
      const result = res as unknown as {
        data?: { options?: DynamicOption[] };
        options?: DynamicOption[];
      };
      const list = result.data?.options || result.options || [];
      if (list.length) dynamicOpts.value[key] = list;
    } catch {
      // silently fail — param stays as a free-text input
    }
  }

  /** Copy generated code to clipboard with a brief visual feedback */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(previewCode.value);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1800);
    } catch {
      // fallback for old browsers
    }
  }

  /** Set search query + reset category filter */
  function search(q: string) {
    searchQuery.value = q;
  }

  /** Filter by category */
  function filterCategory(id: string) {
    activeCategory.value = id;
  }

  // ── Item field management ──

  /** Toggle a field on/off with default params auto-initialized */
  function toggleField(method: TplFuncInfo) {
    const idx = itemFields.value.findIndex((f) => f.name === method.name);
    if (idx >= 0) {
      itemFields.value = itemFields.value.filter((f) => f.name !== method.name);
    } else {
      itemFields.value = [...itemFields.value, buildItemFieldConfig(method)];
    }
  }

  /** Check if a field is selected */
  function hasField(name: string): boolean {
    return itemFields.value.some((f) => f.name === name);
  }

  /** Get current params of a selected field */
  function getFieldParams(name: string): Record<string, any> {
    return itemFields.value.find((f) => f.name === name)?.params || {};
  }

  /** Update a parameter value of a selected field */
  function updateItemFieldParam(fieldName: string, paramName: string, value: any) {
    const f = itemFields.value.find((f) => f.name === fieldName);
    if (f) {
      f.params[paramName] = value;
      itemFields.value = [...itemFields.value]; // trigger reactivity
      generatePreview();
    }
  }

  return {
    // state
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
    loading,
    loadingCatalog,
    copied,
    dynamicOpts,
    // computed
    categoryList,
    filteredCatalog,
    totalFuncs,
    currentParams,
    // actions
    loadCatalog,
    selectFunc,
    generatePreview,
    generatePreviewNow,
    loadDynamicOptions,
    copyCode,
    search,
    filterCategory,
    // item field management
    toggleField,
    hasField,
    getFieldParams,
    updateItemFieldParam,
  };
}
