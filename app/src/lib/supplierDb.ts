/**
 * 供应商数据层 - 支持内置数据 + 用户自定义编辑
 *
 * 策略：
 * 1. 内置数据来自 materials.ts（只读）
 * 2. 用户编辑/新增的供应商存入 IndexedDB
 * 3. 合并显示：内置数据 + 用户覆盖
 */

import { openDB, type IDBPDatabase } from "idb";
import { suppliers as builtInSuppliers } from "@/data/materials";
import type { Supplier } from "@/types";

// 用户覆盖/新增的供应商数据
export interface SupplierOverride {
  id: string; // 对应内置供应商ID，或自定义ID
  contact?: string; // 联系电话
  address?: string; // 详细地址
  region?: string; // 所在地
  brand?: string; // 品牌
  mainProducts?: string[]; // 主营材料
  level?: string; // 供应商等级
  website?: string; // 官网
  name?: string; // 供应商名称（可修改）
  isCustom?: boolean; // 是否用户新增
  updatedAt: number;
}

interface SupplierDBSchema {
  overrides: {
    key: string;
    value: SupplierOverride;
  };
}

let dbInstance: IDBPDatabase<SupplierDBSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<SupplierDBSchema>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<SupplierDBSchema>("procurement-suppliers", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("overrides")) {
        db.createObjectStore("overrides", { keyPath: "id" });
      }
    },
  });
  return dbInstance;
}

// 保存/更新供应商信息
export async function saveSupplierOverride(override: SupplierOverride): Promise<void> {
  const db = await getDB();
  await db.put("overrides", { ...override, updatedAt: Date.now() });
}

// 批量保存
export async function batchSaveOverrides(overrides: SupplierOverride[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("overrides", "readwrite");
  for (const o of overrides) {
    await tx.store.put({ ...o, updatedAt: Date.now() });
  }
  await tx.done;
}

// 获取所有覆盖数据
export async function getAllOverrides(): Promise<SupplierOverride[]> {
  const db = await getDB();
  return db.getAll("overrides");
}

// 获取单个覆盖数据
export async function getOverride(id: string): Promise<SupplierOverride | undefined> {
  const db = await getDB();
  return db.get("overrides", id);
}

// 删除覆盖（恢复为内置数据）
export async function deleteOverride(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("overrides", id);
}

// 合并内置数据 + 用户覆盖
export async function getMergedSuppliers(): Promise<Supplier[]> {
  const overrides = await getAllOverrides();
  const overrideMap = new Map(overrides.map((o) => [o.id, o]));

  // 合并：内置数据 + 覆盖
  const merged = builtInSuppliers.map((s) => {
    const ov = overrideMap.get(s.id);
    if (!ov) return s;
    return {
      ...s,
      contact: ov.contact ?? s.contact,
      address: ov.address ?? s.address,
      region: ov.region ?? s.region,
      brand: ov.brand ?? s.brand,
      mainProducts: ov.mainProducts ?? s.mainProducts,
      level: ov.level ?? s.level,
      website: ov.website ?? s.website,
      name: ov.name ?? s.name,
    };
  });

  // 添加用户新增的自定义供应商
  const customOverrides = overrides.filter((o) => o.isCustom && !builtInSuppliers.some((s) => s.id === o.id));
  for (const co of customOverrides) {
    merged.push({
      id: co.id,
      name: co.name || "未命名供应商",
      region: co.region || "",
      contact: co.contact || "",
      level: co.level || "C级",
      address: co.address,
      mainProducts: co.mainProducts,
      brand: co.brand,
      website: co.website,
      source: "用户添加",
    });
  }

  return merged;
}

// 生成新ID
export function genSupplierId(): string {
  return "custom-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
