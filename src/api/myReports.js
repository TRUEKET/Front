// 내 신고 리스트·상세·이의제기 결정 (로그인 필요)
// 백엔드 명세: TRUEKET/Back docs/my-reports-api.md (RP-06), docs/dispute-api.md (RP-08-03)
// 내 신고 API는 { code, message, data }로 감싸져 와서 data를 꺼내 씀
// VITE_USE_MOCK=true면 mock/myReportsApi.js(메모리 목업)로, 아니면 실제 서버로 요청
import { api } from "./client.js";
import { USE_MOCK } from "./mockMode.js";
import * as mockReports from "../mock/myReportsApi.js";
import { getCurrentUser } from "./auth.js";

// 한 번에 불러올 개수 (페이지 나누기 화면이 없어 첫 페이지에 넉넉히)
const PAGE_SIZE = 100;

// 서버 신고 종류 → 화면 종류 (report 피해 신고 / suspect 의심 제보)
const KIND_TYPE = { FRAUD: "report", SUSPICION: "suspect" };

// 서버 신고 상태 → 화면 상태 (reportTypeStyle.js의 REPORT_STATUS_LABEL 키)
const STATUS = { PUBLISHED: "posted", RESPONDING: "responding", REVIEWING: "reviewing", PRIVATE: "private" };

// 이의제기 사유 → 화면 문구 (mock/disputeReason.js와 같은 문구)
const DISPUTE_REASON_LABEL = { NORMAL: "거래를 정상적으로 마쳤어요", REFUND: "돈을 돌려줬어요" };

// 근거 세기 → 말풍선·칩 색 (판독 결과 화면과 같은 기준: 강함 빨강, 주의 노랑)
const SEVERITY_LEVEL = { STRONG: "danger", DANGER: "danger", CAUTION: "caution" };

// 판독 근거(evidenceDetails) → 주요 대화 카드 형식 (판독 결과 화면 TalkCard·TalkDetailSheet와 같은 모양)
// 참고용 신호(informational)는 빼고, 같은 사진·같은 행동은 하나만 (강한 근거 먼저)
const toConversations = (details = []) => {
  const seen = new Set();
  return details
    .filter((detail) => !detail.informational)
    .map((detail) => {
      const realCase = detail.cases?.[0];
      return {
        photo: detail.imageIndex,
        text: detail.quote,
        level: SEVERITY_LEVEL[detail.severity] ?? "caution",
        behavior: detail.action,
        reason: detail.reason,
        realCase: realCase ? { summary: realCase.summary, source: realCase.source, url: realCase.url } : null,
      };
    })
    .sort((a, b) => a.photo - b.photo || (a.level === "danger" ? -1 : 0) - (b.level === "danger" ? -1 : 0))
    .filter(({ photo, behavior }) => {
      const key = `${photo}-${behavior}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

// 연관 정보로 보여줄 식별자 (계좌는 상단에 따로 표시)
const RELATED_IDENTIFIER = {
  PHONE: { type: "phone", label: "전화번호" },
  SNS: { type: "x", label: "X 계정" },
};

const pad = (value) => String(value).padStart(2, "0");

// 2026-10-23T20:00:00+09:00 → 2026.10.23
const formatDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

// 목록·상세 공통 (서버에 없는 비공개 사유는 null → 화면에서 숨김)
const toReportSummary = ({ reportId, kind, status, createdAt }) => ({
  id: String(reportId),
  type: KIND_TYPE[kind] ?? "suspect",
  status: STATUS[status] ?? "posted",
  reason: null,
  date: formatDate(createdAt),
});

// 유지·삭제를 결정할 수 있는 이의제기 (없으면 null)
const toPendingDispute = (disputes = []) => {
  const dispute = disputes.find((item) => item.canRespond);
  if (!dispute) return null;
  return {
    id: dispute.disputeId,
    reasonLabel: DISPUTE_REASON_LABEL[dispute.reason] ?? dispute.reason,
    deadline: dispute.deadline,
    // 판매자 설명·증빙 사진 (서버 서명 URL, 없으면 시트에서 숨김)
    description: dispute.description ?? "",
    photos: (dispute.proofImages ?? []).map((image) => image.imageUrl),
  };
};

// 상세 화면 데이터
// account: 첫 번째 계좌 마스킹 값, relatedInfo: 전화번호·SNS 식별자
// conversations: 판독 근거 상세 (위험도·행동·이유·실제 사례), 없는 예전 신고는 quotes(근거 문장)만
const toReportDetail = (report) => {
  const identifiers = report.identifiers ?? [];
  return {
    ...toReportSummary(report),
    reportId: report.reportId,
    account: identifiers.find((item) => item.type === "ACCOUNT")?.maskedValue ?? "",
    relatedInfo: identifiers
      .filter((item) => RELATED_IDENTIFIER[item.type])
      .map((item) => ({ ...RELATED_IDENTIFIER[item.type], value: item.maskedValue })),
    conversations: toConversations(report.evidenceDetails),
    quotes: report.evidenceQuotes ?? [],
    dispute: toPendingDispute(report.disputes),
  };
};

// 리스트 상단에 보여줄 내 전화번호 뒷자리 (로그인 사용자, 비로그인이면 빈 값)
export function getMyPhoneLast4() {
  return getCurrentUser()?.phoneLast4 ?? "";
}

// GET /me/reports → 화면 목록 (최신 순, 서버가 정렬)
export async function getMyReports(options) {
  const page = USE_MOCK
    ? await mockReports.getMyReports()
    : (await api.get("/me/reports", { ...options, query: { page: 0, size: PAGE_SIZE } })).data;
  return page.content.map(toReportSummary);
}

// GET /me/reports/{id} → 화면 상세 (본인 신고가 아니거나 없으면 404 ApiError)
export async function getMyReport(id, options) {
  const report = USE_MOCK ? await mockReports.getMyReport(id) : (await api.get(`/me/reports/${id}`, options)).data;
  return toReportDetail(report);
}

// 이의제기 결정: keep 신고 유지(MAINTAINED) / delete 신고 삭제(DELETED)
// POST /disputes/{disputeId}/decision (이미 처리됐거나 기한이 지나면 409)
export function decideDispute(report, choice) {
  const body = { reportId: report.reportId, decision: choice === "keep" ? "MAINTAINED" : "DELETED" };
  return USE_MOCK
    ? mockReports.decideDispute(report.dispute.id, body)
    : api.post(`/disputes/${report.dispute.id}/decision`, body);
}
