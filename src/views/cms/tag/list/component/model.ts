export interface CmsTagsTableColumns {
  id: number; // ID
  name: string; // 标签名称
  seotitle: string;
  keywords: string;
  description: string;
  nums: number; // 关联数
  views: number; // 浏览量
  autolink: number; // 是否内链
}

export interface CmsTagsInfoData {
  id: number | undefined; // ID
  name: string | undefined; // 标签名称
  created_at: string | undefined; // 创建日期
  updated_at: string | undefined; // 更新日期
  seotitle: string | undefined; // 创建日期
  keywords: string | undefined; // 创建日期
  description: string | undefined; // 创建日期
  nums: number | undefined; // 关联数
  views: number | undefined; // 浏览量
  autolink: number | undefined; // 是否内链
}

export interface CmsTagsTableDataState {
  ids: any[];
  tableData: {
    data: Array<CmsTagsTableColumns>;
    total: number;
    loading: boolean;
    param: {
      page: number;
      row: number;
      name: string | undefined;
    };
  };
}

export interface CmsTagsEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: CmsTagsInfoData;
  rules: object;
}
