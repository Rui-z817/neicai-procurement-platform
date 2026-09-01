/**
 * 认证管理模块
 * 
 * 账户数据存储在 localStorage，默认账户可在下方配置。
 * 后续可通过管理界面或直接修改 localStorage 中的 'procurement_accounts' 来添加账户。
 */

export interface Account {
  username: string;
  password: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface Session {
  username: string;
  displayName: string;
  role: "admin" | "user";
  loginAt: number;
  expiresAt: number;
}

const ACCOUNTS_KEY = "procurement_accounts";
const SESSION_KEY = "procurement_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 小时

/** 默认账户（测试阶段） */
const DEFAULT_ACCOUNTS: Account[] = [
  {
    username: "123456",
    password: "123456",
    displayName: "测试用户",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

/** 初始化账户存储（首次访问时写入默认账户） */
export function initAccounts(): void {
  const existing = localStorage.getItem(ACCOUNTS_KEY);
  if (!existing) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  }
}

/** 获取所有账户 */
export function getAccounts(): Account[] {
  initAccounts();
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

/** 添加新账户（仅管理员） */
export function addAccount(account: Omit<Account, "createdAt">): { ok: boolean; message: string } {
  const accounts = getAccounts();
  if (accounts.some((a) => a.username === account.username)) {
    return { ok: false, message: "用户名已存在" };
  }
  accounts.push({ ...account, createdAt: new Date().toISOString() });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { ok: true, message: "账户添加成功" };
}

/** 修改密码 */
export function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string
): { ok: boolean; message: string } {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.username === username && a.password === oldPassword);
  if (idx === -1) {
    return { ok: false, message: "原密码错误" };
  }
  if (newPassword.length < 6) {
    return { ok: false, message: "新密码至少 6 位" };
  }
  accounts[idx].password = newPassword;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { ok: true, message: "密码修改成功" };
}

/** 登录验证 */
export function login(username: string, password: string): { ok: boolean; message: string; session?: Session } {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.username === username && a.password === password);
  if (!account) {
    return { ok: false, message: "用户名或密码错误" };
  }
  const now = Date.now();
  const session: Session = {
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    loginAt: now,
    expiresAt: now + SESSION_DURATION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, message: "登录成功", session };
}

/** 登出 */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** 获取当前会话（自动检查过期） */
export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** 是否已登录 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}
