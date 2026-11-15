// 인증 관련 로직 모음
// TODO: 인증 API 연동 시 각 함수 안쪽만 실제 요청으로 바꾸면 됨 (화면은 이 파일의 함수만 사용)
// 지금은 목업: 가입한 계정과 로그인 상태를 localStorage에 저장
import { MOCK_VERIFY_CODE, VERIFY_TIME_LIMIT } from "../mock/auth.js";

const ACCOUNTS_KEY = "trueket_accounts";
const CURRENT_USER_KEY = "trueket_current_user";

// 이메일 형식 (아이디@도메인.최상위도메인)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 규칙: 8자 이상, 영문과 숫자를 모두 포함
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// 형식 안내 문구
export const EMAIL_ERROR = "형식이 올바르지 않습니다.";
export const PASSWORD_ERROR = "8자 이상, 영문과 숫자를 함께 입력해 주세요.";

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

export const isValidPassword = (password) => PASSWORD_REGEX.test(password);

// 010-XXXX-XXXX 형태 (하이픈 없이 숫자 11자리여도 통과)
export const isValidPhone = (phone) => /^010\d{8}$/.test(phone.replace(/-/g, ""));

// 숫자만 남겨 010-1234-5678 형태로 맞춤 (입력 중에도 사용)
export const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

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
    // 저장 실패 시 무시 (목업 단계)
  }
};

// 화면에 저장할 사용자 정보 (비밀번호 제외)
const toUser = ({ email, phone }) => ({ email, phone });

// 인증번호 전송: 시연용 수신함에 보여줄 문자 내용을 돌려줌
export async function sendVerifyCode(phone) {
  return {
    phone: formatPhone(phone),
    code: MOCK_VERIFY_CODE,
    expiresIn: VERIFY_TIME_LIMIT,
  };
}

// 회원가입 후 바로 로그인 상태로 저장
export async function signup({ email, password, phone }) {
  const accounts = readStorage(ACCOUNTS_KEY, []);
  const account = { email: email.trim(), password, phone: formatPhone(phone) };
  const others = accounts.filter((item) => item.email !== account.email);

  writeStorage(ACCOUNTS_KEY, [...others, account]);
  writeStorage(CURRENT_USER_KEY, toUser(account));
  return toUser(account);
}

// 가입된 계정과 이메일·비밀번호가 같으면 로그인, 아니면 에러
export async function login({ email, password }) {
  const accounts = readStorage(ACCOUNTS_KEY, []);
  const account = accounts.find((item) => item.email === email.trim() && item.password === password);

  if (!account) throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");

  writeStorage(CURRENT_USER_KEY, toUser(account));
  return toUser(account);
}

export function logout() {
  writeStorage(CURRENT_USER_KEY, null);
}

// 로그인한 사용자 ({ email, phone }), 비로그인이면 null
export function getCurrentUser() {
  return readStorage(CURRENT_USER_KEY, null);
}

// 헤더에 보여줄 전화번호 뒷자리 4개
export const getPhoneLast4 = (phone = "") => phone.replace(/\D/g, "").slice(-4);

// ---------- 내 계정 정보 수정 ----------

export const PASSWORD_CONFIRM_ERROR = "비밀번호가 일치하지 않습니다.";
export const CURRENT_PASSWORD_ERROR = "현재 비밀번호가 일치하지 않습니다.";

// 로그인한 사용자의 가입 계정 하나를 바꿔 저장하고, 로그인 정보도 같이 갱신
const updateCurrentAccount = (patch) => {
  const user = getCurrentUser();
  const accounts = readStorage(ACCOUNTS_KEY, []);
  const account = user && accounts.find((item) => item.email === user.email);
  if (!account) throw new Error("로그인이 필요합니다.");

  const updated = { ...account, ...patch };
  writeStorage(
    ACCOUNTS_KEY,
    accounts.map((item) => (item.email === user.email ? updated : item)),
  );
  writeStorage(CURRENT_USER_KEY, toUser(updated));
  return toUser(updated);
};

// 비밀번호 변경 (현재 비밀번호가 다르면 에러)
export async function changePassword({ currentPassword, newPassword }) {
  const user = getCurrentUser();
  const account = readStorage(ACCOUNTS_KEY, []).find((item) => item.email === user?.email);
  if (!account || account.password !== currentPassword) throw new Error(CURRENT_PASSWORD_ERROR);

  return updateCurrentAccount({ password: newPassword });
}

// 전화번호 변경 (인증을 마친 번호)
export async function changePhone(phone) {
  return updateCurrentAccount({ phone: formatPhone(phone) });
}

// 탈퇴: 가입 계정을 지우고 로그아웃
// 목업 단계라 계정 정보만 지움 (트루샷 요청·신고 목데이터는 사용자별로 나뉘어 있지 않아 그대로 둠)
export async function withdraw() {
  const user = getCurrentUser();
  writeStorage(
    ACCOUNTS_KEY,
    readStorage(ACCOUNTS_KEY, []).filter((item) => item.email !== user?.email),
  );
  logout();
}
