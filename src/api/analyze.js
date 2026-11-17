// 캡처 판독 API (JD-01, JD-02, JD-04)
// 로그인 없이 가능하지만 POST, DELETE 모두 CSRF 토큰 필요 (client.js가 자동으로 붙임)
// 성공 응답은 { code, message, data }로 감싸지 않고 바로 옴
import { api } from "./client.js";

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
