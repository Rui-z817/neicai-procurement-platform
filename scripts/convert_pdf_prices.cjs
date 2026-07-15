/**
 * 将PDF解析的信息价价格数据转换为系统市场价格式
 * 输入: .workbuddy/parsed_prices.json
 * 输出: app/src/data/infoPriceMaterials.ts
 *
 * 数据格式：[序号, 材料名称+规格, 单位, 价格]
 * 例如：['1', '煤矸石烧结多孔砖240×190×90mm', '百块', '158.29']
 */

const fs = require("fs");
const path = require("path");

const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "parsed_prices.json"), "utf8")
);

// 读取最新一期的元数据（来自 njszj_info_prices.json）
let latestMeta = { publishDate: "2026-06-30", pdfUrl: "", year: 2026, month: 6 };
try {
  const metaRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "njszj_info_prices.json"), "utf8")
  );
  if (metaRaw.latest) {
    latestMeta.publishDate = metaRaw.latest.date;
    latestMeta.pdfUrl = metaRaw.latest.pdfUrl;
    const m = metaRaw.latest.title.match(/(\d{4})年(\d{1,2})月/);
    if (m) {
      latestMeta.year = parseInt(m[1]);
      latestMeta.month = parseInt(m[2]);
    }
  }
} catch (e) {
  console.warn("⚠️ 未找到 njszj_info_prices.json，使用默认元数据");
}
const monthLabel = `${latestMeta.year}年${latestMeta.month}月`;
const sourceLabel = `南京信息价(${monthLabel})`;

// 从材料名称中分离规格
function parseMaterialName(fullName) {
  if (!fullName) return { name: "", spec: "" };
  // 常见规格模式：数字×数字×数字mm、A3.5 B06、ΦXX、DNXX 等
  const specPatterns = [
    /(\d+×\d+×\d+mm.*)/i,
    /(\d+×\d+mm.*)/i,
    /(A[0-9.]+\s*B[0-9]+)/i,
    /(Φ[\d.]+)/i,
    /(DN\d+)/i,
    /(细度模数[\d.\-]+)/i,
    /(\d+mm.*)/i,
    /([\d.]+mpa.*)/i,
    /(C\d+)/i,
    /(M\d+)/i,
    /(P\.\w+\s*[\d.]+)/i,
  ];
  let spec = "";
  let name = fullName;
  for (const re of specPatterns) {
    const m = fullName.match(re);
    if (m) {
      spec = m[1];
      name = fullName.replace(re, "").trim().replace(/[（(]\s*[）)]/, "").trim();
      break;
    }
  }
  return { name, spec };
}

// 智能匹配系统分类
function matchCategory(name) {
  const n = name.toLowerCase();
  if (/砖|砌块|瓦/.test(name)) return { categoryId: "cement-block", catName: "水泥/砖瓦/砂石", projectType: "土建工程" };
  if (/砂/.test(name) && !/砂轮|砂纸/.test(name)) return { categoryId: "cement-sand", catName: "水泥/砖瓦/砂石", projectType: "土建工程" };
  if (/石子|碎石|卵石|骨料/.test(name)) return { categoryId: "cement-stone", catName: "水泥/砖瓦/砂石", projectType: "土建工程" };
  if (/水泥/.test(name)) return { categoryId: "cement-portland", catName: "水泥/砖瓦/砂石", projectType: "土建工程" };
  if (/石灰|石膏/.test(name)) return { categoryId: "cement-gypsum-powder", catName: "水泥/砖瓦/砂石", projectType: "土建工程" };
  if (/混凝土/.test(name) && !/砌块|砖/.test(name)) return { categoryId: "concrete-ready", catName: "混凝土/砂浆", projectType: "土建工程" };
  if (/砂浆/.test(name)) return { categoryId: "concrete-mortar", catName: "混凝土/砂浆", projectType: "土建工程" };
  if (/钢筋|螺纹钢|线材|盘条/.test(name)) return { categoryId: "metal-rebar", catName: "金属材料", projectType: "土建工程" };
  if (/钢板|彩钢板|镀锌板/.test(name)) return { categoryId: "metal-plate", catName: "金属材料", projectType: "土建工程" };
  if (/角钢/.test(name)) return { categoryId: "metal-angle", catName: "金属材料", projectType: "土建工程" };
  if (/槽钢/.test(name)) return { categoryId: "metal-channel", catName: "金属材料", projectType: "土建工程" };
  if (/工字钢|h型钢/.test(n)) return { categoryId: "metal-h", catName: "金属材料", projectType: "土建工程" };
  if (/钢管|镀锌管|焊管/.test(name)) return { categoryId: "metal-pipe", catName: "金属材料", projectType: "给排水" };
  if (/ppr|pe管|pvc|波纹管|铸铁管|塑料管/.test(n)) return { categoryId: "pipe-plastic", catName: "管材", projectType: "给排水" };
  if (/阀门|闸阀|蝶阀|球阀|截止阀|止回阀/.test(name)) return { categoryId: "valve-gate", catName: "阀门", projectType: "给排水" };
  if (/电缆|电线|导线/.test(name)) return { categoryId: "cable-power", catName: "电线电缆", projectType: "电气工程" };
  if (/开关|插座/.test(name)) return { categoryId: "switch-socket", catName: "开关/插座", projectType: "电气工程" };
  if (/灯|照明/.test(name)) return { categoryId: "light-led", catName: "灯具/光源", projectType: "电气工程" };
  if (/防水|卷材|涂料.*防水/.test(name)) return { categoryId: "wp-membrane", catName: "防水材料", projectType: "土建工程" };
  if (/保温|岩棉|挤塑|xps|eps/.test(n)) return { categoryId: "thermal-board", catName: "保温耐火", projectType: "暖通工程" };
  if (/涂料|乳胶漆|氟碳|环氧|地坪漆/.test(name)) return { categoryId: "paint-wall", catName: "涂料", projectType: "装饰工程" };
  if (/瓷砖|地砖|抛光砖|玻化砖|大理石|花岗岩/.test(name)) return { categoryId: "decor-tile", catName: "装饰工程", projectType: "装饰工程" };
  if (/地板|木地板/.test(name)) return { categoryId: "decor-wood-floor", catName: "装饰工程", projectType: "装饰工程" };
  if (/门窗|铝合金|幕墙/.test(name)) return { categoryId: "door-alu", catName: "门窗幕墙", projectType: "装饰工程" };
  if (/洁具|坐便|龙头|淋浴|浴缸|洗脸盆/.test(name)) return { categoryId: "sanitary-toilet", catName: "洁具", projectType: "装饰工程" };
  if (/沥青|路缘|步道|井盖/.test(name)) return { categoryId: "muni-asphalt", catName: "市政道路", projectType: "市政工程" };
  if (/苗木|乔木|灌木|花卉|草/.test(name)) return { categoryId: "muni-grid", catName: "园林绿化", projectType: "园林绿化" };
  return { categoryId: "concrete-add", catName: "其它材料", projectType: "其它材料" };
}

// 转换
const records = [];
let dupIdx = 0;
rawData.forEach((row, i) => {
  const cells = row.cells;
  if (!cells || cells.length < 4) return;

  // 找到价格列（最后一个数字列）
  let priceStr = "";
  let priceIdx = -1;
  for (let j = cells.length - 1; j >= 0; j--) {
    if (cells[j] && /^[\d,]+\.?\d*$/.test(cells[j].replace(/[，,]/g, ""))) {
      priceStr = cells[j].replace(/[，,]/g, "");
      priceIdx = j;
      break;
    }
  }
  if (priceIdx === -1 || !priceStr) return;
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) return;

  // 找到单位列（价格前一列）
  const unit = cells[priceIdx - 1] || "元";

  // 材料名称（序号后面的列到单位列之间）
  const nameParts = cells.slice(1, priceIdx - 1).filter(Boolean);
  const fullName = nameParts.join(" ") || cells[1] || "";
  if (!fullName || fullName.length < 2) return;

  // 跳过明显不是材料数据的行
  if (/^(合计|小计|说明|备注|序号|名称|材料|单位|价格)/.test(fullName)) return;
  if (/^\d+$/.test(fullName)) return;

  const { name, spec } = parseMaterialName(fullName);
  const { categoryId, catName, projectType } = matchCategory(name || fullName);

  dupIdx++;
  records.push({
    id: `ip-pdf-${dupIdx}`,
    materialName: name || fullName,
    fullName,
    categoryId,
    categoryName: catName,
    projectType,
    spec,
    unit,
    price,
    region: "南京",
    date: `${latestMeta.year}-${String(latestMeta.month).padStart(2, "0")}`,
    source: sourceLabel,
    sourceType: "信息价",
    isInfoPrice: true,
    publishDate: latestMeta.publishDate,
    pdfUrl: latestMeta.pdfUrl,
  });
});

console.log(`✓ 转换完成: ${records.length} 条信息价价格数据`);
console.log(`\n按分类统计:`);
const catStats = {};
records.forEach((r) => {
  catStats[r.categoryName] = (catStats[r.categoryName] || 0) + 1;
});
Object.entries(catStats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}条`);
});

console.log(`\n前15条示例:`);
records.slice(0, 15).forEach((r, i) => {
  console.log(`  ${i + 1}. [${r.categoryName}] ${r.materialName} | ${r.spec || "-"} | ${r.price}元/${r.unit}`);
});

// 生成TypeScript数据文件
const tsContent = `// ============================================================
// 南京信息价PDF解析 - 材料价格数据
// 数据来源: 南京市二〇${latestMeta.year}年${latestMeta.month}月建设工程材料市场信息价格.pdf
// 解析时间: ${new Date().toISOString().slice(0, 10)}
// 共 ${records.length} 条价格记录
// ============================================================

export interface InfoPriceMaterial {
  id: string;
  materialName: string;
  fullName: string;
  categoryId: string;
  categoryName: string;
  projectType: string;
  spec: string;
  unit: string;
  price: number;
  region: string;
  date: string;
  source: string;
  sourceType: string; // "信息价"
  isInfoPrice: boolean;
  publishDate: string;
  pdfUrl: string;
}

export const infoPriceMaterials: InfoPriceMaterial[] = ${JSON.stringify(records, null, 2)};

// 获取信息价价格数据
export function getInfoPriceMaterials(): InfoPriceMaterial[] {
  return infoPriceMaterials;
}

// 按关键词搜索信息价价格
export function searchInfoPriceMaterials(keyword: string): InfoPriceMaterial[] {
  if (!keyword) return infoPriceMaterials;
  const kw = keyword.toLowerCase().trim();
  return infoPriceMaterials.filter(
    (m) =>
      m.materialName.toLowerCase().includes(kw) ||
      m.fullName.toLowerCase().includes(kw) ||
      m.spec.toLowerCase().includes(kw) ||
      m.categoryName.includes(kw)
  );
}
`;

const outPath = path.join(__dirname, "..", "src", "data", "infoPriceMaterials.ts");
fs.writeFileSync(outPath, tsContent, "utf8");
console.log(`\n✓ 数据文件已生成: ${outPath}`);
