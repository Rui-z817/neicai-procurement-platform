/**
 * 将抓取的南京造价协会信息价JSON转换为系统数据文件
 *
 * 输入: .workbuddy/njzjxh_info_prices.json (抓取结果)
 * 输出: app/src/data/nanjingInfoPrices.ts (系统数据文件)
 *
 * 从标题"南京市二〇二六年三月建设工程材料市场信息价格"中解析年月
 */

const fs = require("fs");
const path = require("path");

// 中文数字转阿拉伯数字
const cnYearMap = { "〇": "0", "一": "1", "二": "2", "三": "3", "四": "4", "五": "5", "六": "6", "七": "7", "八": "8", "九": "9" };
const cnMonthMap = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12 };

function parseChineseYear(title) {
  // 匹配 "二〇二六年" 或 "二0一九年" (兼容阿拉伯0和中文〇)
  const m = title.match(/([〇〇一二三四五六七八九0-9]{4})年/);
  if (!m) return null;
  const digits = m[1].split("").map((c) => {
    if (c === "0" || c === "〇" || c === "〇") return "0";
    return cnYearMap[c] || c;
  }).join("");
  return parseInt(digits);
}

function parseChineseMonth(title) {
  // 匹配 "三月" "十一月" "十二月" "五月（上半月）"
  const m = title.match(/年([一二三四五六七八九十]+)月/);
  if (!m) return null;
  return cnMonthMap[m[1]] || null;
}

function parseHalfMonth(title) {
  // 检测"上半月"/"下半月"
  if (/上半月/.test(title)) return "upper";
  if (/下半月/.test(title)) return "lower";
  return null;
}

// 读取抓取结果
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "njzjxh_info_prices.json"), "utf8"));
const items = raw.items || [];
const withPdf = raw.withPdf || [];

// 建立 url -> pdfUrls 的映射
const pdfMap = {};
withPdf.forEach((w) => {
  if (w.pdfUrls && w.pdfUrls.length > 0) {
    // 只取第一个 .pdf 结尾的真实链接
    const realPdf = w.pdfUrls.find((u) => u.endsWith(".pdf") && u.includes("/upload/"));
    if (realPdf) pdfMap[w.url] = realPdf;
  }
});

// 转换为系统数据
const records = [];
items.forEach((item, idx) => {
  const year = parseChineseYear(item.title);
  const month = parseChineseMonth(item.title);
  const half = parseHalfMonth(item.title);
  if (!year || !month) {
    console.warn(`跳过(无法解析年月): ${item.title}`);
    return;
  }

  const pdfUrl = pdfMap[item.url] || "";
  const id = `nj-real-${year}-${String(month).padStart(2, "0")}${half ? "-" + half : ""}`;

  records.push({
    id,
    region: "南京",
    year,
    month,
    type: "信息价",
    title: item.title,
    publishDate: item.date,
    source: "南京造价信息网(njzjxh.cn)",
    sourceUrl: item.url,
    pdfUrl,
    category: "材料信息价",
    isOfficial: true,
    isReal: true, // 标记为真实抓取数据
  });
});

// 去重（按id）
const seen = new Set();
const unique = [];
records.forEach((r) => {
  if (!seen.has(r.id)) {
    seen.add(r.id);
    unique.push(r);
  }
});

// 按年月降序排序
unique.sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
});

console.log(`✓ 转换完成: ${unique.length} 条真实信息价记录`);
console.log(`  有PDF链接: ${unique.filter((r) => r.pdfUrl).length} 条`);
console.log(`  年份范围: ${unique[unique.length - 1].year}年${unique[unique.length - 1].month}月 ~ ${unique[0].year}年${unique[0].month}月`);

// 生成 TypeScript 数据文件
const tsContent = `// ============================================================
// 南京造价信息网 真实信息价数据
// 数据来源: http://www.njzjxh.cn/NECACMS/channels/1117.html
// 抓取时间: ${new Date().toISOString().slice(0, 10)}
// 共 ${unique.length} 条记录，跨度 ${unique[unique.length - 1].year}年${unique[unique.length - 1].month}月 ~ ${unique[0].year}年${unique[0].month}月
// 每条记录含官方PDF下载链接
// ============================================================

import type { InfoPrice } from "@/types";

export interface NanjingInfoPriceRecord extends InfoPrice {
  pdfUrl?: string; // PDF下载链接
  isReal?: boolean; // 是否真实抓取数据
}

export const nanjingRealInfoPrices: NanjingInfoPriceRecord[] = ${JSON.stringify(unique, null, 2)};

// 获取所有可用年份
export function getRealYears(): number[] {
  const years = [...new Set(nanjingRealInfoPrices.map((r) => r.year))];
  return years.sort((a, b) => b - a);
}

// 按年份筛选
export function getRealByYear(year: number): NanjingInfoPriceRecord[] {
  return nanjingRealInfoPrices.filter((r) => r.year === year);
}

// 获取最新一期
export function getLatestReal(): NanjingInfoPriceRecord | null {
  return nanjingRealInfoPrices.length > 0 ? nanjingRealInfoPrices[0] : null;
}
`;

const outPath = path.join(__dirname, "src", "data", "nanjingInfoPrices.ts");
fs.writeFileSync(outPath, tsContent, "utf8");
console.log(`\n✓ 数据文件已生成: ${outPath}`);
