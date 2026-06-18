/* eslint-disable */

// 声明文件，*.vue 后缀的文件交给 vue 模块来处理
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 声明文件，定义全局变量。其它 app.config.globalProperties.xxx，使用 getCurrentInstance() 来获取
interface Window {
  nextLoading: boolean;
}

// element-plus 类型补充声明
declare module "element-plus" {
  export const ElMessage: import("element-plus/es/utils").SFCInstallWithContext<
    import("element-plus/es/components/message/src/message").Message
  >;
  export const ElMessageBox: import("element-plus/es/components/message-box").ElMessageBox;
  export type FormInstance = import("element-plus/es/components/form").FormInstance;
  export type UploadProps = import("element-plus/es/components/upload").UploadProps;
}
