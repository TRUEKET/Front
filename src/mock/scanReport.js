// TODO: 신고 API 연동 전까지 쓰는 목 데이터

// 판독결과를 거치지 않고 신고 화면에 바로 들어왔을 때 보여줄 신고 정보
export const MOCK_REPORT_INFO = {
  tradeType: "양도",
  account: "신한 123567-00-987654",
  phone: "010-1234-5678",
  sns: "@asdfghjkl",
};

// AI 송금 기록 확인 결과 (match 계좌 일치 / mismatch 계좌 불일치)
// 연동 전에는 ?aiCheck=mismatch 로 불일치 결과도 확인 가능
export const MOCK_AI_ACCOUNT_CHECK = "match";

// AI 확인 중으로 보여줄 시간
export const MOCK_AI_CHECK_DELAY_MS = 800;
