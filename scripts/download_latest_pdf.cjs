/**
 * 下载最新一期南京信息价PDF
 * 从抓取结果JSON中找到最新一期，下载其PDF
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const DATA_DIR = path.join(__dirname, "..", "data");
const JSON_PATH = path.join(DATA_DIR, "njzjxh_info_prices.json");
const PDF_PATH = path.join(DATA_DIR, "latest_info_price.pdf");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, {
      method: options.method || "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "*/*",
        "Referer": "http://www.njzjxh.cn/NECACMS/channels/1117.html",
        ...(options.headers || {}),
      },
      timeout: 60000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith("http") ? res.headers.location : "http://www.njzjxh.cn" + res.headers.location;
        return resolve(fetch(newUrl, options));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error("✗ 找不到抓取结果文件:", JSON_PATH);
    console.error("  请先运行 fetch_njzjxh.cjs");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const items = data.withPdf || data.items || [];

  // 找到最新且有PDF链接的条目
  let latest = null;
  for (const item of items) {
    const pdfUrls = item.pdfUrls || [];
    const realPdf = pdfUrls.find((u) => u.endsWith(".pdf") && u.includes("/upload/"));
    if (realPdf) {
      latest = { ...item, pdfUrl: realPdf };
      break;
    }
  }

  if (!latest) {
    console.error("✗ 未找到含PDF链接的信息价条目");
    process.exit(1);
  }

  console.log(`→ 最新一期: ${latest.title}`);
  console.log(`  发布日期: ${latest.date}`);
  console.log(`  PDF链接: ${latest.pdfUrl}`);

  console.log("→ 下载PDF...");
  const res = await fetch(latest.pdfUrl);
  if (res.status !== 200) {
    console.error(`✗ 下载失败: HTTP ${res.status}`);
    process.exit(1);
  }

  fs.writeFileSync(PDF_PATH, res.body);
  console.log(`✓ PDF已保存: ${PDF_PATH} (${res.body.length} bytes)`);
}

main().catch((e) => {
  console.error("✗ 错误:", e.message);
  process.exit(1);
});
