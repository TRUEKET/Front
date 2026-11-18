// 내 계정 정보 수정·탈퇴 (로그인 필요)
// 백엔드 명세: TRUEKET/Back docs/auth-api.md ("내 계정 조회·번호 변경", "AC-03 회원 탈퇴")
// VITE_USE_MOCK=true면 mock/authApi.js(localStorage 목업)로, 아니면 실제 서버로 요청
import { api } from "./client.js";
import { USE_MOCK } from "./mockMode.js";
import * as mockAuth from "../mock/authApi.js";
import { clearSession, formatPhone, updateCurrentUser } from "./auth.js";

export const PASSWORD_CONFIRM_ERROR = "비밀번호가 일치하지 않습니다.";

const phoneDigits = (phone) => phone.replace(/\D/g, "");

// GET /me/account → { id, email, phone(전체) } (계정 수정 화면에서만 조회)
export async function getMyAccount(options) {
  const account = USE_MOCK ? await mockAuth.getAccount() : await api.get("/me/account", options);
  return { ...account, phone: formatPhone(account.phone ?? "") };
}

// PATCH /me/password (현재 비밀번호가 다르면 서버 안내 문구를 담은 ApiError)
export function changePassword({ currentPassword, newPassword, confirmPassword }) {
  const body = { currentPassword, newPassword, confirmPassword };
  return USE_MOCK ? mockAuth.changePassword(body) : api.patch("/me/password", body);
}

// ---------- 번호 변경: 발송 → 확인 → 저장 (PhoneVerify에 발송·확인 함수를 넘김) ----------

// POST /me/phone/send → { verificationId, expiresAt, demoSms? }
export function sendPhoneChangeCode(phone) {
  const formatted = formatPhone(phone);
  return USE_MOCK ? mockAuth.sendPhoneChangeCode(formatted) : api.post("/me/phone/send", { phone: formatted });
}

// POST /me/phone/verify (확인만으로는 번호가 바뀌지 않음, 저장하기에서 changePhone 호출)
export function confirmPhoneChangeCode({ verificationId, phone, code }) {
  const body = { verificationId, phone: phoneDigits(phone), code };
  return USE_MOCK ? mockAuth.verifyPhoneChangeCode(body) : api.post("/me/phone/verify", body);
}

// PATCH /me/phone → { id, email, phoneLast4 }, 헤더 번호 뒷자리도 바로 갱신
export async function changePhone({ phone, verificationId }) {
  const body = { phone: phoneDigits(phone), verificationId };
  const user = USE_MOCK ? await mockAuth.changePhone(body) : await api.patch("/me/phone", body);
  updateCurrentUser(user);
  return user;
}

// DELETE /me (409 공유 파일·503 저장소 실패면 ApiError, 계정·로그인 유지)
// 성공하면 서버 세션은 끝남 → 화면이 홈으로 이동한 뒤 endSession() 호출 (로그인 가드가 안내를 먼저 띄우지 않게)
export async function withdraw() {
  if (USE_MOCK) await mockAuth.withdraw();
  else await api.delete("/me");
}

// 탈퇴 후 로그인 상태 비우기 + CSRF 다시 받기
export const endSession = clearSession;
