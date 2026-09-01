"""
腾讯云轻量服务器部署脚本
- 安装 Nginx
- 上传 dist 文件
- 配置静态站点
- 开放 80 端口
"""

import paramiko
import os
import sys
import time
import tarfile
import shutil

# 服务器配置
HOST = "124.221.254.79"
PORT = 22
USERNAME = "root"
# SSH 密钥认证（2026-08-29 起；密码登录不稳定，密钥部署更安全）
KEY_FILE = r"C:\Users\Administrator\WorkBuddy\2026-06-26-11-38-38\.workbuddy\neicai_deploy_key"

# 本地 dist 目录
LOCAL_DIST = r"C:\Users\Administrator\WorkBuddy\2026-06-26-11-38-38\app\dist"
REMOTE_TMP = "/tmp/neicai-dist.tar.gz"
REMOTE_WEB_DIR = "/var/www/neicai"
NGINX_CONFIG = """server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/neicai;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
"""


def run_ssh(client, cmd, timeout=60):
    print(f"  $ {cmd[:100]}{'...' if len(cmd) > 100 else ''}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    return out, err


def main():
    print("=" * 60)
    print("开始部署到轻量服务器")
    print(f"目标: {HOST}")
    print("=" * 60)

    # 1. 打包 dist 目录
    print("\n[1/5] 打包 dist 目录...")
    tar_path = r"C:\Users\Administrator\WorkBuddy\2026-06-26-11-38-38\app\dist.tar.gz"
    if os.path.exists(tar_path):
        os.remove(tar_path)
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(LOCAL_DIST, arcname="dist")
    size_mb = os.path.getsize(tar_path) / 1024 / 1024
    print(f"  ✓ 打包完成: {size_mb:.2f} MB")

    # 2. 连接服务器（密钥认证）
    print("\n[2/5] 连接服务器...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        pkey = paramiko.Ed25519Key.from_private_key_file(KEY_FILE)
        client.connect(
            HOST, PORT, USERNAME, pkey=pkey,
            timeout=15,
            look_for_keys=False,
            allow_agent=False,
            auth_timeout=15,
        )
        print(f"  ✓ 已通过密钥连接到 {HOST}")
    except Exception as e:
        print(f"  ✗ 连接失败: {e}")
        print("\n排查建议：确认密钥文件存在且公钥仍在服务器 /root/.ssh/authorized_keys 中")
        sys.exit(1)

    try:
        # 3. 安装 Nginx
        print("\n[3/5] 安装 Nginx...")
        # OpenCloudOS 9 用 dnf
        out, err = run_ssh(client, "dnf install -y nginx 2>&1 | tail -5", timeout=180)
        print("  " + out.replace("\n", "\n  ")[:500])

        # 启动 Nginx
        run_ssh(client, "systemctl enable nginx 2>&1")
        run_ssh(client, "systemctl start nginx 2>&1")
        out, _ = run_ssh(client, "nginx -v 2>&1")
        print(f"  ✓ Nginx 已安装: {out.strip()}")

        # 4. 上传文件
        print("\n[4/5] 上传 dist 文件...")
        sftp = client.open_sftp()
        sftp.put(tar_path, REMOTE_TMP)
        print(f"  ✓ 上传打包文件: {size_mb:.2f} MB")

        # 解压
        run_ssh(client, f"rm -rf {REMOTE_WEB_DIR} && mkdir -p {REMOTE_WEB_DIR}")
        out, _ = run_ssh(client, f"cd /var/www && tar -xzf {REMOTE_TMP} && mv dist/* neicai/ && rmdir dist", timeout=60)
        print(f"  ✓ 解压到 {REMOTE_WEB_DIR}")

        # 清理临时文件
        run_ssh(client, f"rm -f {REMOTE_TMP}")

        # 5. 配置 Nginx
        print("\n[5/5] 配置 Nginx...")
        # 写入配置
        sftp.putfo = None
        with sftp.open("/etc/nginx/conf.d/neicai.conf", "w") as f:
            f.write(NGINX_CONFIG)
        print("  ✓ 写入 Nginx 配置")

        # 删除默认站点
        run_ssh(client, "rm -f /etc/nginx/conf.d/default.conf")

        # 测试配置
        out, err = run_ssh(client, "nginx -t 2>&1", timeout=10)
        if "successful" in out or "successful" in err:
            print("  ✓ Nginx 配置正确")
        else:
            print(f"  ✗ Nginx 配置有误: {out} {err}")

        # 重新加载
        run_ssh(client, "systemctl reload nginx 2>&1")

        # 开放防火墙端口
        out, _ = run_ssh(client, "firewall-cmd --permanent --add-service=http 2>&1 || true", timeout=10)
        out, _ = run_ssh(client, "firewall-cmd --reload 2>&1 || true", timeout=10)

        sftp.close()

        # 6. 验证
        print("\n[6/6] 验证部署...")
        out, _ = run_ssh(client, "ls -la /var/www/neicai/ | head -5", timeout=10)
        print(out)
        out, _ = run_ssh(client, "ls /var/www/neicai/assets/ | head -3", timeout=10)
        print("  Assets 目录:", out.replace("\n", ", ").strip())

        # 测试 HTTP
        out, _ = run_ssh(client, "curl -sI http://localhost | head -3", timeout=10)
        print("\nHTTP 测试:")
        print(out)

    finally:
        client.close()

    print("\n" + "=" * 60)
    print("✓ 部署完成！")
    print(f"访问地址: http://{HOST}")
    print("=" * 60)


if __name__ == "__main__":
    main()
