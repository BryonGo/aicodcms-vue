export interface CmsArticleTableColumns {
  id: number; // ID
  title: string; // 标题
  channel_id: number; // 分类
  model_id: number; // 模型
  views: number; // 点击数
  flag: string; // 推荐属性
  status: string; // 状态
  user_id: number; // 用户ID
  published_at: string; // 发布日期
  weigh: number | undefined; // 权重
}

export interface CmsArticleInfoData {
  id: number | undefined; // ID
  user_id: number | undefined; // 用户中心ID
  channel_id: number | undefined; // 栏目ID
  channel_ids: string | undefined; // 副栏目ID集合
  model_id: number | undefined; // 模型ID
  special_ids: string | undefined; // 专题ID集合
  admin_id: number | undefined; // 发表者用户id
  recommended: number | undefined; // 是否推荐;1:推荐;0:不推荐
  title: string | undefined; // 标题
  flag: string | undefined; // 推荐属性
  style: string | undefined; // 推荐属性
  image: string | undefined; // 缩略图
  images: string | undefined; // 组图
  seotitle: string | undefined; // SEO标题
  keywords: string | undefined; // 关键字
  description: string | undefined; // 描述
  tags: string | undefined; // Tags以逗号分隔
  is_jump: number | undefined; // 是否跳转地址
  jump_url: string | undefined; // 跳转地址
  diyname: string | undefined; // 自定义url
  views: number | undefined; // 点击数
  created_at: string | undefined; // 创建日期
  updated_at: string | undefined; // 更新日期
  published_at: string | undefined; // 更新日期
  deleted_at: string | undefined; // 删除日期
  is_slide: number | undefined; // 是否幻灯 1是 0否
  is_top: number | undefined; // 是否置顶;1:置顶;0:不置顶
  status: number | undefined; // 状态
  weigh: number | undefined; // 权重
  showtpl: string | undefined; // 自定义详情模板
  content: string | undefined; // 文章内容
  modulesData: any; // 模型数据
}

export interface CmsArticleTableDataState {
  ids: any[];
  modulesList: any[];
  tableData: {
    data: Array<CmsArticleTableColumns>;
    total: number;
    loading: boolean;
    param: {
      page: number;
      row: number;
      keywords: string | undefined;
      channel_id: number[] | undefined;
      module_id: number | undefined;
      flag: string | undefined;
      status: string | undefined;
    };
  };
  channel_tree: any[];
  channel_tree_props: {};
}

export interface CmsArticleEditState {
  loading: boolean;
  isShowDialog: boolean;
  formData: CmsArticleInfoData;
  rules: object;
}
