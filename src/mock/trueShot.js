// TODO: 트루샷 API 연동 전까지 쓰는 목 데이터

// 트루샷 헤더에 보여줄 내 전화번호 뒷자리 (TODO: 로그인 사용자 정보로 교체)
export const MOCK_MY_PHONE_LAST4 = "5678";

// 요청 후 판매자가 촬영을 마쳐야 하는 시간 (30분)
export const REQUEST_EXPIRE_MINUTES = 30;

// 판매자에게 링크와 함께 보내는 안내 문구 (빈 줄로 문단 구분)
export const SELLER_MESSAGE =
  "안녕하세요! 거래 전 실제 예매 내역을 한 번 더 확인하고 싶어요.\n\n트루샷 요청을 열고 촬영을 시작하면 나오는 미션에 맞춰 시간 내에 사진을 보내주실 수 있을까요?";

const minutesLater =(date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

// localStorage가 비어 있을 때 넣는 처음 요청 3건 (피그마 목록)
// 촬영 대기 건은 고정 날짜면 바로 만료돼 실패로 보이므로, 처음 연 시각 기준으로 방금 요청한 것으로 만듦
// firstShotAt·secondShotAt: 판매자의 첫번째·두번째 촬영 완료 시각, result: success 성공 / failed 실패 / null 결과 전
export function createMockRequests(now = new Date()) {
  const successAt = new Date("2026-10-09T14:26:00+09:00");
  const failedAt = new Date("2026-10-01T14:26:00+09:00");

  return [
    {
      id: "mock-pending",
      name: "안녕하세요 댈티",
      code: "7K89",
      createdAt: now.toISOString(),
      expiresAt: minutesLater(now, REQUEST_EXPIRE_MINUTES).toISOString(),
      firstShotAt: null,
      secondShotAt: null,
      result: null,
    },
    {
      id: "mock-success",
      name: "요청 1",
      code: "7K2Q",
      createdAt: successAt.toISOString(),
      expiresAt: minutesLater(successAt, REQUEST_EXPIRE_MINUTES).toISOString(),
      firstShotAt: minutesLater(successAt, 5).toISOString(),
      secondShotAt: minutesLater(successAt, 10).toISOString(),
      result: "success",
    },
    {
      id: "mock-failed",
      name: "가나다 댈티",
      code: "3F7A",
      createdAt: failedAt.toISOString(),
      expiresAt: minutesLater(failedAt, REQUEST_EXPIRE_MINUTES).toISOString(),
      firstShotAt: minutesLater(failedAt, 5).toISOString(),
      secondShotAt: null,
      result: "failed",
    },
  ];
}
