/**
 * 全国各地区信息价官方公示网站导航
 *
 * 排序规则：南京（本系统主数据源）→ 江沪浙 → 西安 → 其他省份
 * 链接均为各地造价管理站/住建厅官方公示渠道，点击新窗口打开。
 * 来源：各省住建厅/造价总站公开信息（2026-08 核对）。
 */

export interface InfoPriceSite {
  region: string; // 地区名
  name: string; // 官方平台名称
  url: string; // 官网地址
  tag?: string; // 特殊标记（如"主数据源"、"优先"）
}

export const infoPriceSites: InfoPriceSite[] = [
  // ===== 优先地区：南京/江苏/上海/浙江/西安 =====
  {
    region: "南京",
    name: "南京市建设工程造价监督站（本系统信息价数据源）",
    url: "https://www.njszj.cn/",
    tag: "主数据源",
  },
  {
    region: "江苏",
    name: "江苏工程造价信息网（省造价管理总站）",
    url: "http://www.jszj.com.cn/",
    tag: "优先",
  },
  {
    region: "上海",
    name: "上海市建设市场信息服务平台（造价定额专栏）",
    url: "https://ciac.zjw.sh.gov.cn/JGBGCZJInterWeb/Hyxx/HyxxIndexNew?bmCode=003001",
    tag: "优先",
  },
  {
    region: "浙江",
    name: "浙江省建设工程造价管理总站",
    url: "https://www.zjzj.net/",
    tag: "优先",
  },
  {
    region: "西安（陕西）",
    name: "陕西工程造价信息网",
    url: "http://www.sxzj.net/",
    tag: "优先",
  },
  // ===== 其他省市 =====
  {
    region: "北京",
    name: "北京市住房和城乡建设委员会（造价信息）",
    url: "https://zjw.beijing.gov.cn/bjjs/gcjs/zczjxx/zjxx/gczjxxj/index.shtml",
  },
  {
    region: "天津",
    name: "京津冀工程造价信息共享平台",
    url: "http://gczj.zfcxjs.tj.gov.cn/Html/gcjj.html",
  },
  {
    region: "河北",
    name: "河北省住房和城乡建设厅（造价信息）",
    url: "https://zfcxjst.hebei.gov.cn/",
  },
  {
    region: "山西",
    name: "山西省工程建设标准定额信息网",
    url: "https://zjt.shanxi.gov.cn/Main/list.action?channelId=223",
  },
  {
    region: "辽宁",
    name: "辽宁省工程造价信息系统（省住建厅）",
    url: "http://zjt.ln.gov.cn/zwfw/xxxt/gczj/",
  },
  {
    region: "山东",
    name: "山东省工程建设标准造价中心（省住建厅）",
    url: "http://zjt.shandong.gov.cn/col/col5442/index.html",
  },
  {
    region: "湖北",
    name: "湖北省住房和城乡建设厅（造价信息）",
    url: "https://zjt.hubei.gov.cn/",
  },
  {
    region: "四川",
    name: "四川省工程造价信息网",
    url: "http://118.122.250.203:8091/",
  },
  {
    region: "福建",
    name: "福建省住房和城乡建设厅（造价信息）",
    url: "https://zjt.fujian.gov.cn/",
  },
  {
    region: "广东",
    name: "广东省工程造价信息化平台",
    url: "http://www.gdcost.com/",
  },
  {
    region: "重庆",
    name: "重庆市建设工程造价管理总站",
    url: "http://www.cqsgczjxx.org/",
  },
  {
    region: "安徽",
    name: "安徽省住房和城乡建设厅（造价信息）",
    url: "https://zjt.ah.gov.cn/",
  },
  {
    region: "江西",
    name: "江西省工程造价信息网（省住建厅）",
    url: "https://zjt.jiangxi.gov.cn/jxszfhcxjst/gqcyc/pc/list.html",
  },
];
