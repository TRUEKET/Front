// 내 신고 목업 데이터 (VITE_USE_MOCK=true일 때 mock/myReportsApi.js가 사용)
// 서버 응답과 같은 모양 (TRUEKET/Back docs/my-reports-api.md의 RP-06 상세 응답)
// kind: FRAUD 피해 신고 / SUSPICION 의심 제보
// status: PUBLISHED 게시 중 / RESPONDING 응답 대기 / REVIEWING 검토 중 / PRIVATE 비공개
// disputes: 이의제기 알림 (canRespond면 유지·삭제 결정 가능)

const IDENTIFIERS = [
  { identifierId: 308, type: "ACCOUNT", maskedValue: "신한 110-22-******" },
  { identifierId: 309, type: "PHONE", maskedValue: "010-****-1234" },
  { identifierId: 310, type: "SNS", maskedValue: "@hello1*****" },
];

const EVIDENCE_QUOTES = ["3자 사기 무서우니까 본명 말고 닉네임으로 입금해주세요", "지금 바로 입금해야 자리 잡아드릴 수 있어요"];

// 응답 기한: 지금부터 3일 뒤
const inThreeDays = () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

export const createMockMyReports = () => [
  {
    reportId: 365,
    kind: "FRAUD",
    status: "RESPONDING",
    tradeType: "TRANSFER",
    evidenceQuotes: EVIDENCE_QUOTES,
    referenceLinks: [],
    sentDate: "2026-10-23",
    createdAt: "2026-10-23T20:00:00+09:00",
    identifiers: IDENTIFIERS,
    disputes: [
      { disputeId: 18, reason: "REFUND", status: "RESPONDING", deadline: inThreeDays(), canRespond: true, canRepublish: false },
    ],
  },
  {
    reportId: 364,
    kind: "SUSPICION",
    status: "PUBLISHED",
    tradeType: "AOM",
    evidenceQuotes: EVIDENCE_QUOTES.slice(0, 1),
    referenceLinks: [],
    sentDate: null,
    createdAt: "2026-10-20T18:30:00+09:00",
    identifiers: IDENTIFIERS.slice(0, 2),
    disputes: [],
  },
  {
    reportId: 363,
    kind: "SUSPICION",
    status: "PRIVATE",
    tradeType: "OTHER",
    evidenceQuotes: [],
    referenceLinks: [],
    sentDate: null,
    createdAt: "2026-10-15T12:10:00+09:00",
    identifiers: IDENTIFIERS.slice(0, 1),
    disputes: [
      { disputeId: 17, reason: "NORMAL", status: "PRIVATE", deadline: "2026-10-18T12:10:00+09:00", canRespond: false, canRepublish: true },
    ],
  },
  {
    reportId: 362,
    kind: "FRAUD",
    status: "REVIEWING",
    tradeType: "TRANSFER",
    evidenceQuotes: EVIDENCE_QUOTES,
    referenceLinks: [],
    sentDate: "2026-10-10",
    createdAt: "2026-10-10T09:00:00+09:00",
    identifiers: IDENTIFIERS,
    disputes: [
      { disputeId: 16, reason: "NORMAL", status: "REVIEWING", deadline: "2026-10-13T09:00:00+09:00", canRespond: false, canRepublish: false },
    ],
  },
];
