"""
重装系统后：把备份的数据库和报价单恢复到腾讯云服务器
用法：python restore_data_to_server.py
前提：neicai_deploy_key 私钥在本目录，服务器 SSH 已放行公钥
"""
import paramiko
import os

HOST = "124.221.254.79"
KEY = os.path.join(os.path.dirname(__file__), "neicai_deploy_key")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backup_local", "server_data")

def main():
    key = paramiko.Ed25519Key.from_private_key_file(KEY)
    t = paramiko.Transport((HOST, 22))
    t.connect()
    t.auth_publickey("root", key)
    print("[1] SSH 连接 OK")
    sftp = paramiko.SFTPClient.from_transport(t)

    # 上传数据库与报价单
    db_local = os.path.join(DATA_DIR, "data.db")
    if not os.path.exists(db_local):
        print("✗ 找不到备份的 data.db，请确认 backup_local/server_data 目录")
        return
    sftp.put(db_local, "/tmp/data.db")
    print("[2] data.db 上传 OK")

    up_dir = os.path.join(DATA_DIR, "uploads")
    for f in os.listdir(up_dir) if os.path.isdir(up_dir) else []:
        sftp.put(os.path.join(up_dir, f), "/tmp/" + f)
        print("[3] 报价单上传:", f)

    # 服务器端恢复：停服务 -> 覆盖文件 -> 启动
    s = t.open_session()
    s.settimeout(120)
    cmd = (
        "systemctl stop neicai-api && "
        "cp /tmp/data.db /var/www/neicai-api/data.db && "
        "rm -rf /var/www/uploads && mkdir -p /var/www/uploads && "
        "cd /tmp && for f in mtcd*.xlsx *.pdf *.xls; do [ -f \"$f\" ] && cp \"$f\" /var/www/uploads/ 2>/dev/null; done; "
        "chown -R root:root /var/www/neicai-api /var/www/uploads && "
        "rm -f /tmp/data.db /tmp/mtcd*.xlsx && "
        "systemctl start neicai-api && sleep 1 && "
        "systemctl is-active neicai-api && curl -s http://127.0.0.1:3000/api/stats && echo RESTORE_OK"
    )
    s.exec_command(cmd)
    print(s.makefile().read().decode())
    t.close()

if __name__ == "__main__":
    main()
