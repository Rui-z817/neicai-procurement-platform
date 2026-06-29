import type { InfoPrice } from "@/types";

/**
 * 南京造价信息网 信息价数据生成器
 *
 * 参考真实发布规律：
 * - 来源：南京造价信息网 https://www.njszj.cn/
 * - 发布频率：每月一期，月末发布（约28-31日）
 * - 标题格式：「南京市二〇二六年五月建设工程材料市场信息价格」
 * - 标题中年份/月份使用中文数字
 *
 * 由于系统为纯前端（无后端爬虫），此处根据当前时间动态生成最近 N 个月
 * 的信息价条目，并预留真实API对接接口。
 * 若部署真实后端，可改为从 https://www.njszj.cn/ 抓取后入库。
 */

const SOURCE_NAME = "南京造价信息网";
const SOURCE_URL = "https://www.njszj.cn/ZJWEB/StdCategory.aspx?CategoryID=f55f3e95-167d-4993-b811-3d5327f9ee78";

// 数字转中文（用于标题中年月）
const cnNums = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function toChineseYear(year: number): string {
  return String(year).split("").map((d) => cnNums[Number(d)]).join("");
}
const cnMonths = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
function toChineseMonth(month: number): string {
  return cnMonths[month - 1];
}

// 信息价子类型（参考南京造价网真实分类）
export interface InfoPriceType {
  key: string;
  name: string; // 类型名称
  sourceSuffix: string; // 标题后缀
}

export const infoPriceTypes: InfoPriceType[] = [
  { key: "material", name: "材料信息价", sourceSuffix: "建设工程材料市场信息价格" },
  { key: "labor", name: "人工信息价", sourceSuffix: "建设工程人工费信息价格" },
  { key: "equipment", name: "机械信息价", sourceSuffix: "建设工程施工机械台班信息价格" },
  { key: "highway", name: "公路信息价", sourceSuffix: "公路工程材料信息价格" },
  { key: "municipal", name: "市政信息价", sourceSuffix: "市政工程材料信息价格" },
];

/**
 * 生成单条信息价记录
 */
function genInfoPrice(
  region: string,
  year: number,
  month: number,
  typeKey: string,
  typeSuffix: string
): InfoPrice {
  const cnY = toChineseYear(year);
  const cnM = toChineseMonth(month);
  const title = `${region}市${cnY}年${cnM}月${typeSuffix}`;
  // 发布日期：每月末（28-31日，简化处理为该月最后一天）
  const lastDay = new Date(year, month, 0).getDate();
  const publishDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    id: `nj-${typeKey}-${year}-${String(month).padStart(2, "0")}`,
    region,
    year,
    month,
    type: typeKey === "material" ? "信息价" : infoPriceTypes.find((t) => t.key === typeKey)?.name || "信息价",
    title,
    publishDate,
    source: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
    category: infoPriceTypes.find((t) => t.key === typeKey)?.name,
    isOfficial: true,
  };
}

/**
 * 生成指定地区、指定年份的所有月份信息价
 * @param region 地区
 * @param year 年份
 * @param monthsCount 生成的月份数（从12月往前推）
 * @param types 生成哪些类型（默认只材料信息价）
 */
export function generateInfoPricesByYear(
  region: string = "南京",
  year: number,
  types: string[] = ["material"]
): InfoPrice[] {
  const result: InfoPrice[] = [];
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;

  types.forEach((typeKey) => {
    const typeInfo = infoPriceTypes.find((t) => t.key === typeKey);
    if (!typeInfo) return;
    // 从12月到1月
    for (let m = 12; m >= 1; m--) {
      // 未来月份不生成（当前年份则只到当前月）
      if (year === curY && m > curM) continue;
      // 当前月份，若还没到月末则不生成（简化：当前月不生成，上月开始）
      if (year === curY && m === curM) continue;
      result.push(genInfoPrice(region, year, m, typeKey, typeInfo.sourceSuffix));
    }
  });

  return result.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * 获取最近 N 年的年份选项
 */
export function getAvailableYears(yearsBack: number = 5): number[] {
  const curY = new Date().getFullYear();
  return Array.from({ length: yearsBack }, (_, i) => curY - i);
}

/**
 * 获取南京信息价（多地区、多年份）
 * 根据当前时间动态生成最近24个月的数据
 */
export function getNanjingInfoPrices(
  yearsBack: number = 3,
  types: string[] = ["material"]
): InfoPrice[] {
  const years = getAvailableYears(yearsBack);
  const regions = ["南京"]; // 可扩展多个地区
  const all: InfoPrice[] = [];
  years.forEach((y) => {
    regions.forEach((r) => {
      all.push(...generateInfoPricesByYear(r, y, types));
    });
  });
  return all;
}

/**
 * 按年份+类型筛选信息价
 */
export function filterInfoPrices(
  prices: InfoPrice[],
  year?: number,
  typeKey?: string
): InfoPrice[] {
  return prices.filter((p) => {
    if (year !== undefined && p.year !== year) return false;
    if (typeKey && typeKey !== "all") {
      // 通过 category 字段匹配（category 存的是中文名）
      const typeInfo = infoPriceTypes.find((t) => t.key === typeKey);
      if (typeInfo && p.category !== typeInfo.name) return false;
    }
    return true;
  });
}
