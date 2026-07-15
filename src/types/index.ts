// 建筑材料询价系统 - 类型定义

// 工程大类
export interface Category {
  id: string;
  name: string;
  icon: string; // emoji 或图标标识
  hot?: boolean; // 热门标识
  children: SubCategory[];
}

// 子分类
export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

// 规格参数
export interface SpecItem {
  key: string;
  value: string;
}

// 供货商
export interface Supplier {
  id: string;
  name: string;
  region: string; // 所在地
  contact: string; // 联系方式（电话）
  level: string; // 供应商等级
  address?: string; // 详细地址
  mainProducts?: string[]; // 主营材料
  brand?: string; // 品牌
  website?: string; // 官网
  categoryIds?: string[]; // 经营材料分类
  source?: string; // 数据来源
}

// 市场价记录
export interface MarketPrice {
  id: string;
  materialName: string; // 材料名称
  categoryId: string; // 工程分类
  brand: string; // 品牌
  specs: SpecItem[]; // 规格参数
  supplier: Supplier; // 供货商
  price: number; // 工程价（元）
  unit: string; // 单位
  region: string; // 报价地区
  date: string; // 报价日期
  projectType: ProjectType; // 工程类型
  pdfUrl?: string; // 信息价PDF链接
  month?: number; // 信息价月份
}

// 工程类型（用于"最新市场价"标签筛选）
export type ProjectType =
  | "土建工程"
  | "装饰工程"
  | "电气工程"
  | "给排水"
  | "消防工程"
  | "暖通工程"
  | "市政工程"
  | "园林绿化"
  | "其它材料"
  | "辅材工具";

// 信息价记录
export interface InfoPrice {
  id: string;
  region: string; // 地区
  year: number;
  month: number;
  type: string; // 信息价类型（通用/公路/管廊等）
  title: string;
  publishDate: string;
  source?: string; // 数据来源（如"南京造价信息网"）
  sourceUrl?: string; // 来源链接
  category?: string; // 信息价子分类（材料信息价/人工信息价等）
  isOfficial?: boolean; // 是否官方发布
  pdfUrl?: string; // PDF下载链接
  isReal?: boolean; // 是否真实抓取数据
}

// 查询历史记录
export interface HistoryRecord {
  id: string;
  keyword: string; // 搜索关键词
  filters: {
    category?: string;
    region?: string;
    brand?: string;
  };
  resultCount: number; // 结果数量
  timestamp: number; // 查询时间戳
  results?: MarketPrice[]; // 可选：保存结果快照
}

// 搜索查询参数
export interface SearchParams {
  keyword: string;
  category?: string;
  region?: string;
  brand?: string;
  projectType?: ProjectType;
}

// 搜索结果
export interface SearchResult {
  marketPrices: MarketPrice[];
  infoPrices: InfoPrice[];
  total: number;
}
