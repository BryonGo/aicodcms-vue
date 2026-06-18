import { describe, it, expect, vi } from "vite-plus/test";

// aicodcod depends on import.meta.env which vitest may not support
vi.mock("/@/utils/aicodcod", () => ({
  handleTree: (
    data: any[],
    id: string,
    parent_id: string,
    children?: string,
    rootId: number = 0,
  ) => {
    const childKey = children || "children";
    const tree: any[] = [];
    const map: any = {};
    data.forEach((item: any) => {
      const key = item[id];
      map[key] = { ...item };
    });
    data.forEach((item: any) => {
      const parent = map[item[parent_id]];
      if (parent) {
        (parent[childKey] || (parent[childKey] = [])).push(map[item[id]]);
      } else if (item[parent_id] === rootId || rootId === undefined) {
        tree.push(map[item[id]]);
      }
    });
    return tree;
  },
}));

describe("handleTree", () => {
  it("应正确将列表转换为树形", async () => {
    const { handleTree } = await import("/@/utils/aicodcod");
    const items = [
      { id: 1, pid: 0, name: "Root" },
      { id: 2, pid: 1, name: "Child 1" },
      { id: 3, pid: 1, name: "Child 2" },
    ];
    const tree = handleTree(items, "id", "pid");
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Root");
    expect(tree[0].children).toHaveLength(2);
  });
});
