# 对接真实数据接口说明

本系统已构建标准化的数据服务层（`src/lib/api.ts` + `src/lib/search.ts`），支持在 **内置模拟数据** 和 **真实API** 之间无缝切换。

## 切换方式

编辑 `src/lib/api.ts` 文件中的 `apiConfig` 配置：

```typescript
export const apiConfig: ApiConfig = {
  useRealApi: true,                    // ⚠️ 改为 true 即对接真实接口
  baseUrl: "https://api.gldjc.com/v1", // 真实API地址
  apiToken: "your_token_here",         // 授权Token（如需）
  timeout: 15000,
  mockDelay: 350,
};
```

## 对接广材网(gldjc.com)真实数据的方式

### 方式一：广材网官方API（需授权）
若广材网开放官方API：
1. 联系广材网获取API授权Token
2. 填写 `baseUrl` 和 `apiToken`
3. 取消 `src/lib/search.ts` 中各函数真实API分支的注释，按实际接口字段调整

### 方式二：自建后端代理层（推荐）
广材网未开放公开API时，自建后端代理：
1. 后端爬取/对接广材网内部数据接口
2. 后端提供RESTful API，字段对齐 `src/types/index.ts` 中定义
3. 前端配置 `baseUrl` 指向后端代理服务

### 方式三：替换数据源
直接对接其他建材价格数据源（如各地造价站、其他平台），保持字段结构一致即可。

## 接口字段约定

### MarketPrice（市场价）
```typescript
{
  id: string;
  materialName: string;   // 材料名称
  categoryId: string;     // 工程分类ID
  brand: string;          // 品牌
  specs: SpecItem[];      // 规格参数 [{key, value}]
  supplier: Supplier;     // 供货商
  price: number;          // 工程价
  unit: string;           // 单位
  region: string;         // 报价地区
  date: string;           // 报价日期 YYYY-MM-DD
  projectType: ProjectType;
}
```

### InfoPrice（信息价）
```typescript
{
  id: string;
  region: string;         // 地区
  year: number;
  month: number;
  type: string;           // 信息价类型
  title: string;          // 标题
  publishDate: string;    // 发布日期
}
```

### Supplier（供货商）
```typescript
{
  id: string;
  name: string;           // 供货商名称
  region: string;         // 所在地
  contact: string;        // 联系方式
  level: string;          // 等级
}
```

## 当前内置数据规模（模拟模式）

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 材料大类 | 17 | 金属材料、混凝土、装饰工程、管材、阀门等 |
| 子分类 | 130+ | 详细到钢筋、PPR管、闸阀等 |
| 供货商 | 45 | 含首钢、宝钢、东方雨虹、海螺水泥等真实企业 |
| 市场价记录 | 250+ | 覆盖钢筋、混凝土、管材、电缆、瓷砖等全品类 |
| 信息价记录 | 200+ | 14个地区 × 6个月 × 多类型 |
| 品牌覆盖 | 45 | 含国内主流建材品牌 |
| 地区覆盖 | 17 | 含北京、上海、广东、江苏、浙江等 |
