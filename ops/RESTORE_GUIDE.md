# 内部询价采购平台 - 重装系统恢复指南

> 更新时间：2026-09-02（重装前全量备份版）
> 备份分支：github.com/Rui-z817/neicai-procurement-platform 的 **backup** 分支

## 一、备份资产清单（backup 分支内容）

| 目录 | 内容 |
|---|---|
| `app/` | 前端全部源码（src/、scripts/、data/、package.json 等配置） |
| `ops/` | 运维脚本：deploy_ghpages.cjs（GH Pages 部署）、deploy_to_lighthouse.py（服务器部署）、backup_full.cjs（再备份）、restore_data_to_server.py（数据恢复）、neicai_deploy_key（SSH 私钥）、server/api-server.js（API 服务源码） |
| `ops/memory/` | 项目记忆（工作日志、长期笔记） |
| `backup_local/server_data/` | 服务器数据库 data.db + 报价单原件 + 导出 JSON |

**不含**：node_modules（恢复后 npm install）、dist（重新 build）、GitHub PAT 与各密码（见凭据卡）。

## 二、重装后恢复步骤

### 第 0 步：装环境
- Node.js 22（本机开发用）：https://npmmirror.com/mirrors/node/v22.14.0/node-v22.14.0-x64.msi
- Git（可选）+ Python 3.13（可选用）

### 第 1 步：取回代码
方式 A（推荐）：让 AI 助手用 GitHub API 把 backup 分支文件下载回本地工作区。
方式 B（git 可用直连或挂代理时）：
```
git clone -b backup https://github.com/Rui-z817/neicai-procurement-platform.git
```
clone 后把 backup 分支根目录的 `app/` 作为项目目录；`ops/` 放回工作区 .workbuddy/。

### 第 2 步：装依赖并跑起来
```
cd app
npm install --registry=https://registry.npmmirror.com
npm run dev        # 本地 http://localhost:7890
```

### 第 3 步：恢复服务器数据（如果服务器还在）
```
python ops/restore_data_to_server.py
```
（把备份的 data.db 和报价单恢复到 124.221.254.79，恢复后 API 自动重启）

### 第 4 步：重新部署前端（可选，服务器上的网站不受重装影响）
如果服务器网站也坏了才需要：
```
cd app && npx vite build
# 然后用 ops/deploy_to_lighthouse.py 或让 AI 助手部署
```

### 第 5 步：恢复各项自动任务
让 AI 助手重建：
1. 「南京信息价每月自动更新」自动化（每月3日09:00，见 memory/2026-08-29.md 的完整流程）
2. sshd 若被加固禁密码登录：用腾讯云控制台「免密连接 TAT」进服务器，把 ops/neicai_deploy_key.pub 内容追加到 /root/.ssh/authorized_keys

## 三、关键凭据（不在 GitHub 里！）

**见《凭据卡》**（backup_local/credentials.txt，请已保存到网盘/手机）。
包含：GitHub PAT、服务器 root 密码、CloudBase 环境 ID、系统登录账号、SSH 密钥说明。

## 四、多端入口
- 主站（国内直连）：http://124.221.254.79
- GitHub Pages（需加速器）：https://rui-z817.github.io/neicai-procurement-platform/
- 服务器数据 API：http://124.221.254.79/api/health

## 五、重要提醒
1. backup 分支是**全量快照**，恢复后第一次改动前先再跑一次 `node ops/backup_full.cjs`
2. 私钥 neicai_deploy_key 已在 ops/ 里，恢复后无需重新配对（公钥还在服务器上）
3. 若服务器也被重置过：按 memory/2026-08-29.md 的「SSH 故障彻底解决」一节重装 API（Node 22 + /var/www/neicai-api + systemd + Nginx /api 反代）
