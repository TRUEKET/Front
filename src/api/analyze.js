// 캡처 판독 API (JD-01, JD-02, JD-04)
// 로그인 없이 가능하지만 POST, DELETE 모두 CSRF 토큰 필요 (client.js가 자동으로 붙임)
// 성공 응답은 { code, message, data }로 감싸지 않고 바로 옴
import { api } from "./client.js";

// 서버 단계 → 화면 상태
const STAGE_STATUS = {
  SAFE: "safe",
  SUSPECT: "caution",
  DANGER: "danger",
};

export const toStageStatus = (stage) => STAGE_STATUS[stage] ?? "safe";

// 신고 이력 박스 제목 (판독 응답에는 식별자별 신고 인원이 없어 단계로만 안내)
export const getReportTitle = ({ reportStage, lookupWarning }) => {
  if (reportStage === "DANGER") return "피해 신고 이력이 있어요";
  if (reportStage === "SUSPECT") return "의심 제보 이력이 있어요";
  if (lookupWarning) return "신고 이력을 확인하지 못했어요";
  return "피해 신고·의심 제보 이력이 없어요";
};

// 가린 식별자 목록에서 종류별 첫 값 (type: ACCOUNT, PHONE, SNS)
export const findIdentifier = (identifiers, type) =>
  identifiers.find((identifier) => identifier.type === type)?.value ?? "";

export const countAccounts = (identifiers) => identifiers.filter(({ type }) => type === "ACCOUNT").length;

// 판독 요청: 캡처 1~10장(장당 10MB 이하) + 추가 정보(선택, 500자 이하)
// 응답: { analyzeId, readable, detectedType, assessment, identifiers, otherSuspicious, message, conversations }
// 대화를 못 읽으면 오류가 아니라 200 + readable false (analyzeId, assessment 없음)
// AI 응답이 늦으면 재시도 포함 최대 약 60초 걸릴 수 있음
export function analyzeCaptures({ captures, additionalInfo }, options) {
  const formData = new FormData();
  captures.forEach((file) => formData.append("captures", file));
  if (additionalInfo) formData.append("additionalInfo", additionalInfo);

  return api.post("/analyze", formData, options);
}

// 판독 결과 삭제 (결과 화면을 떠날 때 호출, 서버 메모리의 원문과 이미지를 바로 지움)
export function deleteAnalysis(analyzeId) {
  return api.delete(`/analyze/${analyzeId}`);
}

// 판독 결과 피드백 (판독당 한 번만 가능, 두 번째는 409)
// kind: HELPFUL(도움이 되었어요) / INCORRECT(결과가 이상해요)
export function sendAnalysisFeedback(analyzeId, kind) {
  return api.post(`/analyze/${analyzeId}/feedback`, { kind });
}
