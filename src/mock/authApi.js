// 인증 API 목업 (VITE_USE_MOCK=true일 때 api/auth.js가 사용)
// 서버 응답과 같은 모양으로 돌려줌: 사용자 { id, email, phoneLast4 }, 인증번호 발송 { verificationId, expiresAt, demoSms }
// 가입 계정·로그인 상태는 localStorage, 인증번호는 메모리에 둠 (새로고침하면 다시 받아야 함)
import { ApiError } from "../api/client.js";
import { VERIFY_TIME_LIMIT } from "./auth.js";

const ACCOUNTS_KEY = "trueket_accounts";
const SESSION_KEY = "trueket_mock_session";

// localStorage 읽기·쓰기 (사생활 보호 모드 등에서 막혀도 화면이 깨지지 않도록 감쌈)
const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패 시 무시 (목업)
  }
};

const digits = (phone = "") => phone.replace(/\D/g, "");

// 예전 목업 계정({ email, password, phone })에도 id를 붙여서 사용
const readAccounts = () =>
  readStorage(ACCOUNTS_KEY, []).map((account, index) => ({ id: account.id ?? index + 1, ...account }));

const toUser = ({ id, email, phone }) => ({ id, email, phoneLast4: digits(phone).slice(-4) });

const sessionAccount = () => {
  const email = readStorage(SESSION_KEY, null);
  return readAccounts().find((account) => account.email === email) ?? null;
};

const requireSession = () => {
  const account = sessionAccount();
  if (!account) throw new ApiError(401, "로그인이 필요해요.");
  return account;
};

// ---------- 휴대폰 인증 ----------

let verifications = [];

// 서버와 같은 규칙: 같은 번호 재전송은 60초 뒤 (429), 3분 유효
const RESEND_SECONDS = 60;

export async function sendPhoneCode(phone) {
  const last = verifications.findLast((item) => item.phone === digits(phone));
  if (last && Date.now() - last.sentAt < RESEND_SECONDS * 1000) throw new ApiError(429, "인증번호는 1분 뒤 다시 받아 주세요");

  const code = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  const verification = {
    id: verifications.length + 1,
    phone: digits(phone),
    code,
    expiresAt: Date.now() + VERIFY_TIME_LIMIT * 1000,
    verified: false,
    sentAt: Date.now(),
  };
  verifications = [...verifications, verification];

  return {
    verificationId: verification.id,
    expiresAt: new Date(verification.expiresAt).toISOString(),
    demoSms: {
      maskedPhone: phone.replace(/^(\d{3})-?\d{3,4}-?(\d{4})$/, "$1-****-$2"),
      code,
      message: "시연용 문자 수신함입니다. 실제 문자는 발송되지 않습니다.",
    },
  };
}

export async function verifyPhoneCode({ verificationId, phone, code }) {
  const verification = verifications.find((item) => item.id === verificationId && item.phone === digits(phone));
  if (!verification || Date.now() > verification.expiresAt) throw new ApiError(400, "인증번호가 만료되었어요. 다시 받아 주세요.");
  if (verification.code !== code) throw new ApiError(400, "인증번호가 일치하지 않습니다.");
  verification.verified = true;
  return null;
}

// ---------- 가입·로그인·로그아웃 ----------

export async function signup({ email, password, phone, verificationId }) {
  const verified = verifications.find((item) => item.id === verificationId && item.verified && item.phone === digits(phone));
  if (!verified) throw new ApiError(400, "휴대폰 인증을 먼저 완료해 주세요.");

  const accounts = readAccounts();
  if (accounts.some((account) => account.email === email)) throw new ApiError(409, "이미 가입된 이메일이에요.");

  const account = { id: Math.max(0, ...accounts.map((item) => item.id)) + 1, email, password, phone: digits(phone) };
  writeStorage(ACCOUNTS_KEY, [...accounts, account]);
  writeStorage(SESSION_KEY, email);
  return toUser(account);
}

export async function login({ email, password }) {
  const account = readAccounts().find((item) => item.email === email && item.password === password);
  if (!account) throw new ApiError(401, "이메일 또는 비밀번호가 맞지 않습니다.");

  writeStorage(SESSION_KEY, email);
  return toUser(account);
}

export async function logout() {
  writeStorage(SESSION_KEY, null);
  return null;
}

// GET /me: 로그인 상태가 아니면 401
export async function me() {
  return toUser(requireSession());
}

// ---------- 계정 수정 (TODO: 내 정보 API 연동에서 실제 요청으로 교체) ----------

const updateSessionAccount = (patch) => {
  const account = requireSession();
  const updated = { ...account, ...patch };
  writeStorage(
    ACCOUNTS_KEY,
    readAccounts().map((item) => (item.id === account.id ? updated : item)),
  );
  return toUser(updated);
};

export async function changePassword({ currentPassword, newPassword }) {
  if (requireSession().password !== currentPassword) throw new ApiError(400, "현재 비밀번호가 일치하지 않습니다.");
  return updateSessionAccount({ password: newPassword });
}

export async function changePhone(phone) {
  return updateSessionAccount({ phone: digits(phone) });
}

export async function withdraw() {
  const account = requireSession();
  writeStorage(
    ACCOUNTS_KEY,
    readAccounts().filter((item) => item.id !== account.id),
  );
  writeStorage(SESSION_KEY, null);
  return null;
}
