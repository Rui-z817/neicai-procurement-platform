/**
 * 下载最新一期南京信息价PDF
 *
 * 从 njszj.cn 抓取结果中找到最新一期，下载其PDF
 *
 * 数据源JSON：data/njszj_info_prices.json
 * 输出文件：data/latest_info_price.pdf
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const DATA_DIR = path.join(__dirname, "..", "data");
// 新的数据源JSON（从njszj.cn抓取）
const NEW_JSON = path.join(DATA_DIR, "njszj_info_prices.json");
// 旧的（兼容）
const OLD_JSON = path.join(DATA_DIR, "njzjxh_info_prices.json");
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
        "Referer": "https://www.njszj.cn/zjweb/Default.aspx",
        ...(options.headers || {}),
      },
      timeout: 120000,
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
        resolve({
          status: res.statusCode,
          headers: res.headers,
          buffer: Buffer.concat(chunks),
        });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function downloadPdf(url) {
  console.log("→ 下载PDF:", url);
  const res = await fetch(url);
  console.log("  HTTP:", res.status, "大小:", (res.buffer.length / 1024 / 1024).toFixed(2), "MB");

  if (res.status !== 200) {
    throw new Error(`下载失败 HTTP ${res.status}`);
  }

  // 验证是PDF
  const header = res.buffer.slice(0, 4).toString("hex");
  if (header !== "25504446") {
    console.warn("  ⚠️ 文件头不是PDF:", header);
  }

  fs.writeFileSync(PDF_PATH, res.buffer);
  console.log("  ✓ 已保存:", PDF_PATH);
  return PDF_PATH;
}

(async () => {
  try {
    // 优先使用新的数据源
    let data = null;
    if (fs.existsSync(NEW_JSON)) {
      data = JSON.parse(fs.readFileSync(NEW_JSON, "utf8"));
      console.log("→ 使用新数据源: njszj_info_prices.json");
    } else if (fs.existsSync(OLD_JSON)) {
      data = JSON.parse(fs.readFileSync(OLD_JSON, "utf8"));
      console.log("→ 使用旧数据源: njzjxh_info_prices.json");
    } else {
      console.error("✗ 未找到信息价数据JSON文件");
      process.exit(1);
    }

    // 找最新一期的PDF链接
    let pdfUrl = null;
    let title = "";

    // 新格式：data.latest.pdfUrl 或 data.items[0].pdfUrl
    if (data.latest?.pdfUrl) {
      pdfUrl = data.latest.pdfUrl;
      title = data.latest.title;
    } else if (data.items?.[0]?.pdfUrl) {
      pdfUrl = data.items[0].pdfUrl;
      title = data.items[0].title;
    } else if (data.withPdf) {
      // 旧格式
      const withPdf = data.withPdf.find((d) => d.pdfUrls && d.pdfUrls.length > 0);
      if (withPdf) {
        pdfUrl = withPdf.pdfUrls[0];
        title = withPdf.title;
      }
    }

    if (!pdfUrl) {
      console.error("✗ 未找到PDF下载链接");
      process.exit(1);
    }

    console.log(`→ 最新一期: ${title}`);
    await downloadPdf(pdfUrl);
    console.log("\n✓ 下载完成！");
  } catch (e) {
    console.error("✗ 错误:", e.message);
    process.exit(1);
  }
})();
