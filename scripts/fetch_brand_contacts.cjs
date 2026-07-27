/**
 * 品牌官网联系方式抓取器
 *
 * 从系统已有的供应商官网抓取联系电话和地址信息。
 * 策略：
 * 1. 访问官网首页和 /contact, /about, /lianxi 等常见页面
 * 2. 用正则提取电话号码（400-xxx, 0xx-xxxxxxxx, 手机号等）
 * 3. 提取地址信息
 * 4. 输出JSON供人工审核后导入
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function fetch(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
      timeout,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return resolve(fetch(newUrl, timeout));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode, body: buf.toString("utf8") });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

// 提取电话号码
function extractPhones(html) {
  const phones = new Set();
  // 400 电话：400-xxx-xxxx 或 400xxxxxxx
  const re400 = /4[0-9]{2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g;
  // 区号电话：0xx-xxxxxxxx 或 0xxx-xxxxxxx
  const reLandline = /0\d{2,3}[-\s]?\d{7,8}/g;
  // 手机号：1xx-xxxx-xxxx
  const reMobile = /1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/g;

  for (const re of [re400, reLandline, reMobile]) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const phone = m[0].replace(/\s/g, "");
      // 过滤掉明显不是电话的（如日期、ID等）
      if (phone.length >= 7 && !phone.includes("20" + new Date().getFullYear())) {
        phones.add(phone);
      }
    }
  }
  return [...phones];
}

// 提取地址
function extractAddress(html) {
  const addresses = [];
  // 匹配"地址：xxx"或"地址:xxx"
  const re1 = /地址[：:]\s*([^<\n\r]{5,80})/g;
  // 匹配"公司地址：xxx"
  const re2 = /公司地址[：:]\s*([^<\n\r]{5,80})/g;
  // 匹配"坐落于xxx"或"位于xxx"
  const re3 = /(?:坐落于|位于|地址在)\s*([^<\n\r，。]{5,80})/g;

  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const addr = m[1].trim();
      if (addr.length >= 5 && !addresses.includes(addr)) {
        addresses.push(addr);
      }
    }
  }
  return addresses;
}

// 尝试访问多个可能的联系页面
async function fetchContactPages(baseUrl) {
  const pages = [
    baseUrl,
    baseUrl + "/contact",
    baseUrl + "/contact.html",
    baseUrl + "/about",
    baseUrl + "/about.html",
    baseUrl + "/lianxi",
    baseUrl + "/lxwm",
    baseUrl + "/contactus",
  ];
  const results = [];

  for (const url of pages) {
    try {
      const res = await fetch(url, 10000);
      if (res.status === 200 && res.body.length > 500) {
        const phones = extractPhones(res.body);
        const addresses = extractAddress(res.body);
        if (phones.length > 0 || addresses.length > 0) {
          results.push({ url, phones, addresses });
          break; // 找到联系信息就停止
        }
      }
    } catch (e) {
      // 忽略错误，继续尝试下一个
    }
  }
  return results;
}

// 供应商列表
const suppliers = [
  { id: "s1", name: "东方雨虹", website: "www.yuhong.com.cn" },
  { id: "s3", name: "首钢集团", website: "www.shougang.com.cn" },
  { id: "s4", name: "宝山钢铁", website: "www.baosteel.com" },
  { id: "s5", name: "海螺水泥", website: "www.conch.cn" },
  { id: "s6", name: "华润水泥", website: "www.crcement.com" },
  { id: "s7", name: "金隅集团", website: "www.bbmg.com" },
  { id: "s8", name: "联塑科技", website: "www.liansu.com" },
  { id: "s9", name: "伟星新材", website: "www.weixing.cn" },
  { id: "s10", name: "日丰企业", website: "www.rifeng.com" },
  { id: "s11", name: "远东电缆", website: "www.fareastcable.com" },
  { id: "s13", name: "九牧厨卫", website: "www.jomoo.com" },
  { id: "s14", name: "东鹏控股", website: "www.dongpeng.com" },
  { id: "s15", name: "马可波罗瓷砖", website: "www.monolo.com" },
  { id: "s16", name: "立邦涂料", website: "www.nipponpaint.com.cn" },
  { id: "s17", name: "三棵树涂料", website: "www.skshu.com" },
  { id: "s18", name: "坚朗五金", website: "www.kinlong.com" },
  { id: "s19", name: "中财管道", website: "www.zhongcai.com" },
  { id: "s20", name: "北新建材", website: "www.bnbmg.com" },
  { id: "s21", name: "鞍钢集团", website: "www.ansteelgroup.com" },
  { id: "s22", name: "沙钢集团", website: "www.shaganggroup.com" },
  { id: "s23", name: "华新水泥", website: "www.huaxincem.com" },
  { id: "s25", name: "公牛集团", website: "www.gongniu.cn" },
  { id: "s26", name: "正泰电器", website: "www.chint.com" },
  { id: "s27", name: "德力西电气", website: "www.delixi-electric.com" },
  { id: "s28", name: "雷士照明", website: "www.nvc-lighting.com.cn" },
  { id: "s29", name: "欧普照明", website: "www.opple.com" },
  { id: "s30", name: "佛山照明", website: "www.fsl.com.cn" },
  { id: "s33", name: "格力电器", website: "www.gree.com" },
  { id: "s34", name: "海尔空调", website: "www.haier.com" },
];

// 主流程
(async () => {
  console.log("→ 开始抓取品牌官网联系方式...\n");
  const results = [];

  for (let i = 0; i < suppliers.length; i++) {
    const s = suppliers[i];
    const baseUrl = `https://${s.website}`;
    console.log(`[${i + 1}/${suppliers.length}] ${s.name} (${s.website})...`);

    try {
      const pages = await fetchContactPages(baseUrl);
      if (pages.length > 0) {
        const best = pages[0];
        console.log(`  ✓ 电话: ${best.phones.slice(0, 3).join(", ")}`);
        if (best.addresses.length > 0) {
          console.log(`  ✓ 地址: ${best.addresses[0]}`);
        }
        results.push({
          id: s.id,
          name: s.name,
          website: s.website,
          phones: best.phones,
          addresses: best.addresses,
          sourceUrl: best.url,
        });
      } else {
        console.log(`  ✗ 未找到联系方式`);
        results.push({ id: s.id, name: s.name, website: s.website, phones: [], addresses: [] });
      }
    } catch (e) {
      console.log(`  ✗ 错误: ${e.message}`);
      results.push({ id: s.id, name: s.name, website: s.website, phones: [], addresses: [], error: e.message });
    }

    // 间隔1秒，避免请求过快
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 保存结果
  const outPath = path.join(__dirname, "..", "data", "brand_contacts.json");
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");

  // 统计
  const found = results.filter((r) => r.phones.length > 0);
  console.log(`\n========================================`);
  console.log(`✓ 完成！成功获取 ${found.length}/${suppliers.length} 家联系方式`);
  console.log(`✓ 结果已保存: ${outPath}`);
  console.log(`========================================`);
  console.log("\n找到联系方式的供应商：");
  found.forEach((r) => {
    console.log(`  ${r.name}: ${r.phones[0]}${r.addresses[0] ? " | " + r.addresses[0].slice(0, 40) : ""}`);
  });
})();
