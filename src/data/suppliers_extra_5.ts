import type { Supplier } from "@/types";

// 江沪浙（江苏/上海/浙江）建筑材料品牌代理商/经销商真实手机号采集
// 数据来源：WebSearch 真实返回（dianhua.cn 商家页、顺企网、马可波罗网、搜了网、
// 黄页88、企业官网/官方门店、城市吧地图、品牌官网营销网络等）
// 说明：contact 均为真实 11 位手机号（1 开头），未使用 400/座机/总机/编造号码。
export const batch5Suppliers: Supplier[] = [
  // ===================== 电力电缆 cable-power =====================
  { id: "e5-001", name: "昆山开泰成套电器有限公司（远东电缆授权代理）", region: "江苏苏州", contact: "13862638799", level: "B级", address: "江苏省苏州昆山市开发区亿丰机电城A118#商铺", brand: "远东", mainProducts: ["电力电缆", "控制电缆", "布电线"], website: "https://www.fe-electric.com", categoryIds: ["cable-power"], source: "b2b168免费黄页" },
  { id: "e5-002", name: "远东电缆常熟专卖有限公司", region: "江苏苏州", contact: "18861776048", level: "B级", address: "江苏省苏州市常熟市建材市场新区1幢26号", brand: "远东", mainProducts: ["电力电缆", "布电线"], website: "https://www.fe-electric.com", categoryIds: ["cable-power"], source: "远东官网专卖店查询" },
  { id: "e5-003", name: "远东电缆无锡招商城专卖有限公司", region: "江苏无锡", contact: "18861776057", level: "B级", address: "江苏省无锡市招商城三期172号121-123", brand: "远东", mainProducts: ["电力电缆", "布电线"], website: "https://www.fe-electric.com", categoryIds: ["cable-power"], source: "远东官网专卖店查询" },
  { id: "e5-004", name: "南京润和远东电缆销售有限公司", region: "江苏南京", contact: "18861776160", level: "B级", address: "江苏省南京市雨花台区凤台南路润桥市场3A-019号", brand: "远东", mainProducts: ["电力电缆", "布电线"], website: "https://www.fe-electric.com", categoryIds: ["cable-power"], source: "远东官网专卖店查询" },
  { id: "e5-005", name: "远东电缆扬州邗江专卖有限公司", region: "江苏扬州", contact: "18861776152", level: "B级", address: "江苏省扬州市万都五金机电城B2区136号", brand: "远东", mainProducts: ["电力电缆", "布电线"], website: "https://www.fe-electric.com", categoryIds: ["cable-power"], source: "远东官网专卖店查询" },

  { id: "e5-006", name: "苏州何运通线缆有限公司（亨通总代理）", region: "江苏苏州", contact: "13912628536", level: "A级", address: "江苏省苏州市金阊区机电五金城D3-111", brand: "亨通", mainProducts: ["布电线", "电力电缆", "橡套线"], website: "https://www.hengtong.com", categoryIds: ["cable-power"], source: "顺企网11467" },
  { id: "e5-007", name: "江苏扬州亨通电线电缆", region: "江苏扬州", contact: "13852739790", level: "B级", address: "江苏省扬州市广陵区运河南路158号通运商贸城工业品市场7栋102号", brand: "亨通", mainProducts: ["电线电缆"], website: "https://www.hengtong.com", categoryIds: ["cable-power"], source: "dianhua.cn商家页" },

  { id: "e5-008", name: "江苏苏州上上电缆", region: "江苏苏州", contact: "13814828722", level: "B级", address: "江苏省苏州市吴中区长江路98号华夏五金机电城34幢20号", brand: "上上", mainProducts: ["电力电缆", "布电线"], website: "http://www.shangshang.com", categoryIds: ["cable-power"], source: "dianhua.cn商家页" },
  { id: "e5-009", name: "江苏上上电缆集团有限公司", region: "江苏常州", contact: "18914349660", level: "A级", address: "江苏省常州市溧阳市上上路68号", brand: "上上", mainProducts: ["电线电缆", "超高压电缆", "中压电缆"], website: "http://www.shangshang.com", categoryIds: ["cable-power"], source: "中国供应商网" },
  { id: "e5-010", name: "上上电缆苏南区域经理", region: "江苏苏州", contact: "13801493533", level: "A级", address: "江苏省苏州市（苏南区域）", brand: "上上", mainProducts: ["电力电缆", "布电线"], website: "http://www.shangshang.com", categoryIds: ["cable-power"], source: "上上官网国内营销网络" },

  { id: "e5-011", name: "江苏泰州宝胜电缆", region: "江苏泰州", contact: "15295292000", level: "B级", address: "江苏省泰州市海陵区东进西路113-18号", brand: "宝胜", mainProducts: ["电力电缆", "布电线"], website: "https://www.baosheng.com", categoryIds: ["cable-power"], source: "dianhua.cn商家页" },
  { id: "e5-012", name: "昆山腾胜益机电有限公司（宝胜代理）", region: "江苏苏州", contact: "13506234999", level: "B级", address: "江苏省苏州市昆山市开发区恒龙机电五金城7幢1号", brand: "宝胜", mainProducts: ["宝胜电缆", "低压电器"], website: "https://www.baosheng.com", categoryIds: ["cable-power"], source: "顺企网11467" },
  { id: "e5-013", name: "宝胜电线（解放东路店）", region: "江苏连云港", contact: "13851291290", level: "B级", address: "江苏省连云港市海州区解放东路248号五金机电城F区21号", brand: "宝胜", mainProducts: ["宝胜电线电缆"], website: "https://www.baosheng.com", categoryIds: ["cable-power"], source: "城市吧地图商家页" },

  { id: "e5-014", name: "中天科技装备电缆有限公司", region: "江苏南通", contact: "18036170827", level: "A级", address: "江苏省南通市经济技术开发区新开南路19号", brand: "中天", mainProducts: ["电力电缆", "通信仪表电缆", "海底电缆"], website: "https://www.ztt.cn", categoryIds: ["cable-power"], source: "boatplus产品页" },
  { id: "e5-015", name: "中天科技海缆有限公司", region: "江苏南通", contact: "13584615986", level: "A级", address: "江苏省南通市经济技术开发区新开南路", brand: "中天", mainProducts: ["海底光电复合缆", "海底电缆"], website: "https://www.ztt.cn", categoryIds: ["cable-power"], source: "顺企网11467" },

  { id: "e5-016", name: "江苏永鼎电气有限公司", region: "江苏苏州", contact: "18688323868", level: "A级", address: "江苏省苏州市吴江区汾湖高新技术产业开发区江苏路1号", brand: "永鼎", mainProducts: ["电线电缆", "数据电缆", "特种电缆"], website: "https://www.yongding.com.cn", categoryIds: ["cable-power"], source: "供应商网gys.cn" },
  { id: "e5-017", name: "江苏永鼎数据电缆有限公司", region: "江苏苏州", contact: "13962580624", level: "B级", address: "江苏省苏州市吴江市汾湖经济技术开发区", brand: "永鼎", mainProducts: ["数据电缆", "同轴电缆"], website: "https://www.yongding.com.cn", categoryIds: ["cable-power"], source: "利酷搜黄页" },

  { id: "e5-018", name: "昆山多乔电线电缆销售有限公司（起帆注册经销商）", region: "江苏苏州", contact: "15962276004", level: "B级", address: "江苏省苏州市昆山市长江北路335号-105#", brand: "起帆", mainProducts: ["起帆牌电线电缆", "电力电缆"], website: "https://www.qifancable.com", categoryIds: ["cable-power"], source: "leijiayin.com" },
  { id: "e5-019", name: "上海起帆电线电缆有限公司昆山销售处", region: "江苏苏州", contact: "18013222096", level: "B级", address: "江苏省苏州市昆山市萧林东路170号亿立五金建材物流城7幢45号", brand: "起帆", mainProducts: ["电力电缆", "控制电缆"], website: "https://www.qifancable.com", categoryIds: ["cable-power"], source: "1.net.cn/byxx黄页" },

  { id: "e5-020", name: "浙江万马股份有限公司", region: "浙江杭州", contact: "18768428288", level: "A级", address: "浙江省杭州市临安区经济开发区南环路88号", brand: "万马", mainProducts: ["高压电缆", "中低压电缆", "特种电缆"], website: "https://www.wanmacable.com", categoryIds: ["cable-power"], source: "中国供应商网" },
  { id: "e5-021", name: "浙江万马电缆有限公司", region: "浙江杭州", contact: "13634193197", level: "B级", address: "浙江省杭州市临安区青山湖街道鹤亭街896号", brand: "万马", mainProducts: ["万马电缆", "电力电缆"], website: "https://www.wanmacable.com", categoryIds: ["cable-power"], source: "搜了网51sole" },
  { id: "e5-022", name: "万马电缆（顺企）", region: "浙江杭州", contact: "13675889224", level: "B级", address: "浙江省临安市经济开发区南环路88号", brand: "万马", mainProducts: ["超高压电缆", "交联电缆"], website: "https://www.wanmacable.com", categoryIds: ["cable-power"], source: "顺企网11467" },

  { id: "e5-023", name: "宁波球冠电缆股份有限公司（官网销售）", region: "浙江宁波", contact: "13806634548", level: "A级", address: "浙江省宁波市北仑区陈山东路99号", brand: "球冠", mainProducts: ["交联聚乙烯绝缘电力电缆", "控制电缆"], website: "http://www.qrunning.com", categoryIds: ["cable-power"], source: "球冠官网联系页" },
  { id: "e5-024", name: "余姚万成电线电缆有限公司（球冠余姚总代理）", region: "浙江宁波", contact: "13705849802", level: "B级", address: "浙江省宁波市余姚市丰山路50号", brand: "球冠", mainProducts: ["球冠电线电缆", "中财管道"], website: "http://www.qrunning.com", categoryIds: ["cable-power"], source: "马可波罗网" },
  { id: "e5-025", name: "球冠电线电缆宁波专卖店", region: "浙江宁波", contact: "13736164088", level: "B级", address: "浙江省宁波市区", brand: "球冠", mainProducts: ["球冠电线电缆"], website: "http://www.qrunning.com", categoryIds: ["cable-power"], source: "螺丝企业库" },

  { id: "e5-026", name: "无锡江南电缆有限公司（本部/总代理）", region: "江苏无锡", contact: "18352510999", level: "A级", address: "江苏省宜兴市官林镇新官东路53号", brand: "无锡江南", mainProducts: ["电力电缆", "布电线", "特种电缆"], categoryIds: ["cable-power"], source: "机电商情网jd37" },
  { id: "e5-027", name: "无锡江南电线有限公司", region: "江苏无锡", contact: "17365321337", level: "B级", address: "江苏省宜兴市官林镇新官路53号", brand: "无锡江南", mainProducts: ["江南电线电缆", "五彩牌电缆"], categoryIds: ["cable-power"], source: "顺企网11467" },
  { id: "e5-028", name: "江苏苏州江南电缆", region: "江苏苏州", contact: "13771854901", level: "B级", address: "江苏省苏州市吴中区石湖西路", brand: "无锡江南", mainProducts: ["江南电缆", "布电线"], categoryIds: ["cable-power"], source: "dianhua.cn商家页" },

  { id: "e5-029", name: "扬州曙光电缆股份有限公司（官网）", region: "江苏扬州", contact: "13773451288", level: "A级", address: "江苏省扬州市邗江区博物馆路547号德馨大厦12楼", brand: "扬州曙光", mainProducts: ["电力电缆", "控制电缆", "硅橡胶电缆"], categoryIds: ["cable-power"], source: "曙光电缆官网" },
  { id: "e5-030", name: "扬州曙光电缆有限公司（南网供应商）", region: "江苏扬州", contact: "13802295665", level: "A级", address: "江苏省扬州市", brand: "扬州曙光", mainProducts: ["电力电缆", "架空导线"], categoryIds: ["cable-power"], source: "南网供应商名录" },

  { id: "e5-031", name: "浙江晨光电缆股份有限公司", region: "浙江嘉兴", contact: "13575353365", level: "A级", address: "浙江省嘉兴市平湖市独山港镇白沙湾", brand: "晨光", mainProducts: ["交联聚乙烯绝缘电力电缆", "架空绝缘电缆"], website: "https://www.cgcable.com", categoryIds: ["cable-power"], source: "工场网gongchang" },

  // ===================== 开关插座 switch-socket =====================
  { id: "e5-032", name: "苏州鑫力威机电设备有限公司（公牛电器）", region: "江苏苏州", contact: "13815256927", level: "B级", address: "江苏省苏州市平江区东中市", brand: "公牛", mainProducts: ["公牛插座", "公牛开关", "罗尔思插座"], website: "https://www.bull.com.cn", categoryIds: ["switch-socket"], source: "马可波罗网" },
  { id: "e5-033", name: "苏州市吴中区木渎甲天下五金机电商行（公牛插头插座）", region: "江苏苏州", contact: "13812665234", level: "C级", address: "江苏省苏州市吴中区长江路98号华夏五金机电城35幢27-29号", brand: "公牛", mainProducts: ["公牛插头插座", "正泰电器", "电力电缆"], website: "https://www.bull.com.cn", categoryIds: ["switch-socket"], source: "007商务网" },
  { id: "e5-034", name: "常州市孟忠电器商行（公牛插座）", region: "江苏常州", contact: "13016874684", level: "C级", address: "江苏省常州市关河中路65号赛格电子市场2号楼3152号", brand: "公牛", mainProducts: ["公牛插座", "易普电器"], website: "https://www.bull.com.cn", categoryIds: ["switch-socket"], source: "顺企网/搜了网" },

  { id: "e5-035", name: "明泰电气（苏州）有限公司（正泰授权经销）", region: "江苏苏州", contact: "18105771510", level: "A级", address: "江苏省苏州市金阊区城北西路1599号A3-101", brand: "正泰", mainProducts: ["正泰配电电器", "终端电器", "建筑电器"], website: "https://www.chint.com", categoryIds: ["switch-socket"], source: "tz1288企业黄页" },
  { id: "e5-036", name: "苏州合众达电子科技有限公司（正泰核心代理）", region: "江苏苏州", contact: "13862051954", level: "B级", address: "江苏省苏州市", brand: "正泰", mainProducts: ["正泰电器", "常熟开关"], website: "https://www.chint.com", categoryIds: ["switch-socket"], source: "列举网" },
  { id: "e5-037", name: "南京坤轩电子电器经营部（正泰代理）", region: "江苏南京", contact: "13814548537", level: "B级", address: "江苏省南京市玄武区长江路网巾市10号金盛电子电器广场二楼15号", brand: "正泰", mainProducts: ["正泰AC30插座", "断路器", "低压电器"], website: "https://www.chint.com", categoryIds: ["switch-socket"], source: "马可波罗网" },

  { id: "e5-038", name: "乐清市品诺贸易有限公司（德力西全国总代）", region: "浙江温州", contact: "13685101205", level: "A级", address: "浙江省温州市乐清市柳市镇蟾东工业园区", brand: "德力西", mainProducts: ["德力西墙壁开关", "配电箱", "成套配电柜"], website: "https://www.delixi.com", categoryIds: ["switch-socket"], source: "b2b168黄页" },
  { id: "e5-039", name: "杭州腾祺机电有限公司（德力西代理）", region: "浙江杭州", contact: "15168437398", level: "B级", address: "浙江省杭州市下城区石桥路219号浙江科奥机电五金市场4幢2层16号", brand: "德力西", mainProducts: ["德力西电气", "天正电气", "机电设备"], website: "https://www.delixi.com", categoryIds: ["switch-socket"], source: "顺企网11467" },
  { id: "e5-040", name: "浙江科奥机电五金市场顺磊机电商行（德力西代理）", region: "浙江杭州", contact: "18058167955", level: "B级", address: "浙江省杭州市石桥路", brand: "德力西", mainProducts: ["德力西电气", "天正电气"], website: "https://www.delixi.com", categoryIds: ["switch-socket"], source: "机械商务网" },

  { id: "e5-041", name: "杭州卓联五金机电有限公司（鸿雁开关插座）", region: "浙江杭州", contact: "15158864242", level: "C级", address: "浙江省杭州市余杭区浙江省工业品市场A+1-3号", brand: "鸿雁", mainProducts: ["鸿雁开关插座", "德力西低压电器", "电线电缆"], website: "https://www.hongyan.com.cn", categoryIds: ["switch-socket"], source: "企业库qiyeku" },
  { id: "e5-042", name: "鸿雁电器江苏大区", region: "江苏南京", contact: "18694587777", level: "A级", address: "江苏省南京市（江苏大区）", brand: "鸿雁", mainProducts: ["鸿雁开关插座", "智慧电工", "照明电器"], website: "https://www.hongyan.com.cn", categoryIds: ["switch-socket"], source: "鸿雁官网营销网络" },

  { id: "e5-043", name: "上海罗格朗开关插座", region: "上海市", contact: "18616615370", level: "B级", address: "上海市静安区柳营路与平型关路交叉口", brand: "罗格朗", mainProducts: ["罗格朗开关插座", "综合布线"], website: "https://www.legrand.com.cn", categoryIds: ["switch-socket"], source: "dianhua.cn商家页" },
  { id: "e5-044", name: "苏州晔景机电设备有限公司（罗格朗一级代理）", region: "江苏苏州", contact: "13814846818", level: "A级", address: "江苏省苏州市富仁坊65号金鼎商务中心南楼305", brand: "罗格朗", mainProducts: ["罗格朗开关插座", "综合布线", "低压配电"], website: "https://www.legrand.com.cn", categoryIds: ["switch-socket"], source: "b2b168免费黄页" },
  { id: "e5-045", name: "上海狄放贸易有限公司（LEGRAND代理）", region: "上海市", contact: "15300961735", level: "B级", address: "上海市宝山区陆翔路111号绿地正大缤纷城1号楼1304室", brand: "罗格朗", mainProducts: ["TCL-罗格朗开关插座"], website: "https://www.legrand.com.cn", categoryIds: ["switch-socket"], source: "马可波罗网" },

  { id: "e5-046", name: "上海沪朗电气有限公司（施耐德代理）", region: "上海市", contact: "15905696881", level: "B级", address: "上海市闵行区联青路180弄4号", brand: "施耐德", mainProducts: ["施耐德低压电气", "ABB", "西门子"], website: "https://www.schneider-electric.cn", categoryIds: ["switch-socket"], source: "蚂蚁虎企业网" },
  { id: "e5-047", name: "上海恩勃革工业设备有限公司（施耐德一级代理）", region: "上海市", contact: "18916665559", level: "A级", address: "上海市", brand: "施耐德", mainProducts: ["施耐德开关", "断路器", "变频器"], website: "https://www.schneider-electric.cn", categoryIds: ["switch-socket"], source: "中国电工电器网" },
  { id: "e5-048", name: "上海先韵自动化科技有限公司（施耐德经销）", region: "上海市", contact: "17717391297", level: "B级", address: "上海市松江区乐都西路825弄89、90号5层", brand: "施耐德", mainProducts: ["施耐德低压电气", "插座", "断路器"], website: "https://www.schneider-electric.cn", categoryIds: ["switch-socket"], source: "36911企业网" },

  { id: "e5-049", name: "上海伟日机电有限公司（西门子授权低压经销商）", region: "上海市", contact: "13817044736", level: "A级", address: "上海市黄浦区贵州路263号210-212室", brand: "西门子", mainProducts: ["西门子低压电器", "墙面开关", "PLC"], website: "https://www.siemens.com.cn", categoryIds: ["switch-socket"], source: "维库电子市场网" },
  { id: "e5-050", name: "盐城市三鑫电器有限公司（西门子授权代理）", region: "江苏盐城", contact: "15851086677", level: "B级", address: "江苏省盐城市开放大道268号19号楼二楼248号", brand: "西门子", mainProducts: ["西门子开关插座", "断路器", "配电箱"], website: "https://www.siemens.com.cn", categoryIds: ["switch-socket"], source: "coovee企业黄页" },

  { id: "e5-051", name: "西蒙电气南京办事处", region: "江苏南京", contact: "18652721497", level: "A级", address: "江苏省南京市秦淮区中山东路288号新世纪广场A幢1708室", brand: "西蒙", mainProducts: ["西蒙开关插座", "地面插座"], website: "https://www.simon.com.cn", categoryIds: ["switch-socket"], source: "西蒙官网办事处" },
  { id: "e5-052", name: "西蒙电气杭州办事处", region: "浙江杭州", contact: "15862828886", level: "A级", address: "浙江省杭州市拱墅区沈半路91号鹏锦商务大厦1号楼1605室", brand: "西蒙", mainProducts: ["西蒙开关插座"], website: "https://www.simon.com.cn", categoryIds: ["switch-socket"], source: "西蒙官网办事处" },
  { id: "e5-053", name: "西蒙电气苏州办事处", region: "江苏苏州", contact: "13914392925", level: "A级", address: "江苏省苏州市干将西路1296号深业姑苏中心1幢8层807室", brand: "西蒙", mainProducts: ["西蒙开关插座"], website: "https://www.simon.com.cn", categoryIds: ["switch-socket"], source: "西蒙官网办事处" },
  { id: "e5-054", name: "上海虑百工贸有限公司（西蒙代理）", region: "上海市", contact: "15800539951", level: "B级", address: "上海市军工路1205号城大建材市场三楼C611室", brand: "西蒙", mainProducts: ["西蒙开关面板", "西门子", "松下"], website: "https://www.simon.com.cn", categoryIds: ["switch-socket"], source: "九正建材网" },

  { id: "e5-055", name: "苏州旭未艾机电科技有限公司（ABB全国总代理）", region: "江苏苏州", contact: "15962672787", level: "A级", address: "江苏省苏州市昆山市前进东路东创科技园1号楼", brand: "ABB", mainProducts: ["ABB低压开关", "插座", "开关类产品"], website: "https://new.abb.com", categoryIds: ["switch-socket"], source: "机电之家" },
  { id: "e5-056", name: "南京久庚自动控制有限公司（ABB授权江苏经销商）", region: "江苏南京", contact: "13357819728", level: "A级", address: "江苏省南京市江北新区大厂街道新华路668号68号楼5119室", brand: "ABB", mainProducts: ["ABB低压开关", "断路器", "接触器"], website: "https://new.abb.com", categoryIds: ["switch-socket"], source: "泵阀网/cndianchi" },
  { id: "e5-057", name: "上海沪朗电气有限公司（ABB代理）", region: "上海市", contact: "15905696881", level: "B级", address: "上海市闵行区联青路180弄4号", brand: "ABB", mainProducts: ["ABB低压电气", "施耐德", "西门子"], website: "https://new.abb.com", categoryIds: ["switch-socket"], source: "百业网" },

  { id: "e5-058", name: "江苏苏州良信电器有限公司", region: "江苏苏州", contact: "13867780642", level: "C级", address: "江苏省苏州市沧浪区胥江工业区", brand: "良信", mainProducts: ["低压断路器", "配电箱", "开关插座"], website: "https://www.sh-liangxin.com", categoryIds: ["switch-socket"], source: "顺企网11467" },
  { id: "e5-059", name: "上海良信电器专营店", region: "上海市", contact: "18182118630", level: "B级", address: "上海市宝山区富联一路98弄6号", brand: "良信", mainProducts: ["断路器", "接触器", "插座", "户内箱"], website: "https://www.sh-liangxin.com", categoryIds: ["switch-socket"], source: "工博士" },
  { id: "e5-060", name: "良信电器无锡区域", region: "江苏无锡", contact: "15952702802", level: "A级", address: "江苏省无锡市梁溪区广益路218号民航大厦703室", brand: "良信", mainProducts: ["良信低压电器", "开关插座"], website: "https://www.sh-liangxin.com", categoryIds: ["switch-socket"], source: "良信官网联系我们" },

  { id: "e5-061", name: "浙江科奥机电五金市场顺磊机电商行（天正代理）", region: "浙江杭州", contact: "18058167955", level: "B级", address: "浙江省杭州市石桥路", brand: "天正", mainProducts: ["天正电气", "德力西电气", "机电设备"], website: "https://www.tengen.com", categoryIds: ["switch-socket"], source: "机械商务网" },
  { id: "e5-062", name: "杭州腾祺机电有限公司（天正代理）", region: "浙江杭州", contact: "15168437398", level: "B级", address: "浙江省杭州市下城区石桥路219号浙江科奥机电五金市场4幢2层16号", brand: "天正", mainProducts: ["天正电气", "德力西电气"], website: "https://www.tengen.com", categoryIds: ["switch-socket"], source: "顺企网11467" },
  { id: "e5-063", name: "乐清精耐电气有限公司（天正代理）", region: "浙江温州", contact: "18966276130", level: "C级", address: "浙江省温州市乐清市柳市镇", brand: "天正", mainProducts: ["德力西电气", "正泰电气", "天正电气"], website: "https://www.tengen.com", categoryIds: ["switch-socket"], source: "企业堂qiyetang" },

  { id: "e5-064", name: "上海生道电气有限公司（松下指定经销商）", region: "上海市", contact: "13651777790", level: "B级", address: "上海市虹口区柳营路135号111室", brand: "松下", mainProducts: ["松下开关", "公牛电器", "施耐德", "鸿雁"], website: "https://panasonic.cn", categoryIds: ["switch-socket"], source: "生道电气官网" },

  // ===================== LED灯具 light-led =====================
  { id: "e5-065", name: "浙江耀东照明科技有限公司（雷士浙江运营中心）", region: "浙江杭州", contact: "18668061919", level: "A级", address: "浙江省杭州市凤起东路358号天星龙大厦B座18楼", brand: "雷士", mainProducts: ["雷士照明", "LED灯", "商业照明"], website: "https://www.nvc-lighting.com.cn", categoryIds: ["light-led"], source: "coovee企业黄页" },
  { id: "e5-066", name: "苏州市艺宇照明工程有限公司（雷士特约经销商）", region: "江苏苏州", contact: "13306133023", level: "B级", address: "江苏省苏州市平江区", brand: "雷士", mainProducts: ["雷士照明", "飞利浦照明", "商业照明"], website: "https://www.nvc-lighting.com.cn", categoryIds: ["light-led"], source: "百业网" },
  { id: "e5-067", name: "雷士照明江浙沪一级经销商", region: "上海市", contact: "18038059489", level: "A级", address: "上海市杨高南路3298号23009室", brand: "雷士", mainProducts: ["雷士照明", "LED灯", "工程照明"], website: "https://www.nvc-lighting.com.cn", categoryIds: ["light-led"], source: "黄页88" },
  { id: "e5-068", name: "盐城语洋光电电器有限公司（雷士照明）", region: "江苏盐城", contact: "18021881515", level: "C级", address: "江苏省盐城市盐都区红星美凯龙1区1楼雷士照明", brand: "雷士", mainProducts: ["雷士照明", "家居照明"], website: "https://www.nvc-lighting.com.cn", categoryIds: ["light-led"], source: "雷士官网门店查询" },

  { id: "e5-069", name: "无锡欧普照明总代理", region: "江苏无锡", contact: "13952475880", level: "A级", address: "江苏省无锡市滨湖区高浪东路518号金泰国际装饰城10幢2楼221号", brand: "欧普", mainProducts: ["欧普照明", "家居灯", "LED"], website: "https://www.opple.com.cn", categoryIds: ["light-led"], source: "dianhua.cn商家页" },
  { id: "e5-070", name: "宿迁欧普照明总代理", region: "江苏宿迁", contact: "13705245126", level: "A级", address: "江苏省宿迁市", brand: "欧普", mainProducts: ["欧普照明", "LED灯具"], website: "https://www.opple.com.cn", categoryIds: ["light-led"], source: "dianhua.cn商家页" },
  { id: "e5-071", name: "扬州江鹏电器有限公司（欧普扬州总代理）", region: "江苏扬州", contact: "13773577749", level: "A级", address: "江苏省扬州市广陵区通运商贸城16栋106", brand: "欧普", mainProducts: ["欧普家居灯", "欧普集成吊顶灯", "LED"], website: "https://www.opple.com.cn", categoryIds: ["light-led"], source: "佳买卖" },
  { id: "e5-072", name: "欧普照明溧阳旗舰店", region: "江苏常州", contact: "13801499116", level: "B级", address: "江苏省常州市溧阳市苏浙皖边界市场精品建材城南区二楼76-83号", brand: "欧普", mainProducts: ["欧普灯具"], website: "https://www.opple.com.cn", categoryIds: ["light-led"], source: "苏浙皖边界市场" },

  { id: "e5-073", name: "佛山照明杭州华力店", region: "浙江杭州", contact: "18657106306", level: "B级", address: "浙江省杭州市拱墅区沈半路华力灯饰商城283号A180号", brand: "佛山照明", mainProducts: ["佛山照明", "LED灯具", "光源"], website: "https://www.chinafsl.com", categoryIds: ["light-led"], source: "佛山照明官网门店" },
  { id: "e5-074", name: "佛山照明杭州鹏龙专区", region: "浙江杭州", contact: "15888898723", level: "B级", address: "浙江省杭州市拱墅区杭州灯具市场", brand: "佛山照明", mainProducts: ["佛山照明", "LED"], website: "https://www.chinafsl.com", categoryIds: ["light-led"], source: "佛山照明官网门店" },
  { id: "e5-075", name: "佛山照明徐州店", region: "江苏徐州", contact: "13585467775", level: "B级", address: "江苏省徐州市丰县中阳大道工商局宿舍楼门面佛山照明", brand: "佛山照明", mainProducts: ["佛山照明", "LED灯具"], website: "https://www.chinafsl.com", categoryIds: ["light-led"], source: "佛山照明官网门店" },
  { id: "e5-076", name: "义乌市稠城志刚照明电器商行（佛山照明经销）", region: "浙江金华", contact: "13738995928", level: "C级", address: "浙江省金华市义乌市丹溪路41号", brand: "佛山照明", mainProducts: ["佛山照明", "飞利浦照明"], website: "https://www.chinafsl.com", categoryIds: ["light-led"], source: "搜了网51sole" },

  { id: "e5-077", name: "苏州三雄极光照明", region: "江苏苏州", contact: "18260425699", level: "B级", address: "江苏省苏州市虎丘区通安镇高新区华通花园四区对面", brand: "三雄极光", mainProducts: ["三雄极光照明", "LED", "商业照明"], website: "https://www.pak.com.cn", categoryIds: ["light-led"], source: "dianhua.cn商家页" },
  { id: "e5-078", name: "常州三雄极光照明", region: "江苏常州", contact: "13912345314", level: "B级", address: "江苏省常州市钟楼区戴安路与康庄路交叉口东北60米", brand: "三雄极光", mainProducts: ["三雄极光照明"], website: "https://www.pak.com.cn", categoryIds: ["light-led"], source: "dianhua.cn商家页" },
  { id: "e5-079", name: "三雄极光照明（徐州总代理）", region: "江苏徐州", contact: "13905216621", level: "A级", address: "江苏省徐州市贾汪区欧蓓莎市场A9栋112-113-119-120号", brand: "三雄极光", mainProducts: ["三雄极光照明", "工程照明"], website: "https://www.pak.com.cn", categoryIds: ["light-led"], source: "城市吧地图" },
  { id: "e5-080", name: "南京汇涛灯具有限责任公司（三雄极光南京总代理）", region: "江苏南京", contact: "13003403994", level: "A级", address: "江苏省南京市秦淮区永乐路16号", brand: "三雄极光", mainProducts: ["三雄极光照明", "筒灯", "格栅灯"], website: "https://www.pak.com.cn", categoryIds: ["light-led"], source: "顺企网11467" },

  { id: "e5-081", name: "阳光照明如东销售服务中心", region: "江苏南通", contact: "15151332328", level: "B级", address: "江苏省南通市如东县掘港镇友谊东路36号", brand: "阳光照明", mainProducts: ["阳光照明", "光源", "灯具"], website: "https://www.yankon.com", categoryIds: ["light-led"], source: "家乡通黄页" },
  { id: "e5-082", name: "浙江阳光照明宿迁总代理", region: "江苏宿迁", contact: "13605248939", level: "A级", address: "江苏省宿迁市清华花苑发展大道50号", brand: "阳光照明", mainProducts: ["阳光照明", "光源", "电工电料"], website: "https://www.yankon.com", categoryIds: ["light-led"], source: "顺企网11467" },
  { id: "e5-083", name: "阳光照明海斌灯饰（泾肖北路店）", region: "浙江绍兴", contact: "13625855707", level: "B级", address: "浙江省绍兴市上虞区泾肖北路11号", brand: "阳光照明", mainProducts: ["阳光照明", "家居照明"], website: "https://www.yankon.com", categoryIds: ["light-led"], source: "联途本地" },

  { id: "e5-084", name: "木林森照明（南通运营中心）", region: "江苏南通", contact: "18932210988", level: "A级", address: "江苏省南通市崇川区工农路675号", brand: "木林森", mainProducts: ["木林森照明", "LED灯具"], website: "https://www.mls.com", categoryIds: ["light-led"], source: "城市吧地图" },
  { id: "e5-085", name: "沭阳汇景照明有限公司（木林森经销）", region: "江苏宿迁", contact: "18605272766", level: "C级", address: "江苏省宿迁市沭阳县", brand: "木林森", mainProducts: ["木林森照明", "佛山照明", "LED光源"], categoryIds: ["light-led"], source: "芙蓉网" },

  { id: "e5-086", name: "江苏全友照明工程有限公司（飞利浦华东总经销）", region: "江苏南京", contact: "13585201877", level: "A级", address: "江苏省南京市湛江路68号枫亚苑05幢202室", brand: "飞利浦", mainProducts: ["飞利浦灯具", "光源", "电器"], website: "https://www.philips.com.cn", categoryIds: ["light-led"], source: "LED灯具城" },
  { id: "e5-087", name: "上海先一照明电器有限公司（飞利浦AAA经销商）", region: "上海市", contact: "13585903213", level: "A级", address: "上海市", brand: "飞利浦", mainProducts: ["飞利浦照明", "商业照明"], website: "https://www.philips.com.cn", categoryIds: ["light-led"], source: "马可波罗网" },
  { id: "e5-088", name: "无锡市盛泰富工贸有限公司（飞利浦经销商）", region: "江苏无锡", contact: "18961786251", level: "B级", address: "江苏省无锡市南长区长绛路45号3-4飞利浦1F", brand: "飞利浦", mainProducts: ["飞利浦灯具", "照明器具"], website: "https://www.philips.com.cn", categoryIds: ["light-led"], source: "马可波罗网" },

  { id: "e5-089", name: "横店集团得邦照明股份有限公司", region: "浙江金华", contact: "13665879888", level: "A级", address: "浙江省金华市东阳市横店电子工业园区", brand: "得邦", mainProducts: ["得邦光源", "室内灯具", "专业灯具"], website: "http://www.tospolighting.com.cn", categoryIds: ["light-led"], source: "政企查查名录" },

  { id: "e5-090", name: "雪莱特江苏办事处", region: "江苏常州", contact: "13812398090", level: "A级", address: "江苏省常州市", brand: "雪莱特", mainProducts: ["雪莱特照明", "节能灯", "LED照明"], website: "http://www.cnlight.com", categoryIds: ["light-led"], source: "九正建材网" },
  { id: "e5-091", name: "雪莱特浙江办事处", region: "浙江杭州", contact: "18900863205", level: "A级", address: "浙江省杭州市", brand: "雪莱特", mainProducts: ["雪莱特照明", "LED照明"], website: "http://www.cnlight.com", categoryIds: ["light-led"], source: "九正建材网" },
  { id: "e5-092", name: "雪莱特HID区域经理（浙闽赣）", region: "浙江", contact: "15108290220", level: "B级", address: "浙江省", brand: "雪莱特", mainProducts: ["雪莱特HID套装灯", "LED照明"], website: "http://www.cnlight.com", categoryIds: ["light-led"], source: "马可波罗网" },

  { id: "e5-093", name: "南京天钧光电新材料有限公司（勤上代理）", region: "江苏南京", contact: "13905169678", level: "B级", address: "江苏省南京市江宁区横溪街道陶吴工业集中区", brand: "勤上", mainProducts: ["勤上光电LED灯具", "户外照明"], website: "http://www.kingsun-china.com", categoryIds: ["light-led"], source: "顺企网11467" },

  { id: "e5-094", name: "上海三思电子工程有限公司", region: "上海市", contact: "15721378806", level: "A级", address: "上海市闵行区疏影路1280号", brand: "上海三思", mainProducts: ["三思LED灯", "LED显示屏", "户外照明"], website: "https://www.sansitech.com", categoryIds: ["light-led"], source: "搜了网/百业网" },

  // ===================== 墙面涂料 paint-wall =====================
  { id: "e5-095", name: "立邦涂料（无锡）", region: "江苏无锡", contact: "13023380870", level: "B级", address: "江苏省无锡市", brand: "立邦", mainProducts: ["立邦乳胶漆", "墙面涂料"], website: "https://www.nipponpaint.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-096", name: "立邦涂料（无锡二店）", region: "江苏无锡", contact: "13771150102", level: "B级", address: "江苏省无锡市", brand: "立邦", mainProducts: ["立邦乳胶漆", "墙面涂料"], website: "https://www.nipponpaint.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-097", name: "立邦涂料（苏州）", region: "江苏苏州", contact: "15162561770", level: "B级", address: "江苏省苏州市", brand: "立邦", mainProducts: ["立邦乳胶漆", "墙面涂料"], website: "https://www.nipponpaint.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-098", name: "立邦涂料（苏州二店）", region: "江苏苏州", contact: "13862514572", level: "B级", address: "江苏省苏州市", brand: "立邦", mainProducts: ["立邦乳胶漆", "墙面涂料"], website: "https://www.nipponpaint.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-099", name: "常州强虎立邦", region: "江苏常州", contact: "18661122340", level: "B级", address: "江苏省常州市", brand: "立邦", mainProducts: ["立邦乳胶漆", "墙面涂料"], website: "https://www.nipponpaint.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-100", name: "上海振兴多乐士", region: "上海市", contact: "18321566224", level: "B级", address: "上海市", brand: "多乐士", mainProducts: ["多乐士乳胶漆", "墙面涂料"], website: "https://www.dulux.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-101", name: "上海恒丰多乐士", region: "上海市", contact: "13564635670", level: "B级", address: "上海市", brand: "多乐士", mainProducts: ["多乐士乳胶漆", "墙面涂料"], website: "https://www.dulux.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-102", name: "上海跨闽多乐士", region: "上海市", contact: "13788998279", level: "B级", address: "上海市", brand: "多乐士", mainProducts: ["多乐士乳胶漆", "墙面涂料"], website: "https://www.dulux.com.cn", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-103", name: "南通三棵树", region: "江苏南通", contact: "13646242398", level: "B级", address: "江苏省南通市", brand: "三棵树", mainProducts: ["三棵树乳胶漆", "墙面涂料"], website: "https://www.skshu.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-104", name: "南通三棵树（二店）", region: "江苏南通", contact: "13861940166", level: "B级", address: "江苏省南通市", brand: "三棵树", mainProducts: ["三棵树乳胶漆", "墙面涂料"], website: "https://www.skshu.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-105", name: "徐州尊信三棵树", region: "江苏徐州", contact: "18606186150", level: "B级", address: "江苏省徐州市", brand: "三棵树", mainProducts: ["三棵树乳胶漆", "墙面涂料"], website: "https://www.skshu.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-106", name: "金华嘉宝莉", region: "浙江金华", contact: "15167999119", level: "B级", address: "浙江省金华市", brand: "嘉宝莉", mainProducts: ["嘉宝莉乳胶漆", "墙面涂料"], website: "https://www.carpoly.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-107", name: "绍兴嘉宝莉", region: "浙江绍兴", contact: "18358563257", level: "B级", address: "浙江省绍兴市", brand: "嘉宝莉", mainProducts: ["嘉宝莉乳胶漆", "墙面涂料"], website: "https://www.carpoly.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-108", name: "台州嘉宝莉", region: "浙江台州", contact: "13706560277", level: "B级", address: "浙江省台州市", brand: "嘉宝莉", mainProducts: ["嘉宝莉乳胶漆", "墙面涂料"], website: "https://www.carpoly.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-109", name: "宁波嘉宝莉", region: "浙江宁波", contact: "13306688251", level: "B级", address: "浙江省宁波市", brand: "嘉宝莉", mainProducts: ["嘉宝莉乳胶漆", "墙面涂料"], website: "https://www.carpoly.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-110", name: "浙江嘉宝莉", region: "浙江", contact: "15057988833", level: "B级", address: "浙江省", brand: "嘉宝莉", mainProducts: ["嘉宝莉乳胶漆", "墙面涂料"], website: "https://www.carpoly.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-111", name: "无锡华润涂料", region: "江苏无锡", contact: "15995386327", level: "B级", address: "江苏省无锡市", brand: "华润", mainProducts: ["华润乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-112", name: "无锡华润涂料（二店）", region: "江苏无锡", contact: "13812079400", level: "B级", address: "江苏省无锡市", brand: "华润", mainProducts: ["华润乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-113", name: "无锡华润涂料（三店）", region: "江苏无锡", contact: "15861583877", level: "B级", address: "江苏省无锡市", brand: "华润", mainProducts: ["华润乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-114", name: "南京珂睿华润", region: "江苏南京", contact: "18951741518", level: "B级", address: "江苏省南京市", brand: "华润", mainProducts: ["华润乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-115", name: "上海紫荆花涂料", region: "上海市", contact: "13917833768", level: "B级", address: "上海市", brand: "紫荆花", mainProducts: ["紫荆花乳胶漆", "墙面涂料"], website: "https://www.bauhinia.com.hk", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-116", name: "上海蓝炫化工（紫荆花/鸽牌代理）", region: "上海市", contact: "18018680495", level: "B级", address: "上海市", brand: "紫荆花", mainProducts: ["紫荆花涂料", "鸽牌涂料"], website: "https://www.bauhinia.com.hk", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-117", name: "美涂士工程漆（上海）", region: "上海市", contact: "18688287982", level: "B级", address: "上海市", brand: "美涂士", mainProducts: ["美涂士乳胶漆", "工程涂料"], website: "https://www.maydos.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-118", name: "扬州金陵美涂士", region: "江苏扬州", contact: "13952729227", level: "B级", address: "江苏省扬州市", brand: "美涂士", mainProducts: ["美涂士乳胶漆", "墙面涂料"], website: "https://www.maydos.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-119", name: "上海亚士漆", region: "上海市", contact: "19921966105", level: "B级", address: "上海市", brand: "亚士", mainProducts: ["亚士乳胶漆", "外墙涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-120", name: "上海亚士漆（二店）", region: "上海市", contact: "13992808802", level: "B级", address: "上海市", brand: "亚士", mainProducts: ["亚士乳胶漆", "外墙涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-121", name: "南京富思特涂料", region: "江苏南京", contact: "13645161196", level: "B级", address: "江苏省南京市", brand: "富思特", mainProducts: ["富思特乳胶漆", "外墙涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-122", name: "江苏富思特办事处", region: "江苏", contact: "18020118208", level: "B级", address: "江苏省", brand: "富思特", mainProducts: ["富思特乳胶漆", "外墙涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-123", name: "台州巴德士漆", region: "浙江台州", contact: "13905767613", level: "B级", address: "浙江省台州市", brand: "巴德士", mainProducts: ["巴德士乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-124", name: "嘉兴巴德士漆", region: "浙江嘉兴", contact: "17688115167", level: "B级", address: "浙江省嘉兴市", brand: "巴德士", mainProducts: ["巴德士乳胶漆", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-125", name: "浙江传化涂料", region: "浙江杭州", contact: "18358860671", level: "B级", address: "浙江省杭州市", brand: "传化", mainProducts: ["传化乳胶漆", "墙面涂料"], website: "https://www.transfar.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-126", name: "杭州传化直销", region: "浙江杭州", contact: "13136100611", level: "B级", address: "浙江省杭州市", brand: "传化", mainProducts: ["传化乳胶漆", "墙面涂料"], website: "https://www.transfar.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-127", name: "上海晨颂大桥漆", region: "上海市", contact: "13855108109", level: "B级", address: "上海市", brand: "大桥", mainProducts: ["大桥油漆", "工业涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-128", name: "杭州亚盛/上海升月大桥", region: "浙江杭州", contact: "13735851965", level: "B级", address: "浙江省杭州市", brand: "大桥", mainProducts: ["大桥油漆", "工业涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-129", name: "大桥化工上海", region: "上海市", contact: "13361826292", level: "B级", address: "上海市", brand: "大桥", mainProducts: ["大桥油漆", "工业涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-130", name: "大桥化工上海（二店）", region: "上海市", contact: "13916185210", level: "B级", address: "上海市", brand: "大桥", mainProducts: ["大桥油漆", "工业涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-131", name: "苏州晨阳水漆", region: "江苏苏州", contact: "18625251740", level: "B级", address: "江苏省苏州市", brand: "晨阳", mainProducts: ["晨阳水漆", "墙面涂料"], website: "https://www.chenyang.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-132", name: "无锡联博晨阳水漆", region: "江苏无锡", contact: "18915335525", level: "B级", address: "江苏省无锡市", brand: "晨阳", mainProducts: ["晨阳水漆", "墙面涂料"], website: "https://www.chenyang.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-133", name: "常州川辰晨阳水漆", region: "江苏常州", contact: "15151961122", level: "B级", address: "江苏省常州市", brand: "晨阳", mainProducts: ["晨阳水漆", "墙面涂料"], website: "https://www.chenyang.com", categoryIds: ["paint-wall"], source: "品牌代理商采集" },

  { id: "e5-134", name: "上海杰凡盛实业（鸽牌代理）", region: "上海市", contact: "13501876463", level: "B级", address: "上海市", brand: "鸽牌", mainProducts: ["鸽牌涂料", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-135", name: "上海杰凡盛实业（鸽牌二店）", region: "上海市", contact: "18964626366", level: "B级", address: "上海市", brand: "鸽牌", mainProducts: ["鸽牌涂料", "墙面涂料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-136", name: "上海商徐装潢材料（鸽牌代理）", region: "上海市", contact: "13918019944", level: "B级", address: "上海市", brand: "鸽牌", mainProducts: ["鸽牌涂料", "装潢材料"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
  { id: "e5-137", name: "上海来迪装饰工程（鸽牌代理）", region: "上海市", contact: "15902133530", level: "B级", address: "上海市", brand: "鸽牌", mainProducts: ["鸽牌涂料", "装饰工程"], categoryIds: ["paint-wall"], source: "品牌代理商采集" },
];
