import type { HistoryRecord, SearchParams, MarketPrice } from "@/types";

const STORAGE_KEY = "xunjia_history_v1";
const MAX_RECORDS = 200;

// 读取所有历史记录
export function getHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryRecord[];
    return arr.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

// 添加一条历史记录
export function addHistory(
  params: SearchParams,
  resultCount: number,
  results?: MarketPrice[]
): HistoryRecord {
  const history = getHistory();
  const record: HistoryRecord = {
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    keyword: params.keyword,
    filters: {
      category: params.category,
      region: params.region,
      brand: params.brand,
    },
    resultCount,
    timestamp: Date.now(),
    results: results ? results.slice(0, 50) : undefined, // 最多保存50条快照
  };
  history.unshift(record);
  // 限制最大数量
  const trimmed = history.slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return record;
}

// 删除单条记录
export function deleteHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 清空所有记录
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 格式化时间
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
