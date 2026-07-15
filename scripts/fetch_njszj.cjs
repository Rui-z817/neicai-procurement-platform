/**
 * 南京市建设工程造价监督站 - 信息价抓取器
 *
 * 数据源：https://www.njszj.cn/ZJWEB/StdCategory.aspx?CategoryID=f55f3e95-167d-4993-b811-3d5327f9ee78
 *
 * 网站特点：
 * - ASP.NET 服务端渲染，HTML 直接在页面中
 * - 列表页：每条信息价有标题、日期、详情页链接
 * - 详情页：包含 PDF 下载直链
 * - 无反爬机制
 *
 * 输出：data/njszj_info_prices.json
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BASE = "https://www.njszj.cn";
const LIST_URL = "/ZJWEB/StdCategory.aspx?CategoryID=f55f3e95-167d-4993-b811-3d5327f9ee78";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, {
      method: options.method || "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        ...(options.headers || {}),
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return resolve(fetch(newUrl, options));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        // 网站用 GB2312/GBK 编码
        const html = buf.toString("utf8");
        resolve({ status: res.statusCode, headers: res.headers, body: html, buffer: buf });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// 解析列表页，提取所有信息价条目
function parseListItems(html) {
  const items = [];
  // 格式1: <a href="/zjweb/MessageShow.aspx?Id=xxx">标题</a> [日期]
  // 格式2: <a href="javascript:popwin('/zjweb/MessageShow.aspx?Id=xxx')">标题</a> [日期]
  const re = /<a[^>]*href="([^"]*MessageShow\.aspx\?Id=[^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    const date = m[3].trim();
    let rawUrl = m[1];

    // 处理 javascript:popwin('/zjweb/MessageShow.aspx?Id=xxx') 格式
    const popwinMatch = rawUrl.match(/popwin\(['"]([^'"]+)['"]\)/);
    if (popwinMatch) {
      rawUrl = popwinMatch[1];
    }

    // 处理 javascript: 开头的其他情况
    if (rawUrl.startsWith("javascript:")) {
      const inner = rawUrl.match(/['"]([^'"]+MessageShow[^'"]+)['"]/);
      if (inner) rawUrl = inner[1];
    }

    const url = rawUrl.startsWith("http") ? rawUrl : BASE + rawUrl;
    if (title.includes("信息价格")) {
      items.push({ title, date, url });
    }
  }

  // 备用正则：匹配 javascript:popwin('...') 格式
  if (items.length === 0) {
    const re2 = /javascript:popwin\(['"]([^'"]+MessageShow\.aspx\?Id=[^'"]+)['"]\)[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?\[([^\]]+)\]/g;
    while ((m = re2.exec(html)) !== null) {
      const title = m[2].replace(/<[^>]+>/g, "").trim();
      const date = m[3].trim();
      const url = m[1].startsWith("http") ? m[1] : BASE + m[1];
      if (title.includes("信息价格")) {
        items.push({ title, date, url });
      }
    }
  }

  return items;
}

// 从详情页提取 PDF 下载链接
function extractPdfLink(html) {
  // PDF 链接格式: href="...MaterialPD/2026/xxx.pdf"
  const re = /href="([^"]*MaterialPD[^"]*\.pdf[^"]*)"/i;
  const m = html.match(re);
  if (m) {
    const url = m[1].startsWith("http") ? m[1] : BASE + m[1];
    return url;
  }

  // 备用：任意 .pdf 链接
  const re2 = /href="([^"]+\.pdf[^"]*)"/i;
  const m2 = html.match(re2);
  if (m2) {
    return m2[1].startsWith("http") ? m2[1] : BASE + m2[1];
  }

  // 再备用：src 中的 PDF
  const re3 = /src="([^"]+\.pdf[^"]*)"/i;
  const m3 = html.match(re3);
  if (m3) {
    return m3[1].startsWith("http") ? m3[1] : BASE + m3[1];
  }

  return null;
}

// 主流程
(async () => {
  try {
    console.log("→ 抓取南京市造价站信息价列表页...");
    console.log("  URL:", BASE + LIST_URL);

    const res = await fetch(BASE + LIST_URL);
    console.log("  HTTP:", res.status, "内容长度:", res.body.length);

    const items = parseListItems(res.body);
    console.log(`\n✓ 共获取 ${items.length} 条信息价条目\n`);

    if (items.length === 0) {
      console.error("✗ 未解析到任何条目，可能页面结构已变更");
      // 保存原始 HTML 供调试
      fs.writeFileSync(path.join(__dirname, "njszj_list_debug.html"), res.body, "utf8");
      process.exit(1);
    }

    // 打印所有条目
    items.forEach((it, i) => {
      console.log(`  ${i + 1}. [${it.date}] ${it.title}`);
      console.log(`     ${it.url}`);
    });

    // 抓取最新一期详情页获取 PDF 链接
    console.log(`\n→ 抓取最新一期详情页: ${items[0].title}`);
    const detailRes = await fetch(items[0].url);
    console.log("  详情页 HTTP:", detailRes.status);

    const pdfUrl = extractPdfLink(detailRes.body);
    if (pdfUrl) {
      items[0].pdfUrl = pdfUrl;
      console.log(`  ✓ PDF链接: ${pdfUrl}`);
    } else {
      console.log("  ✗ 未找到PDF链接，保存详情页供调试");
      fs.writeFileSync(path.join(__dirname, "njszj_detail_debug.html"), detailRes.body, "utf8");
    }

    // 保存结果
    const outPath = path.join(__dirname, "..", "data", "njszj_info_prices.json");
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify({ items, latest: items[0] }, null, 2), "utf8");
    console.log(`\n✓ 结果已保存: ${outPath}`);
    console.log(`  最新一期: ${items[0].title} (${items[0].date})`);
    if (items[0].pdfUrl) {
      console.log(`  PDF: ${items[0].pdfUrl}`);
    }
  } catch (e) {
    console.error("✗ 错误:", e.message);
    process.exit(1);
  }
})();
