import { createApp } from "vue";
import pinia from "/@/stores/index";
import App from "./App.vue";
import router from "./router";
import { directive } from "/@/utils/directive";
import { i18n } from "/@/i18n";
import other from "/@/utils/other";

import ElementPlus from "element-plus";

import "element-plus/dist/index.css";
// Element Plus 暗色 css 变量（package 自带，无新增依赖）
import "element-plus/theme-chalk/dark/css-vars.css";
import "/@/styles/index.css";
import mitt from "mitt";
import VueGridLayout from "vue-grid-layout";
import { getUpFileUrl, handleTree, parseTime, selectDictLabel } from "/@/utils/aicodcod";
import { useDict } from "/@/api/pms/dict/data";
import { getItems, setItems, getOptionValue, isEmpty } from "/@/api/items";
// 分页组件
import pagination from "/@/components/pagination/index.vue";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 大文件上传组件
// @ts-ignore
import uploader from "vue-simple-uploader";
import "vue-simple-uploader/dist/style.css";

const app = createApp(App);

// Silence known-benign warnings. These are not caused by our code and do not
// affect behavior; only the exact messages below are suppressed. All other
// warnings pass through unchanged.
app.config.warnHandler = (msg, instance, type) => {
  if (typeof msg === "string") {
    // 1) Element Plus's ElPopper `role` prop receives "button" (not in its enum)
    //    on a sub-component we don't control — no `:role` binding exists in the
    //    project (grep-confirmed). Fires when a dropdown/tooltip/select re-renders.
    if (msg.includes('prop "role"')) return;
    // 2) `v-auth` on Element Plus `el-dropdown-item` (its root is a Fragment, so
    //    the directive can't attach to a single element). The directive itself
    //    was hardened in src/utils/authDirective.ts to still hide the item; this
    //    is just Vue's unavoidable notice about the fragment root.
    if (msg.includes("Runtime directive used on component with non-element root node"))
      return;
  }
  // Forward every other warning to the console (default Vue behavior).
  // Append the source component file so warnings are self-diagnosing.
  const inst = instance as any;
  const opts = inst?.$options;
  const comp =
    opts?.__file || opts?.__name || inst?.type?.__file || "anonymous";
  // eslint-disable-next-line no-console
  console.warn(`[Vue warn] (${comp}): ${msg}`, instance ?? "");
};

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
directive(app);
other.elSvg(app);
app.component("pagination", pagination);
app
  .use(pinia)
  .use(VueGridLayout)
  .use(router)
  .use(ElementPlus)
  .use(i18n)
  .use(uploader)
  .mount("#app");

app.config.globalProperties.getUpFileUrl = getUpFileUrl;
app.config.globalProperties.handleTree = handleTree;
app.config.globalProperties.useDict = useDict;
app.config.globalProperties.selectDictLabel = selectDictLabel;

app.config.globalProperties.getItems = getItems;
app.config.globalProperties.setItems = setItems;
app.config.globalProperties.getOptionValue = getOptionValue;
app.config.globalProperties.isEmpty = isEmpty;
app.config.globalProperties.parseTime = parseTime;

const globalProperties = {
  mittBus: mitt(),
  i18n,
};

//必须合并vue默认的变量，否则有问题
app.config.globalProperties = Object.assign(app.config.globalProperties, globalProperties);
