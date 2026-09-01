/**
 * 内部价格 API 服务
 * 运行在轻量服务器上，提供价格记录和文件上传的 CRUD 接口
 *
 * 数据存储：SQLite
 * 文件存储：/var/www/uploads/
 */

const express = require("express");
const multer = require("multer");
const { DatabaseSync } = require("node:sqlite"); // Node 22 内置，无需原生编译
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ============ 初始化 ============

const DB_PATH = "/var/www/neicai-api/data.db";
const UPLOAD_DIR = "/var/www/uploads";

// 确保目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 初始化数据库
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS prices (
    id TEXT PRIMARY KEY,
    materialName TEXT NOT NULL,
    spec TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    supplier TEXT DEFAULT '',
    price REAL DEFAULT 0,
    unit TEXT DEFAULT '',
    region TEXT DEFAULT '',
    inquiryDate TEXT DEFAULT '',
    projectType TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    fileId TEXT,
    fileName TEXT,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'other',
    mimeType TEXT DEFAULT '',
    size INTEGER DEFAULT 0,
    filePath TEXT NOT NULL,
    uploadedAt INTEGER,
    parsedText TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_prices_created ON prices(createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_prices_material ON prices(materialName);
  CREATE INDEX IF NOT EXISTS idx_files_uploaded ON files(uploadedAt DESC);
`);

// 中间件
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, id + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ============ 工具函数 ============

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getFileType(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  return "other";
}

// ============ API 路由 ============

// --- 健康检查 ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --- 价格记录 ---

// 获取所有价格
app.get("/api/prices", (req, res) => {
  const keyword = req.query.keyword;
  let rows;
  if (keyword) {
    const kw = `%${keyword}%`;
    rows = db.prepare(
      `SELECT * FROM prices WHERE materialName LIKE ? OR brand LIKE ? OR supplier LIKE ? OR spec LIKE ? ORDER BY createdAt DESC LIMIT 1000`
    ).all(kw, kw, kw, kw);
  } else {
    rows = db.prepare(`SELECT * FROM prices ORDER BY createdAt DESC LIMIT 1000`).all();
  }
  res.json(rows);
});

// 新增单条价格
app.post("/api/prices", (req, res) => {
  const p = req.body;
  const id = p.id || genId();
  db.prepare(`
    INSERT INTO prices (id, materialName, spec, brand, supplier, price, unit, region, inquiryDate, projectType, notes, fileId, fileName, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, p.materialName || "", p.spec || "", p.brand || "", p.supplier || "",
    p.price || 0, p.unit || "", p.region || "", p.inquiryDate || "",
    p.projectType || "", p.notes || "", p.fileId || null, p.fileName || null,
    Date.now()
  );
  res.json({ id, ...p, createdAt: Date.now() });
});

// 批量新增价格
app.post("/api/prices/batch", (req, res) => {
  const prices = req.body;
  if (!Array.isArray(prices)) return res.status(400).json({ error: "expected array" });

  const stmt = db.prepare(`
    INSERT INTO prices (id, materialName, spec, brand, supplier, price, unit, region, inquiryDate, projectType, notes, fileId, fileName, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // node:sqlite 没有 better-sqlite3 的 db.transaction()，改用标准 SQL 事务
  db.exec("BEGIN");
  try {
    for (const p of prices) {
      stmt.run(
        genId(), p.materialName || "", p.spec || "", p.brand || "", p.supplier || "",
        p.price || 0, p.unit || "", p.region || "", p.inquiryDate || "",
        p.projectType || "", p.notes || "", p.fileId || null, p.fileName || null,
        Date.now()
      );
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: String(e) });
  }

  res.json({ saved: prices.length });
});

// 删除价格
app.delete("/api/prices/:id", (req, res) => {
  db.prepare("DELETE FROM prices WHERE id = ?").run(req.params.id);
  res.json({ deleted: true });
});

// --- 文件上传 ---

// 上传文件
app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "no file" });

  const id = genId();
  const filePath = req.file.filename;
  // multer 以 latin1 传递 originalname，转回 UTF-8 修复中文文件名乱码
  const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");
  const stored = {
    id,
    name: originalName,
    type: getFileType(originalName),
    mimeType: req.file.mimetype,
    size: req.file.size,
    filePath,
    uploadedAt: Date.now(),
    parsedText: req.body.parsedText || null,
  };

  db.prepare(`
    INSERT INTO files (id, name, type, mimeType, size, filePath, uploadedAt, parsedText)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    stored.id, stored.name, stored.type, stored.mimeType, stored.size,
    stored.filePath, stored.uploadedAt, stored.parsedText
  );

  res.json(stored);
});

// 获取文件列表
app.get("/api/files", (req, res) => {
  const rows = db.prepare("SELECT id, name, type, mimeType, size, filePath, uploadedAt, parsedText FROM files ORDER BY uploadedAt DESC LIMIT 1000").all();
  res.json(rows);
});

// 获取单个文件信息
app.get("/api/files/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM files WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(row);
});

// 下载/预览文件
app.get("/api/files/:id/download", (req, res) => {
  const row = db.prepare("SELECT * FROM files WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  const fullPath = path.join(UPLOAD_DIR, row.filePath);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: "file missing" });
  res.setHeader("Content-Type", row.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(row.name)}"`);
  fs.createReadStream(fullPath).pipe(res);
});

// 删除文件（?withPrices=1 时连同关联价格记录一并删除，需密码校验）
const DELETE_PASSWORD = "123456";

app.delete("/api/files/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM files WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });

  const withPrices = req.query.withPrices === "1";
  if (withPrices && req.headers["x-delete-password"] !== DELETE_PASSWORD) {
    return res.status(403).json({ error: "删除密码错误" });
  }

  db.exec("BEGIN");
  try {
    let priceDeleted = 0;
    if (withPrices) {
      priceDeleted = db.prepare("DELETE FROM prices WHERE fileId = ?").run(req.params.id).changes;
    }
    // 删除物理文件
    const fullPath = path.join(UPLOAD_DIR, row.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    // 删除数据库记录
    db.prepare("DELETE FROM files WHERE id = ?").run(req.params.id);
    db.exec("COMMIT");
    res.json({ deleted: true, priceDeleted });
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: String(e) });
  }
});

// --- 统计 ---

app.get("/api/stats", (req, res) => {
  const priceCount = db.prepare("SELECT COUNT(*) as count FROM prices").get().count;
  const fileCount = db.prepare("SELECT COUNT(*) as count FROM files").get().count;
  const totalSize = db.prepare("SELECT COALESCE(SUM(size), 0) as total FROM files").get().total;
  res.json({ priceCount, fileCount, totalSize });
});

// --- 导出备份 ---
app.get("/api/export", (req, res) => {
  const prices = db.prepare("SELECT * FROM prices ORDER BY createdAt DESC").all();
  const files = db.prepare("SELECT id, name, type, mimeType, size, uploadedAt, parsedText FROM files ORDER BY uploadedAt DESC").all();
  res.json({ prices, files, exportDate: new Date().toISOString() });
});

// ============ 启动服务 ============

app.listen(PORT, "127.0.0.1", () => {
  console.log(`✓ API 服务已启动: http://127.0.0.1:${PORT}`);
  console.log(`  数据库: ${DB_PATH}`);
  console.log(`  上传目录: ${UPLOAD_DIR}`);
});
