/**
 * API 配置中心
 *
 * 通过修改 USE_REAL_API 为 true 并填写 BASE_URL，即可将系统从内置模拟数据
 * 切换为对接真实的广材网(gldjc.com)或其他建材价格数据接口。
 *
 * 真实接口对接说明：
 * 1. 若使用广材网官方API，需先获取授权Token，填入 API_TOKEN
 * 2. 配置 BASE_URL 为真实接口域名（如 https://api.gldjc.com/v1）
 * 3. 接口响应结构需符合下方 ApiResult 类型，或调整 transform 函数
 * 4. 真实接口的请求/响应字段需与 src/types/index.ts 中定义一致
 *
 * 若广材网未开放公开API，可自建后端代理层对接其内部数据。
 */

export interface ApiConfig {
  /** 是否启用真实API（false=使用本地模拟数据） */
  useRealApi: boolean;
  /** 真实API基础地址 */
  baseUrl: string;
  /** API授权Token（Bearer方式） */
  apiToken: string;
  /** 请求超时时间(ms) */
  timeout: number;
  /** 模拟网络延迟(ms)，用于本地数据模式 */
  mockDelay: number;
}

// ============ 配置项（按需修改） ============
export const apiConfig: ApiConfig = {
  useRealApi: false, // ⚠️ 设为 true 即对接真实接口
  baseUrl: "https://api.gldjc.com/v1", // 真实API地址
  apiToken: "", // 授权Token
  timeout: 15000,
  mockDelay: 350, // 模拟网络延迟，提升真实感
};

// ============ 通用响应结构 ============
export interface ApiResult<T> {
  code: number; // 0=成功，非0=失败
  message: string;
  data: T;
  total?: number;
}

// ============ 各接口路径定义 ============
export const endpoints = {
  search: "/materials/search", // 材料搜索
  marketPrice: "/market-prices", // 市场价查询
  infoPrice: "/info-prices", // 信息价查询
  categories: "/categories", // 分类列表
  suppliers: "/suppliers", // 供货商查询
  latestMarket: "/market-prices/latest", // 最新市场价
  latestInfo: "/info-prices/latest", // 最新信息价
} as const;

// ============ 网络请求封装 ============
export async function request<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResult<T>> {
  const url = new URL(apiConfig.baseUrl + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    const resp = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiConfig.apiToken ? { Authorization: `Bearer ${apiConfig.apiToken}` } : {}),
      },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    const json = (await resp.json()) as ApiResult<T>;
    if (json.code !== 0) {
      throw new Error(json.message || "接口返回错误");
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

// ============ 模拟网络延迟 ============
export function delay(ms: number = apiConfig.mockDelay): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
