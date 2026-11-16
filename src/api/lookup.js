// 신고 리스트 조회 API (RP-01~03)
// 로그인 없이 호출 가능, 세 API 합쳐서 IP당 1분 30회 제한 (넘으면 429)
import { api } from "./client.js";

// 서버 위험도 → 화면 상태 (SearchResultBox, AccountSummaryCard의 status 값)
const RISK_STATUS = {
  DANGER: "danger",
  SUSPICION: "caution",
  SAFE: "safe",
};

export const toStatus = (riskLevel) => RISK_STATUS[riskLevel] ?? "safe";

// 신고자 수 → "3명"
export const toCountText = (count) => `${count ?? 0}명`;

// RP-01 검색: 계좌번호, 전화번호, X 계정으로 조회
// 없는 값이어도 404가 아니라 identifierId null + SAFE로 옴
export async function searchLookup(q, options) {
  const { data } = await api.get("/lookup", { ...options, query: { q } });
  return data;
}

// RP-02 세부정보: 마스킹 값, 위험도, 신고 수, 연관 정보, 타임라인
export async function getLookupDetail(identifierId, options) {
  const { data } = await api.get(`/lookup/${identifierId}`, options);
  return data;
}

// RP-03 비교하기: 사용자가 아는 전체 값이 가려진 값과 같은지 확인
// 불일치도 오류가 아니라 matched false로 옴
export async function compareLookup(identifierId, value, options) {
  const { data } = await api.post(`/lookup/${identifierId}/compare`, { value }, options);
  return data;
}
