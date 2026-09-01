/**
 * 南京信息价同步器：官网列表 → nanjingInfoPrices.ts
 *
 * 功能：
 * 1. 读取官网抓取结果 data/njszj_info_prices.json（fetch_njszj.cjs 的输出）
 * 2. 与 src/data/nanjingInfoPrices.ts 中已有条目按 year+month 对比
 * 3. 缺失的月份自动生成条目（PDF 直链按文件名规律构造，见 data/pdf_url_map.json）
 * 4. 按 年+月 倒序重排并重写 ts 文件
 *
 * 用法：node scripts/sync_njszj.cjs
 */

const fs = require("fs");
const path = require("path");

const TS_PATH = path.join(__dirname, "..", "src", "data", "nanjingInfoPrices.ts");
const META_PATH = path.join(__dirname, "..", "data", "njszj_info_prices.json");
const URL_MAP_PATH = path.join(__dirname, "..", "data", "pdf_url_map.json");

// 从官网标题生成条目
function buildRecord(item, pdfUrl) {
  // date 形如 2026-07-31（njszj 官网发布日期即当月末，月份=期刊月份）
  const dm = item.date.match(/(\d{4})-(\d{2})/);
  if (!dm) return null;
  const year = parseInt(dm[1]);
  const month = parseInt(dm[2]);
  return {
    id: `nj-real-${year}-${String(month).padStart(2, "0")}`,
    region: "南京",
    year,
    month,
    type: "信息价",
    title: item.title,
    publishDate: item.date,
    source: "南京市建设工程造价监督站(njszj.cn)",
    sourceUrl: item.url,
    pdfUrl: pdfUrl || "",
    category: "材料信息价",
    isOfficial: true,
    isReal: true,
  };
}

// 解析 ts 文件中的条目块（规整 JSON，去掉尾逗号后可 parse）
function parseExistingEntries(ts) {
  const decl = "NanjingInfoPriceRecord[] = [";
  const declIdx = ts.indexOf(decl);
  if (declIdx === -1) throw new Error("未找到数组声明: " + decl);
  const arrStart = declIdx + decl.length - 1; // 指向 "["
  const arrEnd = ts.indexOf("];", arrStart);
  const body = ts.slice(arrStart + 1, arrEnd);
  // 按顶层大括号切块
  const entries = [];
  let depth = 0, cur = "";
  for (const ch of body) {
    if (ch === "{") { depth++; if (depth === 1) cur = ""; }
    if (depth >= 1) cur += ch;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          entries.push(JSON.parse(cur.replace(/,(\s*)$/, "$1")));
        } catch (e) {
          console.error("条目解析失败，跳过:", cur.slice(0, 80), e.message);
        }
      }
    }
  }
  return { header: ts.slice(0, arrStart + 1), entries, footer: ts.slice(arrEnd) };
}

function serializeEntry(e) {
  return "  " + JSON.stringify(e, null, 2).replace(/\n/g, "\n  ") + ",";
}

(async () => {
  const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
  const urlMap = JSON.parse(fs.readFileSync(URL_MAP_PATH, "utf8"));
  const ts = fs.readFileSync(TS_PATH, "utf8");
  const { header, entries, footer } = parseExistingEntries(ts);

  console.log(`现有条目: ${entries.length}`);
  const have = new Set(entries.map((e) => `${e.year}-${e.month}`));

  let added = 0;
  for (const item of meta.items) {
    const dm = item.date.match(/(\d{4})-(\d{2})/);
    if (!dm) continue;
    const y = parseInt(dm[1]), m = parseInt(dm[2]);
    if (have.has(`${y}-${m}`)) continue;
    // PDF 直链：优先条目自带，其次按文件名规律构造（2026 年映射表）
    let pdfUrl = item.pdfUrl || "";
    if (!pdfUrl && urlMap[String(m)] && y === 2026) pdfUrl = urlMap[String(m)];
    const rec = buildRecord(item, pdfUrl);
    if (rec) {
      entries.push(rec);
      added++;
      console.log(`+ 新增: ${rec.id} ${rec.title} (${rec.publishDate})`);
    }
  }

  // 按年月倒序
  entries.sort((a, b) => (b.year - a.year) || (b.month - a.month));

  const out =
    header +
    "\n" + entries.map(serializeEntry).join("\n") + "\n" +
    footer.replace(/^\];/, "];");
  fs.writeFileSync(TS_PATH, out, "utf8");
  console.log(`\n✓ 完成：新增 ${added} 条，总计 ${entries.length} 条 → ${TS_PATH}`);
})();
