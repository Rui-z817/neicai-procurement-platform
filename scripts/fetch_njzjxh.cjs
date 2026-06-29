/**
 * 南京造价协会信息价抓取器
 *
 * 该网站(njzjxh.cn)使用 SiteServer CMS，页面内容通过 AJAX 动态加载：
 *   POST /api/sys/stl/actions/dynamic
 *   body: { siteId, pageChannelId, templateContent(加密), ... }
 * 返回 { html: "..." }
 *
 * 本脚本：
 * 1. 抓取 channels/1117.html 获取 templateContent 等参数
 * 2. POST 动态 API 获取真实 HTML
 * 3. 解析出信息价条目（标题、日期、链接）
 * 4. 跟踪链接到详情页，提取 PDF 下载地址
 * 5. 输出 JSON 结果
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BASE = "http://www.njzjxh.cn";
const LIST_URL = "/NECACMS/channels/1117.html";
const API_URL = "/api/sys/stl/actions/dynamic";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, {
      method: options.method || "GET",
      headers: {
        "User-Agent": UA,
        "Accept": options.accept || "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        ...(options.headers || {}),
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith("http") ? res.headers.location : BASE + res.headers.location;
        return resolve(fetch(newUrl, options));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, body: buf.toString("utf8") });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// 1. 抓取列表页，提取 stl 动态参数
async function fetchListPage() {
  console.log("→ 抓取列表页:", BASE + LIST_URL);
  const res = await fetch(BASE + LIST_URL);
  const html = res.body;

  // 提取 siteId, pageChannelId, pageTemplateId, pageUrl, templateContent
  const siteId = (html.match(/siteId:\s*(\d+)/) || [])[1];
  const pageChannelId = (html.match(/pageChannelId:\s*(\d+)/) || [])[1];
  const pageContentId = (html.match(/pageContentId:\s*(\d+)/) || [])[1];
  const pageTemplateId = (html.match(/pageTemplateId:\s*(\d+)/) || [])[1];
  const pageUrl = (html.match(/pageUrl:\s*'([^']+)'/) || [])[1];
  const ajaxDivId = (html.match(/ajaxDivId:\s*'([^']+)'/) || [])[1];
  // templateContent 是单引号包裹的长字符串
  const templateContent = (html.match(/templateContent:\s*'([^']+)'/) || [])[1];

  console.log("  siteId:", siteId, "pageChannelId:", pageChannelId);
  console.log("  templateContent 长度:", templateContent ? templateContent.length : 0);

  return { siteId, pageChannelId, pageContentId, pageTemplateId, pageUrl, ajaxDivId, templateContent };
}

// 2. POST 动态 API 获取真实 HTML
async function fetchDynamicHtml(params, pageNum = 0) {
  // SiteServer CMS 的 stlClient.post 发送 JSON body
  const payload = {
    siteId: parseInt(params.siteId),
    pageChannelId: parseInt(params.pageChannelId),
    pageContentId: parseInt(params.pageContentId || "0"),
    pageTemplateId: parseInt(params.pageTemplateId),
    isPageRefresh: false,
    pageUrl: params.pageUrl,
    ajaxDivId: params.ajaxDivId,
    templateContent: params.templateContent,
  };
  if (pageNum > 0) payload.pageNum = pageNum;

  const bodyStr = JSON.stringify(payload);

  console.log("→ POST 动态 API (pageNum=" + pageNum + ")");
  const res = await fetch(BASE + API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": BASE + LIST_URL,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: bodyStr,
  });

  // 调试：保存原始响应
  if (pageNum === 0) {
    fs.writeFileSync(path.join(__dirname, "njzjxh_api_raw_response.txt"), res.body, "utf8");
    console.log("  [调试] 原始响应长度:", res.body.length, "HTTP:", res.status);
    console.log("  [调试] 响应前500字:", res.body.slice(0, 500));
  }

  try {
    const json = JSON.parse(res.body);
    return json.html || "";
  } catch (e) {
    console.error("  JSON 解析失败:", e.message);
    return "";
  }
}

// 3. 解析信息价列表条目
function parseListItems(html) {
  const items = [];
  // 实际格式: <li><a href="/NECACMS/contents/1117/xxxx.html">标题</a><em class="time">日期</em></li>
  const re = /<a[^>]*href="(\/NECACMS\/contents\/\d+\/[^"]+\.html)"[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?<em[^>]*class="time"[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/em>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    items.push({
      url: BASE + m[1],
      title,
      date: m[3],
    });
  }
  return items;
}

// 4. 抓取详情页，提取 PDF 下载链接
let allItemsRef = [];

// 从详情页HTML中提取AJAX参数
function extractDetailParams(html) {
  const siteId = (html.match(/siteId:\s*(\d+)/) || [])[1];
  const pageChannelId = (html.match(/pageChannelId:\s*(\d+)/) || [])[1];
  const pageContentId = (html.match(/pageContentId:\s*(\d+)/) || [])[1];
  const pageTemplateId = (html.match(/pageTemplateId:\s*(\d+)/) || [])[1];
  const pageUrl = (html.match(/pageUrl:\s*'([^']+)'/) || [])[1];
  const ajaxDivId = (html.match(/ajaxDivId:\s*'([^']+)'/) || [])[1];
  const templateContent = (html.match(/templateContent:\s*'([^']+)'/) || [])[1];
  return { siteId, pageChannelId, pageContentId, pageTemplateId, pageUrl, ajaxDivId, templateContent };
}

// 从详情页真实HTML中提取PDF/附件链接
function extractPdfLinks(html) {
  const found = new Set();
  let m;

  // .pdf 直接链接
  const pdfRe = /href="([^"]+\.pdf)"/gi;
  while ((m = pdfRe.exec(html)) !== null) {
    found.add(m[1].startsWith("http") ? m[1] : BASE + m[1]);
  }

  // src/href 中的附件链接
  const attachRe = /(?:href|src)="([^"]*(?:sitefiles|upload|attachments|download|file)[^"]*)"/gi;
  while ((m = attachRe.exec(html)) !== null) {
    found.add(m[1].startsWith("http") ? m[1] : BASE + m[1]);
  }

  // 带"下载"文字的链接
  const dlRe = /<a[^>]*href="([^"]+)"[^>]*>[^<]*(?:下载|PDF|附件|点击查看|点击下载)[^<]*<\/a>/gi;
  while ((m = dlRe.exec(html)) !== null) {
    found.add(m[1].startsWith("http") ? m[1] : BASE + m[1]);
  }

  // 任意 .pdf 结尾的URL（含在JS中）
  const jsPdfRe = /['"]([^'"]+\.pdf)['"]/gi;
  while ((m = jsPdfRe.exec(html)) !== null) {
    found.add(m[1].startsWith("http") ? m[1] : BASE + m[1]);
  }

  // 内容区所有链接（兜底，排除导航）
  if (found.size === 0) {
    const allRe = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((m = allRe.exec(html)) !== null) {
      const url = m[1];
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (/下载|PDF|附件|查看|download/i.test(text) || /\.pdf/i.test(url)) {
        if (!url.startsWith("javascript") && !url.startsWith("#")) {
          found.add(url.startsWith("http") ? url : BASE + url);
        }
      }
    }
  }

  return [...found];
}

async function fetchDetailPdfUrl(item) {
  try {
    // 第一步：抓详情页外壳，提取AJAX参数
    const res1 = await fetch(item.url, { headers: { "Referer": BASE + LIST_URL } });
    const outerHtml = res1.body;
    const params = extractDetailParams(outerHtml);

    if (!params.templateContent) {
      return { ...item, pdfUrls: [], error: "无法提取详情页AJAX参数" };
    }

    // 第二步：POST AJAX获取真实内容
    const payload = {
      siteId: parseInt(params.siteId),
      pageChannelId: parseInt(params.pageChannelId),
      pageContentId: parseInt(params.pageContentId),
      pageTemplateId: parseInt(params.pageTemplateId),
      isPageRefresh: false,
      pageUrl: params.pageUrl,
      ajaxDivId: params.ajaxDivId,
      templateContent: params.templateContent,
    };

    const res2 = await fetch(BASE + API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": item.url,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(payload),
    });

    let innerHtml = "";
    try {
      const json = JSON.parse(res2.body);
      innerHtml = json.html || "";
    } catch (e) {
      return { ...item, pdfUrls: [], error: "详情页AJAX返回解析失败" };
    }

    // 调试：保存第一个详情页真实内容
    if (item === allItemsRef[0]) {
      fs.writeFileSync(path.join(__dirname, "njzjxh_detail_inner_sample.html"), innerHtml, "utf8");
      console.log(`     [调试] 详情页真实内容长度: ${innerHtml.length}`);
      console.log(`     [调试] 前600字: ${innerHtml.slice(0, 600)}`);
    }

    const pdfUrls = extractPdfLinks(innerHtml);
    return { ...item, pdfUrls, innerHtmlSnippet: innerHtml.slice(0, 200) };
  } catch (e) {
    return { ...item, pdfUrls: [], error: e.message };
  }
}

// 主流程
(async () => {
  try {
    const params = await fetchListPage();
    if (!params.templateContent) {
      console.error("✗ 未能提取 templateContent");
      process.exit(1);
    }

    // 抓取所有页（每页15条，去重）
    const allItems = [];
    const seenUrls = new Set();
    for (let p = 1; p <= 10; p++) {
      // SiteServer 的 pageNum 从1开始
      const payload2 = {
        siteId: parseInt(params.siteId),
        pageChannelId: parseInt(params.pageChannelId),
        pageContentId: 0,
        pageTemplateId: parseInt(params.pageTemplateId),
        isPageRefresh: false,
        pageUrl: params.pageUrl,
        ajaxDivId: params.ajaxDivId,
        templateContent: params.templateContent,
        pageNum: p,
      };
      const bodyStr2 = JSON.stringify(payload2);
      const res2 = await fetch(BASE + API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Referer": BASE + LIST_URL,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: bodyStr2,
      });
      let html2 = "";
      try { html2 = JSON.parse(res2.body).html || ""; } catch (e) { break; }

      // 保存第一页用于调试分页结构
      if (p === 1) {
        fs.writeFileSync(path.join(__dirname, "njzjxh_page1_check.html"), html2, "utf8");
      }

      const items = parseListItems(html2);
      console.log(`  第${p}页解析到 ${items.length} 条`);
      if (items.length === 0) break;
      let newCount = 0;
      items.forEach((it) => {
        if (!seenUrls.has(it.url)) {
          seenUrls.add(it.url);
          allItems.push(it);
          newCount++;
        }
      });
      if (newCount === 0) { console.log("  无新条目，停止"); break; }
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`\n✓ 共获取 ${allItems.length} 条信息价条目\n`);
    console.log("全部条目:");
    allItems.forEach((it, i) => {
      console.log(`  ${i + 1}. [${it.date}] ${it.title}`);
      console.log(`     ${it.url}`);
    });

    // 抓取全部详情页的PDF链接
    console.log(`\n→ 抓取全部 ${allItems.length} 条详情页的PDF链接:`);
    allItemsRef = allItems;
    const withPdf = [];
    for (let i = 0; i < allItems.length; i++) {
      const detail = await fetchDetailPdfUrl(allItems[i]);
      if ((i + 1) % 10 === 0 || i === allItems.length - 1) {
        console.log(`  进度: ${i + 1}/${allItems.length} (有PDF: ${detail.pdfUrls.length > 0 ? "✓" : "✗"})`);
      }
      withPdf.push(detail);
      await new Promise((r) => setTimeout(r, 500));
    }
    const pdfCount = withPdf.filter((d) => d.pdfUrls.length > 0).length;
    console.log(`  ✓ 共 ${pdfCount}/${withPdf.length} 条找到PDF链接`);

    // 保存完整结果（含PDF链接）
    const outPath = path.join(__dirname, "..", "data", "njzjxh_info_prices.json");
    fs.writeFileSync(outPath, JSON.stringify({ items: allItems, withPdf }, null, 2), "utf8");
    console.log(`\n✓ 完整结果已保存: ${outPath}`);
  } catch (e) {
    console.error("✗ 错误:", e.message);
    process.exit(1);
  }
})();
