// Ambient module/type shims for dependencies that are referenced in source but
// are not currently installed (or lack bundled type declarations).
//
// NOTE: `@wangeditor/editor` is imported by src/components/editor/index.vue but
// is NOT listed in package.json / node_modules. That component is currently
// unused, so the shim keeps type-checking green. If the editor feature is ever
// wired up, install the real package instead of relying on this shim:
//   npm install @wangeditor/editor --legacy-peer-deps
declare module "@wangeditor/editor" {
  export type IEditorConfig = any;
  export type IToolbarConfig = any;
  export type IDomEditor = any;
  export const createEditor: any;
  export const createToolbar: any;
  export const Boot: any;
}

// Third-party packages without bundled type declarations.
declare module "vue-grid-layout" {
  const VueGridLayout: any;
  export default VueGridLayout;
  export const GridLayout: any;
  export const GridItem: any;
}
declare module "qrcodejs2-fixes";
declare module "splitpanes";

// Custom global set on `window` by the app bootstrap / loading utilities.
interface Window {
  nextLoading?: boolean;
}
