// TODO: 신고하기 판독 API 연동 전까지 쓰는 목 데이터

// 판독 결과 예시 (status: match 사실 확인 완료 / mismatch 자료 불일치)
// 연동 전에는 /report/result?status=mismatch 로 불일치 결과도 확인 가능
// checks: 확인 결과 항목 (passed: 통과 여부, values: 확인된 값 줄, guide: 통과 못 했을 때 안내 문구)
// reportInfo: 이 정보로 신고하기를 눌렀을 때 신고 화면에 넘길 판매자 정보
export const MOCK_REPORT_RESULTS = {
  match: {
    status: "match",
    tradeType: "양도",
    reportCount: 4,
    account: "KB국민은행 987654-32-123456",
    phone: "01012345678",
    reportHistory: [
      { target: "KB국민은행 987654-32-123456", reportCount: 3, suspectCount: 1 },
      { target: "010-1234-5678", reportCount: 2, suspectCount: 1 },
    ],
    checks: [
      {
        id: "tradeType",
        passed: true,
        title: "티켓 거래 유형 확인",
        desc: "티켓 거래인지와 해당 유형인지를 파악",
        values: ["티켓 거래 O · 양도"],
      },
      {
        id: "account",
        passed: true,
        title: "계좌 일치",
        desc: "송금 내역 속 계좌와 주요 대화 속 계좌 일치",
        values: ["신한 123-45-678900"],
      },
      {
        id: "seller",
        passed: true,
        title: "판매자 정보 수집 완료",
        values: ["010-1234-5678 · @hello123yarrr"],
      },
    ],
    reportInfo: { account: "신한 123-45-678900", phone: "010-1234-5678", sns: "@hello123yarrr" },
  },
  mismatch: {
    status: "mismatch",
    tradeType: "양도",
    checks: [
      {
        id: "tradeType",
        passed: true,
        title: "티켓 거래 유형 확인",
        desc: "티켓 거래인지와 해당 유형인지를 파악",
        values: ["티켓 거래 O · 양도"],
      },
      {
        id: "account",
        passed: false,
        title: "계좌 불일치",
        desc: "송금 내역 속 계좌와 주요 대화 속 계좌 불일치",
        values: ["송금 내역: 신한 123-45-678900", "주요 대화: 국민 098765-43-211221"],
        guide: "송금한 계좌가 보이는 자료를 넣어주세요.",
      },
      {
        id: "seller",
        passed: true,
        title: "판매자 정보 수집 완료",
        values: ["010-1234-5678 · @hello123yarrr"],
      },
    ],
  },
};
