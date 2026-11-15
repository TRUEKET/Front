// TODO: 판독 API 연동 전까지 쓰는 목 데이터 (status별 판독 결과 예시 하나씩)
// level: safe 해당 없음 / caution 의심 / danger 위험
// realCase: 비슷한 실제 사례 (url은 실제 기사 주소가 정해지면 넣음)
export const MOCK_SCAN_RESULTS = {
  safe: {
    status: "safe",
    tradeType: "양도",
    reportCount: 0,
    account: "KB국민은행 987654-32-123456",
    phone: "01012345678",
    reportHistory: [
      { target: "KB국민은행 987654-32-123456", reportCount: 0, suspectCount: 0 },
      { target: "010-1234-5678", reportCount: 0, suspectCount: 0 },
    ],
    behaviors: [
      { label: "로그인 정보 요구", level: "safe" },
      { label: "수상한 송금 요구", level: "safe" },
      { label: "확인 회피", level: "safe" },
      { label: "판단 재촉", level: "safe" },
      { label: "불리한 조건", level: "safe" },
      { label: "정보 불일치", level: "safe" },
    ],
    photoCount: 2,
    conversations: [],
  },
  caution: {
    status: "caution",
    tradeType: "양도",
    reportCount: 2,
    account: "KB국민은행 987654-32-123456",
    phone: "01012345678",
    reportHistory: [
      { target: "KB국민은행 987654-32-123456", reportCount: 0, suspectCount: 1 },
      { target: "010-1234-5678", reportCount: 0, suspectCount: 1 },
    ],
    behaviors: [
      { label: "수상한 송금 요구", level: "caution" },
      { label: "로그인 정보 요구", level: "safe" },
      { label: "확인 회피", level: "safe" },
      { label: "판단 재촉", level: "safe" },
      { label: "불리한 조건", level: "safe" },
      { label: "정보 불일치", level: "safe" },
    ],
    photoCount: 2,
    conversations: [
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
    ],
  },
  danger: {
    status: "danger",
    tradeType: "양도",
    reportCount: 4,
    account: "KB국민은행 987654-32-123456",
    phone: "01012345678",
    reportHistory: [
      { target: "KB국민은행 987654-32-123456", reportCount: 1, suspectCount: 1 },
      { target: "010-1234-5678", reportCount: 1, suspectCount: 1 },
    ],
    behaviors: [
      { label: "로그인 정보 요구", level: "danger" },
      { label: "확인 회피", level: "caution" },
      { label: "수상한 송금 요구", level: "safe" },
      { label: "판단 재촉", level: "safe" },
      { label: "불리한 조건", level: "safe" },
      { label: "정보 불일치", level: "safe" },
    ],
    photoCount: 2,
    conversations: [
      {
        photo: 1,
        text: "정보 주세요 정보!!",
        level: "danger",
        behavior: "로그인 정보 요구",
        reason: "양도 거래에서 로그인 정보 요구는 계정을 빼앗으려는 수법일 수 있어요.",
      },
      {
        photo: 2,
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
    ],
  },
};
