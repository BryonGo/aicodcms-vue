export interface ChannelTableColumns {
  id: number; // ID
  name: string; // 名称
  parent_id: number; // 父ID
  type: string; // 类型
  weigh: number; // 权重
  image: string; // 缩略图
  outlink: string; // 跳转链接
  status: string; // 状态
  diyname: string; // 自定义名称
  items: number; //数量
  flag: string;
  isnav: number; //是否显示导航
  layouttpl: string | undefined; // 布局模板
  channeltpl: string | undefined; // 栏目页模板
  listtpl: string | undefined; // 列表页模板
  showtpl: string | undefined; // 详情页模板
  linkedCmsChannelCmsChannel: LinkedCmsChannelCmsChannel;
}

export interface ChannelInfoData {
  id: number | undefined; // ID
  name: string | undefined; // 名称
  type: string | undefined; // 类型
  seotitle: string | undefined; // SEO标题
  keywords: string | undefined; // SEO关键字
  description: string | undefined; // SEO描述
  created_at: string | undefined; // 创建日期
  updated_at: string | undefined; // 更新日期
  deleted_at: string | undefined; // 删除日期
  content: string | undefined; // 内容
  parent_id: number | undefined; // 父ID
  weigh: number | undefined; // 权重
  layouttpl: string | undefined; // layouttpl模板
  channeltpl: string | undefined; // 栏目页模板
  listtpl: string | undefined; // 列表页模板
  showtpl: string | undefined; // 详情页模板
  pagesize: string | undefined; // 分页大小
  isInherit: boolean | undefined; // 继承模板
  image: string | undefined; // 缩略图
  status: string; // 状态
  outlink: string | undefined; // 外部链接
  diyname: string | undefined; // 自定义名称
  isnav: number; //是否显示导航
  flag: string | undefined; // 外部链接
  linkedCmsChannelCmsChannel: LinkedCmsChannelCmsChannel;
}

export interface LinkedCmsChannelCmsChannel {
  id: number | undefined; // ID
  name: string | undefined; // 名称
}

export interface ChannelTableDataState {
  ids: any[];
  tableData: {
    data: Array<ChannelTableColumns>;
    total: number;
    loading: boolean;
    param: {
      page: number;
      row: number;
      name: string | undefined;
      order?: string;
      sort?: string;
    };
  };
}

export interface ChannelEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: ChannelInfoData;
  rules: object;
}

// 频道类型选项 ── 与前端的 type 字段一一对应
export const ChannelTypeOptions = [
  { label: "首页", value: "index" },
  { label: "列表栏目", value: "list" },
  { label: "频道封面", value: "channel" },
  { label: "单页", value: "page" },
  { label: "跳转链接", value: "link" },
];
