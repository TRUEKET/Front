// TODO: 실제 조회 API 연동 전까지 쓰는 목 데이터
// realValue: "비교하기"에 이 값을 정확히 입력해야 가려진 value 대신 공개됨
export const MOCK_RELATED_INFO = [
  { type: "phone", label: "전화번호", value: "010-****-1234", realValue: "010-5678-1234" },
  { type: "x", label: "X 계정", value: "@hello123*****", realValue: "@hello123official" },
  { type: "account", label: "다른 계좌", value: "KB 123456-04-******", realValue: "KB 123456-04-567890" },
];

export const MOCK_TIMELINE = [
  { date: "26.00.00", type: "피해 신고" },
  { date: "26.00.00", type: "의심 제보" },
  { date: "26.00.00", type: "피해 신고" },
  { date: "26.00.00", type: "의심 제보" },
];
