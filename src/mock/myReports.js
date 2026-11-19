// 내 신고 목업 데이터 (VITE_USE_MOCK=true일 때 mock/myReportsApi.js가 사용)
// 서버 응답과 같은 모양 (TRUEKET/Back docs/my-reports-api.md의 RP-06 상세 응답)
// kind: FRAUD 피해 신고 / SUSPICION 의심 제보
// status: PUBLISHED 게시 중 / RESPONDING 응답 대기 / REVIEWING 검토 중 / PRIVATE 비공개
// evidenceDetails: 판독 근거 상세 (없는 예전 신고는 evidenceQuotes만)
// disputes: 이의제기 알림 (canRespond면 유지·삭제 결정 가능, description·proofImages: 판매자 설명·증빙 사진)
import proofSample from "../assets/images/trueshot_sample_1.png";

// value: 본인 신고에서만 주는 전체 값 (화면은 value 사용), maskedValue: 호환용 가린 값
const IDENTIFIERS = [
  { identifierId: 308, type: "ACCOUNT", value: "신한 11022123456", maskedValue: "신한 110-22-******" },
  { identifierId: 309, type: "PHONE", value: "010-5678-1234", maskedValue: "010-****-1234" },
  { identifierId: 310, type: "SNS", value: "@hello1234", maskedValue: "@hello1*****" },
];

const EVIDENCE_QUOTES = ["3자 사기 무서우니까 본명 말고 닉네임으로 입금해주세요", "지금 바로 입금해야 자리 잡아드릴 수 있어요"];

const EVIDENCE_DETAILS = [
  {
    imageIndex: 1,
    signalId: "S-B3",
    quote: EVIDENCE_QUOTES[0],
    severity: "CAUTION",
    action: "수상한 송금 요구",
    reason: "입금자 확인을 피하려는 말입니다. 문제 발생 시 누가 보냈는지 추적이 어려울 수 있어요.",
    informational: false,
    cases: [
      {
        signalId: "S-B3",
        summary: "닉네임 입금을 요구한 뒤, 2차 송금으로 36만원 피해",
        source: "아시아경제",
        publishedAt: "2026-02-09",
        url: "https://view.asiae.co.kr/visual-news/article/2026020914165800654",
      },
    ],
  },
  {
    imageIndex: 2,
    signalId: "S-D1",
    quote: EVIDENCE_QUOTES[1],
    severity: "STRONG",
    action: "판단 재촉",
    reason: "바로 입금하라고 재촉해 확인할 시간을 주지 않으려는 말입니다.",
    informational: false,
    cases: [],
  },
];

// 응답 기한: 지금부터 3일 뒤
const inThreeDays = () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

export const createMockMyReports = () => [
  {
    reportId: 365,
    kind: "FRAUD",
    status: "RESPONDING",
    tradeType: "TRANSFER",
    evidenceQuotes: EVIDENCE_QUOTES,
    evidenceDetails: EVIDENCE_DETAILS,
    referenceLinks: [],
    sentDate: "2026-10-23",
    createdAt: "2026-10-23T20:00:00+09:00",
    identifiers: IDENTIFIERS,
    disputes: [
      {
        disputeId: 18,
        reason: "REFUND",
        status: "RESPONDING",
        deadline: inThreeDays(),
        canRespond: true,
        canRepublish: false,
        description: "10월 13일에 구매자에게 전액 환불했습니다.",
        proofImages: [{ type: "REFUND", imageUrl: proofSample }],
      },
    ],
  },
  {
    reportId: 364,
    kind: "SUSPICION",
    status: "PUBLISHED",
    tradeType: "AOM",
    evidenceQuotes: EVIDENCE_QUOTES.slice(0, 1),
    evidenceDetails: [],
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
