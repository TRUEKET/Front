// TODO: 내 신고 리스트 API 연동 전까지 쓰는 목 데이터

// 판독 결과에서 함께 나온 연관 정보 (detail_phone / detail_x_account 아이콘 타입)
const RELATED_INFO = [
  { type: "phone", label: "전화번호", value: "010-5678-1234" },
  { type: "x", label: "X 계정", value: "@hello123yarrr" },
];

// 주요 대화 (TalkDetailSheet와 같은 형식, level: caution 의심 / danger 위험)
const CONVERSATIONS = [
  {
    photo: 1,
    text: "3자 사기 무서우니까 본명 말고 닉네임으로 입금해주세요",
    level: "caution",
    behavior: "수상한 송금 요구",
    reason: "입금자 확인을 피하려는 말입니다. 문제 발생 시 누가 보냈는지 추적이 어려울 수 있어요.",
    realCase: {
      summary: "닉네임 입금을 요구한 뒤, 2차 송금으로 36만원 피해",
      source: "아시아경제 2026.02.09",
      url: undefined,
    },
  },
];

// 내가 한 신고·제보 (최신 순)
// type: report 피해 신고 / suspect 의심 제보
// status: private 비공개 / posted 게시 중, reason: 비공개 사유
// dispute: 판매자 이의제기 (kind: pending 결정 대기 / identityTheft 명의 도용으로 트루켓이 비공개 처리)
export const MOCK_MY_REPORTS = [
  {
    id: "1",
    account: "신한 110-22-345678",
    type: "report",
    status: "private",
    reason: "돈을 돌려줬어요",
    date: "2026.10.23",
    relatedInfo: RELATED_INFO,
    photoCount: 2,
    conversations: CONVERSATIONS,
    dispute: {
      kind: "pending",
      reasonLabel: "거래를 정상적으로 마쳤어요",
      photos: [null, null],
      description: "10월 13일에 전액 환불했습니다.",
    },
  },
  {
    id: "2",
    account: "신한 110-22-345678",
    type: "suspect",
    status: "posted",
    reason: null,
    date: "2026.10.23",
    relatedInfo: RELATED_INFO,
    photoCount: 2,
    conversations: CONVERSATIONS,
    dispute: null,
  },
  {
    id: "3",
    account: "신한 110-22-345678",
    type: "suspect",
    status: "private",
    reason: "명의 도용 확인",
    date: "2026.10.23",
    relatedInfo: RELATED_INFO,
    photoCount: 2,
    conversations: CONVERSATIONS,
    dispute: { kind: "identityTheft" },
  },
];
