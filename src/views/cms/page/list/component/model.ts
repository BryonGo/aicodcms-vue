export interface CmsPageTableColumns {
  id: number; // ID
  title: string;
  content: string; // 文章内容
  type: string;
  flag: string;
  views: string;
  created_at: string; // 创建时间
  published_at: string; // 发布时间
  weigh: number; // 权重
  status: number; // 状态
  showtpl: string;
  diyname: string;
}

export interface CmsPageInfoData {
  id: number | undefined; // ID
  title: string | undefined; // 标题
  content: string | undefined; // 文章内容
  seotitle: string | undefined; // 标题
  keywords: string | undefined; // 标题
  description: string | undefined; // 标题
  diyname: string | undefined; // 自定义路由
  showtpl: string | undefined; //内容页模版
  type: string | undefined; // 类型
  flag: string | undefined; // 标志
  views: string | undefined; // 点击
  created_at: string | undefined; // 创建时间
  updated_at: string | undefined; // 发布时间
  published_at: string | undefined; // 发布时间
  weigh: number | undefined; // 权重
  status: number | undefined; // 状态
}

export interface CmsPageTableDataState {
  ids: any[];
  tableData: {
    data: Array<CmsPageTableColumns>;
    total: number;
    loading: boolean;
    param: {
      page: number;
      row: number;
      name: string | undefined;
    };
  };
}

export interface CmsPageEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: CmsPageInfoData;
  rules: object;
}
