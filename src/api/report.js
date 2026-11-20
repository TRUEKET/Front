// 신고 API (RP-05 송금 증빙 검증, RP-04 신고 등록)
// 둘 다 로그인, 휴대폰 인증이 필요하고 판독 결과(analysisId)가 있어야 함
// 성공 응답은 { code, message, data }로 감싸져 와서 data를 꺼내 씀
import { api } from "./client.js";

// 판독 계좌가 여러 개면 어느 계좌로 보낸 송금인지 순서(0부터)를 골라야 함
// 계좌 선택 화면이 생기기 전까지는 첫 번째 계좌를 사용, 1개면 서버가 자동 선택해서 보내지 않음
export const getDefaultAccountIndex = (accountCount) => (accountCount >= 2 ? 0 : undefined);

// RP-05 송금 증빙 검증 (multipart): 송금 사진의 받는 계좌가 판독 계좌와 같은지 AI로 확인
// 성공: { verified: true, message, evidenceToken } / 계좌 불일치, 송금 확인 실패는 422
export async function verifyReportEvidence({ analysisId, accountIndex, file }, options) {
  const formData = new FormData();
  formData.append("analysisId", analysisId);
  if (accountIndex !== undefined) formData.append("accountIndex", accountIndex);
  formData.append("file", file);

  const { data } = await api.post("/reports/evidence", formData, options);
  return data;
}

// RP-04 신고 등록: kind FRAUD(사기 신고) / SUSPICION(의심 제보)
// 송금 증빙을 확인했으면 evidenceToken을 같이 보냄 (한 번만 쓸 수 있음)
// 성공(201): { reportId, kind, status, identifierIds }
export async function createReport({ analysisId, kind, evidenceToken }, options) {
  const { data } = await api.post("/reports", { analysisId, kind, evidenceToken: evidenceToken ?? null }, options);
  return data;
}
