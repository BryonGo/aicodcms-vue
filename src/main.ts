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
  .use(ElementPlus, { i18n: i18n.global.t })
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
