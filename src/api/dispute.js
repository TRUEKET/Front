// 이의제기 API (RP-08-01, RP-08-02)
// 로그인 없이 호출 가능, 성공 응답은 { code, message, data }로 감싸지 않고 바로 옴
import { api } from "./client.js";

// 화면 이유 id → 서버 reason (명의 도용, 기타는 아직 서버에서 받지 않음)
const DISPUTE_REASON_CODES = {
  normal: "NORMAL",
  refund: "REFUND",
};

export const isSupportedReason = (reason) => reason in DISPUTE_REASON_CODES;

// 증빙 카드 id(mock/disputeEvidence.js의 cards id) → 서버 파일 필드
const EVIDENCE_FIELDS = {
  ticket: "deliveryEvidence",
  deposit: "transferEvidence",
  refund: "transferEvidence",
};

// RP-08-01 이의제기 가능 여부: { status, canApply, targetReportCount }
// status: AVAILABLE, NEW_REPORTS_ONLY(신청 가능) / PROCESSING, NO_NEW_REPORTS(신청 불가)
export function getDisputeAvailability(q, options) {
  return api.get("/disputes/availability", { ...options, query: { q } });
}

// RP-08-02 이의제기 접수 (multipart): { disputeId, receiptNo, status, targetReportCount, message }
// 증빙이 반려돼도 오류가 아니라 200 + status REJECTED로 옴
// evidence: { 카드 id: File }
export function createDispute({ identifier, reason, description, sellerEmail, evidence }, options) {
  const formData = new FormData();
  formData.append("identifier", identifier);
  formData.append("reason", DISPUTE_REASON_CODES[reason]);
  if (description) formData.append("description", description);
  formData.append("sellerEmail", sellerEmail);
  Object.entries(evidence).forEach(([cardId, file]) => formData.append(EVIDENCE_FIELDS[cardId], file));

  return api.post("/disputes", formData, options);
}
