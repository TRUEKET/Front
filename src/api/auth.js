// 인증 관련 로직 모음 (화면은 이 파일의 함수만 사용)
// 백엔드 명세: TRUEKET/Back docs/auth-api.md (서버 세션 쿠키 + CSRF)
// VITE_USE_MOCK=true면 mock/authApi.js(localStorage 목업)로, 아니면 실제 서버로 요청
import { ApiError, api, resetCsrfToken } from "./client.js";
import { USE_MOCK } from "./mockMode.js";
import * as mockAuth from "../mock/authApi.js";

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

// 서버로 보낼 숫자만 있는 번호 (01012345678)
const phoneDigits = (phone) => phone.replace(/\D/g, "");

// 서버는 뒷 4자리만 줌 → 010-****-5678 (헤더 팝업·계정 화면)
export const maskPhoneLast4 = (phoneLast4 = "") => `010-****-${phoneLast4}`;

// ---------- 로그인 상태 ----------
// undefined: 확인 중 (GET /me 응답 전) / null: 비로그인 / { id, email, phoneLast4 }: 로그인

let currentUser;
let loadPromise = null;
const listeners = new Set();

const setCurrentUser = (user) => {
  currentUser = user;
  listeners.forEach((listener) => listener());
};

export const getCurrentUser = () => currentUser;

// 로그인 상태 변경 구독, 구독 해제 함수를 돌려줌 (useSyncExternalStore용)
export function subscribeAuthChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// GET /me: 401이면 비로그인
const fetchMe = async () => {
  try {
    return USE_MOCK ? await mockAuth.me() : await api.get("/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

// 앱에서 처음 한 번 로그인 상태 확인 (동시에 여러 화면이 불러도 요청은 한 번)
// 네트워크 오류 등으로 실패하면 비로그인으로 보고, 다음 호출 때 다시 확인
export function loadCurrentUser() {
  if (!loadPromise) {
    loadPromise = fetchMe()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        loadPromise = null;
        setCurrentUser(null);
      });
  }
  return loadPromise;
}

// 가입·로그인·로그아웃으로 세션이 바뀌면 CSRF 토큰도 다시 받아야 함
const afterSessionChange = (user) => {
  resetCsrfToken();
  loadPromise = Promise.resolve();
  setCurrentUser(user);
  return user;
};

// ---------- 휴대폰 인증 (가입용) ----------

// 인증번호 발송 → { verificationId, expiresAt, demoSms? }
// demoSms는 시연용 서버에서만 옴 (실제 문자 대신 수신함에 보여줄 코드)
// 3분 유효, 재전송은 60초 간격 (429), 같은 브라우저 세션에서 확인·가입해야 함
export function sendVerifyCode(phone) {
  const formatted = formatPhone(phone);
  return USE_MOCK ? mockAuth.sendPhoneCode(formatted) : api.post("/auth/phone/send", { phone: formatted });
}

// 받은 코드 확인 (틀리면 400, 5회 오입력 후에는 다시 받아야 함)
export function confirmVerifyCode({ verificationId, phone, code }) {
  const body = { verificationId, phone: phoneDigits(phone), code };
  return USE_MOCK ? mockAuth.verifyPhoneCode(body) : api.post("/auth/phone/verify", body);
}

// ---------- 가입·로그인·로그아웃 ----------

// 회원가입 (인증을 마친 verificationId 필요, 성공하면 바로 로그인) → 사용자
// 만 14세 확인은 서버 필드가 없어 화면에서만 체크
export async function signup({ email, password, phone, verificationId }) {
  const body = { email: email.trim(), password, phone: phoneDigits(phone), verificationId, privacyConsent: true };
  const user = USE_MOCK ? await mockAuth.signup(body) : await api.post("/auth/signup", body);
  return afterSessionChange(user);
}

// 로그인 → 사용자 (실패하면 서버 문구를 담은 ApiError)
export async function login({ email, password }) {
  const body = { email: email.trim(), password };
  const user = USE_MOCK ? await mockAuth.login(body) : await api.post("/auth/login", body);
  return afterSessionChange(user);
}

// 로그아웃 (서버 세션 무효화). 요청이 실패해도 화면은 로그아웃 상태로 바꿈
export async function logout() {
  try {
    if (USE_MOCK) await mockAuth.logout();
    else await api.post("/auth/logout");
  } finally {
    afterSessionChange(null);
  }
}

// ---------- 다른 API 파일에서 쓰는 로그인 상태 변경 ----------

// 계정 정보가 바뀌면(번호 변경 등) 서버가 준 사용자로 갱신 → 헤더 등 바로 다시 그려짐
export const updateCurrentUser = (user) => setCurrentUser(user);

// 탈퇴 등으로 세션이 끝났을 때: CSRF 다시 받고 비로그인 상태로
export const clearSession = () => afterSessionChange(null);
