/**
 * 数据服务层
 *
 * 该层封装所有数据访问逻辑，对外提供统一的异步接口。
 * 根据 apiConfig.useRealApi 自动切换：
 *   - false：使用内置模拟数据（带网络延迟模拟）
 *   - true：调用真实API（需先配置 apiConfig.baseUrl 和 apiToken）
 *
 * 组件层只调用本模块的函数，不直接访问数据文件，便于后续替换为真实接口。
 */

import {
  marketPrices,
  infoPrices,
  categories,
  suppliers,
} from "@/data/materials";
import { apiConfig, delay } from "@/lib/api";
import { getNanjingInfoPrices as genNanjingLocal } from "@/lib/nanjingInfoPrice";
import { infoPriceMaterials, type InfoPriceMaterial } from "@/data/infoPriceMaterials";
import type {
  SearchParams,
  MarketPrice,
  InfoPrice,
  Category,
  Supplier,
  ProjectType,
} from "@/types";

// ============ 工程类型列表 ============
export const projectTypes: ProjectType[] = [
  "土建工程",
  "装饰工程",
  "电气工程",
  "给排水",
  "消防工程",
  "暖通工程",
  "市政工程",
  "园林绿化",
  "其它材料",
  "辅材工具",
];

// ============ 搜索逻辑 ============
function matchKeyword(item: MarketPrice, keyword: string): boolean {
  if (!keyword) return true;
  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;
  // 匹配材料名、品牌、供货商名、规格参数值
  if (item.materialName.toLowerCase().includes(kw)) return true;
  if (item.brand.toLowerCase().includes(kw)) return true;
  if (item.supplier.name.toLowerCase().includes(kw)) return true;
  if (item.specs.some((s) => s.value.toLowerCase().includes(kw))) return true;
  return false;
}

function matchCategory(item: MarketPrice, category: string): boolean {
  if (!category || category === "全部") return true;
  // 通过 categoryId 找到所属分类
  const cat = categories.find((c) => c.name === category);
  if (!cat) return true;
  return cat.children.some((ch) => ch.id === item.categoryId);
}

function matchRegion(item: MarketPrice, region: string): boolean {
  if (!region || region === "全部") return true;
  return item.region === region;
}

function matchBrand(item: MarketPrice, brand: string): boolean {
  if (!brand || brand === "全部") return true;
  return item.brand === brand;
}

function matchInfoRegion(item: InfoPrice, region: string): boolean {
  if (!region || region === "全部") return true;
  return item.region === region;
}

function matchInfoKeyword(item: InfoPrice, keyword: string): boolean {
  if (!keyword) return true;
  return item.title.includes(keyword) || item.type.includes(keyword);
}

// ============ 信息价PDF价格 - 搜索逻辑 ============
// 将信息价PDF解析的价格转换为MarketPrice格式（标注为信息价）
function infoPriceToMarketPrice(ip: InfoPriceMaterial): MarketPrice {
  // 从 date 字段（如 "2026-06"）提取月份
  const monthMatch = ip.date?.match(/(\d{4})[-/](\d{1,2})/);
  const month = monthMatch ? parseInt(monthMatch[2]) : undefined;
  return {
    id: ip.id,
    materialName: ip.materialName,
    categoryId: ip.categoryId,
    brand: "南京信息价",
    specs: ip.spec ? [{ key: "规格", value: ip.spec }] : [],
    supplier: {
      id: "nj-info-price",
      name: "南京市建设工程造价管理协会",
      region: "南京",
      contact: "-",
      level: "官方",
    },
    price: ip.price,
    unit: ip.unit,
    region: "南京",
    date: ip.publishDate,
    projectType: ip.projectType as ProjectType,
    pdfUrl: ip.pdfUrl,
    month,
  };
}

function matchInfoPriceKeyword(item: InfoPriceMaterial, keyword: string): boolean {
  if (!keyword) return true;
  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;
  if (item.materialName.toLowerCase().includes(kw)) return true;
  if (item.fullName.toLowerCase().includes(kw)) return true;
  if (item.spec.toLowerCase().includes(kw)) return true;
  if (item.categoryName.includes(keyword)) return true;
  return false;
}

function matchInfoPriceCategory(item: InfoPriceMaterial, category: string): boolean {
  if (!category || category === "全部") return true;
  return item.categoryName === category;
}

// 搜索信息价PDF价格数据
export function searchInfoPriceMaterialsLocal(params: SearchParams): MarketPrice[] {
  return infoPriceMaterials
    .filter(
      (m) =>
        matchInfoPriceKeyword(m, params.keyword) &&
        matchInfoPriceCategory(m, params.category || "全部")
    )
    .map(infoPriceToMarketPrice);
}

// ============ 搜索材料（市场价+信息价） ============
export function searchMaterialsLocal(params: SearchParams): {
  marketPrices: MarketPrice[];
  infoPrices: InfoPrice[];
  total: number;
} {
  // 市场价（模拟数据）
  const matchedMarket = marketPrices.filter(
    (m) =>
      matchKeyword(m, params.keyword) &&
      matchCategory(m, params.category || "全部") &&
      matchRegion(m, params.region || "全部") &&
      matchBrand(m, params.brand || "全部")
  );

  // 信息价PDF价格（真实数据，标注为信息价）
  const matchedInfoPriceMaterials = searchInfoPriceMaterialsLocal(params);

  // 信息价期刊列表
  const matchedInfo = infoPrices.filter(
    (i) =>
      matchInfoKeyword(i, params.keyword) &&
      matchInfoRegion(i, params.region || "全部")
  );

  // 合并：市场价 + 信息价PDF价格（信息价价格排在后面，用sourceType区分）
  const allPrices = [...matchedMarket, ...matchedInfoPriceMaterials];

  // 按日期降序
  allPrices.sort((a, b) => (a.date < b.date ? 1 : -1));
  matchedInfo.sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));

  return {
    marketPrices: allPrices,
    infoPrices: matchedInfo,
    total: allPrices.length,
  };
}

// ============ 异步搜索接口（对外暴露） ============
export async function searchMaterials(
  params: SearchParams
): Promise<{ marketPrices: MarketPrice[]; infoPrices: InfoPrice[]; total: number }> {
  if (apiConfig.useRealApi) {
    // 真实API模式
    // import { request, endpoints } from "@/lib/api";
    // const [marketRes, infoRes] = await Promise.all([
    //   request<MarketPrice[]>(endpoints.marketPrice, {
    //     keyword: params.keyword,
    //     category: params.category,
    //     region: params.region,
    //     brand: params.brand,
    //   }),
    //   request<InfoPrice[]>(endpoints.infoPrice, {
    //     keyword: params.keyword,
    //     region: params.region,
    //   }),
    // ]);
    // return { marketPrices: marketRes.data, infoPrices: infoRes.data, total: marketRes.total || marketRes.data.length };
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  // 模拟模式：带网络延迟
  await delay();
  return searchMaterialsLocal(params);
}

// ============ 获取最新市场价 ============
export function getLatestMarketPricesLocal(limit: number = 8): MarketPrice[] {
  return [...marketPrices]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export async function getLatestMarketPrices(limit: number = 8): Promise<MarketPrice[]> {
  if (apiConfig.useRealApi) {
    // const res = await request<MarketPrice[]>(endpoints.latestMarket, { limit });
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(200);
  return getLatestMarketPricesLocal(limit);
}

// ============ 获取最新信息价 ============
export function getLatestInfoPricesLocal(limit: number = 12): InfoPrice[] {
  return [...infoPrices]
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
    .slice(0, limit);
}

// ============ 获取南京信息价（每月自动更新） ============
// 该接口整合南京造价信息网官方发布的信息价数据
// 真实API模式下应改为调用后端抓取服务
export async function getNanjingInfoPrices(
  yearsBack: number = 3
): Promise<InfoPrice[]> {
  if (apiConfig.useRealApi) {
    // 真实API：调用后端爬虫服务
    // const res = await request<InfoPrice[]>("/info-prices/nanjing", { yearsBack });
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  // 动态生成模式：根据当前时间生成最近N年的信息价
  await delay(250);
  return genNanjingLocal(yearsBack, ["material", "labor", "equipment"]);
}

export async function getLatestInfoPrices(limit: number = 12): Promise<InfoPrice[]> {
  if (apiConfig.useRealApi) {
    // const res = await request<InfoPrice[]>(endpoints.latestInfo, { limit });
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(200);
  return getLatestInfoPricesLocal(limit);
}

// ============ 按工程类型获取最新市场价 ============
export function getLatestByProjectTypeLocal(
  projectType: ProjectType,
  limit: number = 4
): MarketPrice[] {
  return marketPrices
    .filter((m) => m.projectType === projectType)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export async function getLatestByProjectType(
  projectType: ProjectType,
  limit: number = 4
): Promise<MarketPrice[]> {
  if (apiConfig.useRealApi) {
    // const res = await request<MarketPrice[]>(endpoints.marketPrice, { projectType, limit });
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(150);
  return getLatestByProjectTypeLocal(projectType, limit);
}

// ============ 获取分类列表 ============
export async function getCategories(): Promise<Category[]> {
  if (apiConfig.useRealApi) {
    // const res = await request<Category[]>(endpoints.categories);
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(100);
  return categories;
}

// ============ 获取供货商列表 ============
export async function getSuppliers(): Promise<Supplier[]> {
  if (apiConfig.useRealApi) {
    // const res = await request<Supplier[]>(endpoints.suppliers);
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(100);
  return suppliers;
}

// ============ 获取供货商详情 ============
export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  if (apiConfig.useRealApi) {
    // const res = await request<Supplier>(`${endpoints.suppliers}/${id}`);
    // return res.data;
    throw new Error("真实API对接代码已预留，请配置 apiConfig 后启用");
  }
  await delay(80);
  return suppliers.find((s) => s.id === id);
}
