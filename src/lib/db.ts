/**
 * 数据层 - 支持 CloudBase 和 IndexedDB 双后端
 *
 * 策略：
 * 1. 优先尝试 CloudBase（云端存储，可多设备共享）
 * 2. 失败时自动降级到 IndexedDB（本地存储，免费）
 * 3. 后续可切换到轻量服务器
 */

import { openDB, type IDBPDatabase } from "idb";

export type StorageBackend = "cloudbase" | "indexeddb";

// ============ 类型定义 ============

export interface InternalPrice {
  id: string;
  materialName: string;
  spec: string;
  brand: string;
  supplier: string;
  price: number;
  unit: string;
  region: string;
  inquiryDate: string;
  projectType: string;
  notes: string;
  fileId: string | null;
  fileName: string | null;
  createdAt: number;
}

export interface StoredFile {
  id: string;
  name: string;
  type: "pdf" | "excel" | "image" | "other";
  mimeType: string;
  size: number;
  blob?: Blob;
  cloudPath?: string;
  uploadedAt: number;
  parsedText: string | null;
}

export function getFileType(
  fileName: string,
  mimeType: string
): StoredFile["type"] {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (
    ["xls", "xlsx", "csv"].includes(ext) ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  )
    return "excel";
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) ||
    mimeType.startsWith("image/")
  )
    return "image";
  return "other";
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============ 后端选择 ============

let activeBackend: StorageBackend = "indexeddb";
let cloudbaseApp: any = null;
let cloudbaseDb: any = null;
let cloudbaseAuthReady = false;
let idbInstance: IDBPDatabase | null = null;

const ENV_ID = "procurement-d4gvcntzd8b00b0a6";

async function initCloudBase(): Promise<boolean> {
  if (cloudbaseApp) return true;
  try {
    const cloudbase = await import("@cloudbase/js-sdk");
    cloudbaseApp = cloudbase.default.init({ env: ENV_ID });
    cloudbaseDb = cloudbaseApp.database();
    // 测试连接：尝试匿名登录
    const auth = cloudbaseApp.auth();
    await Promise.race([
      auth.signInAnonymously(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000)),
    ]);
    cloudbaseAuthReady = true;
    return true;
  } catch (e) {
    console.warn("CloudBase 不可用，降级到 IndexedDB:", e);
    cloudbaseApp = null;
    cloudbaseDb = null;
    return false;
  }
}

async function getIDB(): Promise<IDBPDatabase> {
  if (idbInstance) return idbInstance;
  idbInstance = await openDB("procurement-internal", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("prices")) {
        const priceStore = db.createObjectStore("prices", { keyPath: "id" });
        priceStore.createIndex("by-date", "inquiryDate");
        priceStore.createIndex("by-material", "materialName");
        priceStore.createIndex("by-brand", "brand");
      }
      if (!db.objectStoreNames.contains("files")) {
        const fileStore = db.createObjectStore("files", { keyPath: "id" });
        fileStore.createIndex("by-upload-date", "uploadedAt");
      }
    },
  });
  return idbInstance;
}

async function ensureBackend(): Promise<StorageBackend> {
  if (activeBackend === "cloudbase") return "cloudbase";
  // 尝试 CloudBase，超时则降级
  const ok = await initCloudBase();
  activeBackend = ok ? "cloudbase" : "indexeddb";
  return activeBackend;
}

/** 主动探测后端状态（不切换，只检测） */
export async function detectBackend(): Promise<StorageBackend> {
  return ensureBackend();
}

/** 获取当前后端 */
export function getCurrentBackend(): StorageBackend {
  return activeBackend;
}

// ============ 文件存储 API ============

export async function saveFile(
  file: File,
  parsedText: string | null = null
): Promise<StoredFile> {
  const backend = await ensureBackend();
  const id = genId();
  const type = getFileType(file.name, file.type);

  if (backend === "cloudbase") {
    try {
      const cloudPath = `inquiry-files/${id}-${file.name}`;
      const result = await Promise.race([
        cloudbaseApp.uploadFile({ cloudPath, filePath: file }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("upload timeout")), 15000)),
      ]);
      const stored: StoredFile = {
        id,
        name: file.name,
        type,
        mimeType: file.type,
        size: file.size,
        cloudPath: result.fileID,
        uploadedAt: Date.now(),
        parsedText,
      };
      await cloudbaseDb.collection("files").add(stored);
      return stored;
    } catch (e) {
      console.warn("CloudBase 文件上传失败，降级到 IndexedDB:", e);
      activeBackend = "indexeddb";
      return saveFile(file, parsedText);
    }
  }

  // IndexedDB
  const db = await getIDB();
  const stored: StoredFile = {
    id,
    name: file.name,
    type,
    mimeType: file.type,
    size: file.size,
    blob: file,
    uploadedAt: Date.now(),
    parsedText,
  };
  await db.put("files", stored);
  return stored;
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      const res = await cloudbaseDb.collection("files").where({ id }).limit(1).get();
      return res.data[0] as StoredFile | undefined;
    } catch {
      // 降级
    }
  }
  const db = await getIDB();
  return db.get("files", id);
}

export async function getFileURL(stored: StoredFile): Promise<string> {
  if (stored.cloudPath) {
    const res = await cloudbaseApp.getTempFileURL({ fileList: [stored.cloudPath] });
    return res.fileList[0]?.tempFileURL || "";
  }
  if (stored.blob) {
    return URL.createObjectURL(stored.blob);
  }
  return "";
}

export async function getAllFiles(): Promise<StoredFile[]> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      const res = await cloudbaseDb
        .collection("files")
        .orderBy("uploadedAt", "desc")
        .limit(1000)
        .get();
      return res.data as StoredFile[];
    } catch {
      // 降级
    }
  }
  const db = await getIDB();
  return (await db.getAll("files")).sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export async function deleteFile(id: string): Promise<void> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      const file = await getFile(id);
      if (file?.cloudPath) {
        await cloudbaseApp.deleteFile({ fileList: [file.cloudPath] }).catch(() => {});
      }
      await cloudbaseDb.collection("files").where({ id }).remove();
      return;
    } catch {
      // 降级
    }
  }
  const db = await getIDB();
  await db.delete("files", id);
}

export async function getStorageUsage(): Promise<{
  fileCount: number;
  totalSize: number;
}> {
  const files = await getAllFiles();
  return {
    fileCount: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
  };
}

// ============ 价格记录 API ============

export async function savePrice(
  price: Omit<InternalPrice, "id" | "createdAt">
): Promise<InternalPrice> {
  const record: InternalPrice = { ...price, id: genId(), createdAt: Date.now() };
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      await cloudbaseDb.collection("prices").add(record);
      return record;
    } catch {
      activeBackend = "indexeddb";
    }
  }
  const db = await getIDB();
  await db.put("prices", record);
  return record;
}

export async function batchSavePrices(
  prices: Array<Omit<InternalPrice, "id" | "createdAt">>
): Promise<number> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      for (const p of prices) {
        const record: InternalPrice = { ...p, id: genId(), createdAt: Date.now() };
        await cloudbaseDb.collection("prices").add(record);
      }
      return prices.length;
    } catch {
      activeBackend = "indexeddb";
    }
  }
  const db = await getIDB();
  const tx = db.transaction("prices", "readwrite");
  for (const p of prices) {
    const record: InternalPrice = { ...p, id: genId(), createdAt: Date.now() };
    await tx.store.put(record);
  }
  await tx.done;
  return prices.length;
}

export async function getAllPrices(): Promise<InternalPrice[]> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      const res = await cloudbaseDb
        .collection("prices")
        .orderBy("createdAt", "desc")
        .limit(1000)
        .get();
      return res.data as InternalPrice[];
    } catch {
      activeBackend = "indexeddb";
    }
  }
  const db = await getIDB();
  const all = await db.getAll("prices");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePrice(id: string): Promise<void> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      await cloudbaseDb.collection("prices").where({ id }).remove();
      return;
    } catch {
      activeBackend = "indexeddb";
    }
  }
  const db = await getIDB();
  await db.delete("prices", id);
}

export async function searchPrices(keyword: string): Promise<InternalPrice[]> {
  const all = await getAllPrices();
  if (!keyword.trim()) return all;
  const kw = keyword.toLowerCase().trim();
  return all.filter(
    (p) =>
      p.materialName.toLowerCase().includes(kw) ||
      p.brand.toLowerCase().includes(kw) ||
      p.supplier.toLowerCase().includes(kw) ||
      p.spec.toLowerCase().includes(kw)
  );
}

// ============ 数据导出 ============

export async function exportAllData(): Promise<Blob> {
  const prices = await getAllPrices();
  const files = await getAllFiles();
  const filesMeta = files.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    mimeType: f.mimeType,
    size: f.size,
    uploadedAt: f.uploadedAt,
    parsedText: f.parsedText,
  }));
  return new Blob(
    [JSON.stringify({ prices, files: filesMeta, exportDate: new Date().toISOString() }, null, 2)],
    { type: "application/json" }
  );
}

export async function clearAllData(): Promise<void> {
  const backend = await ensureBackend();
  if (backend === "cloudbase") {
    try {
      await cloudbaseDb.collection("prices").where({}).remove();
      await cloudbaseDb.collection("files").where({}).remove();
      return;
    } catch {
      activeBackend = "indexeddb";
    }
  }
  const db = await getIDB();
  await db.clear("prices");
  await db.clear("files");
}
