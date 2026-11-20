// 트루샷 화면 문구와 목업 설정
// 문구는 실제 서버 연동에서도 사용 (서버 failureCode·checks.code → 피그마·기획 확정 문구)

// 요청 기한 (30분). 판매자가 시작했어도 요청 30분이 지나면 종료 (서버 기준)
export const REQUEST_EXPIRE_MINUTES = 30;

// 판매자에게 링크와 함께 보내는 안내 문구 (빈 줄로 문단 구분)
export const SELLER_MESSAGE =
  "안녕하세요! 거래 전 실제 예매 내역을 한 번 더 확인하고 싶어요.\n\n트루샷 요청을 열고 촬영을 시작하면 나오는 미션에 맞춰 시간 내에 사진을 보내주실 수 있을까요?";

// 인증 성공 시 안내 (checks: 체크 표시 줄, {code}는 요청의 인증코드 / notes: 점 표시 안내 줄)
export const SUCCESS_REASONS = {
  checks: ["알아볼 수 있는 화질이에요", "인증코드 {code}가 맞아요", "무작위 지시를 잘 이행했어요"],
  notes: ["공연명·날짜·좌석은 사진을 보고 직접 확인해 주세요", "돈을 보낸 뒤의 취소·중복 판매는 막을 수 없어요"],
};

// 판매자 체크 항목(checks.code + status) → 피그마 문구 ({code}는 인증코드). 없는 조합은 서버 message 사용
export const SELLER_CHECK_TEXTS = {
  PHOTO_QUALITY: { PASSED: "알아볼 수 있는 화질이에요", FAILED: "사진이 흐리거나 내용이 잘 보이지 않아요" },
  AUTH_CODE: { PASSED: "인증코드 {code}가 맞아요", FAILED: "인증코드 {code}가 아니에요" },
  MISSION: { PASSED: "무작위 지시를 잘 이행했어요", FAILED: "정해진 지시에 따르지 못했어요" },
};

// 최종 실패 이유 첫 줄: 첫 번째 사진은 통과 (구매자·판매자 결과 화면 공통)
export const FIRST_PHOTO_PASSED_REASON = { passed: true, text: "첫 번째 사진 인증 성공" };

// 판매자 화면 시간 초과 문구 (failureCode → 피그마 문구)
export const SELLER_TIMEOUT_REASONS = {
  FIRST_PHOTO_TIMEOUT: [{ passed: false, text: "3분 타임어택에 실패했어요" }],
  SECOND_PHOTO_TIMEOUT: [{ passed: false, text: "1분 타임어택에 실패했어요" }],
  REQUEST_TIMEOUT: [{ passed: false, text: "시간 만료" }],
};

// 판매자가 2차까지 통과했지만 공유 기한(요청 30분) 안에 사진을 보내지 않음 (타임어택 실패 화면과 같은 틀)
export const SELLER_PHOTO_NOT_SENT_REASONS = [{ passed: false, text: "시간 내에 사진을 보내지 않아 인증에 실패했어요." }];

// 판매자가 2차까지 통과했지만 서버 자동 가림이 실패해 사진을 보낼 수 없게 끝남 (같은 틀)
export const SELLER_MASK_FAILED_REASONS = [{ passed: false, text: "사진 가림을 완료하지 못해 사진을 보낼 수 없어요." }];

// 판매자가 사진 공유를 거절해 끝남 (같은 틀)
export const SELLER_SHARE_DECLINED_REASONS = [{ passed: false, text: "사진 공유를 거절해 인증에 실패했어요." }];

// 구매자 실패 이유 (failureCode → 11-16 기획 확정 문구)
export const BUYER_TIMEOUT_REASONS = {
  FIRST_PHOTO_TIMEOUT: [{ passed: false, text: "첫 번째 사진이 시간 내에 전송되지 않음" }],
  SECOND_PHOTO_TIMEOUT: [
    FIRST_PHOTO_PASSED_REASON,
    { passed: false, text: "두 번째 사진이 시간 내에 전송되지 않음" },
  ],
};

// 판매자가 2차까지 통과했지만 공유 기한(요청 30분) 안에 사진을 보내지 않음 (구매자 실패 이유)
export const BUYER_PHOTO_NOT_SENT_REASONS = [
  FIRST_PHOTO_PASSED_REASON,
  { passed: true, text: "두 번째 사진 인증 성공" },
  { passed: false, text: "판매자가 시간 내에 사진을 보내지 않음" },
];

// 2차까지 통과했지만 서버 자동 가림이 실패해 사진을 공유할 수 없게 끝남 (구매자 실패 이유)
export const BUYER_MASK_FAILED_REASONS = [
  FIRST_PHOTO_PASSED_REASON,
  { passed: true, text: "두 번째 사진 인증 성공" },
  { passed: false, text: "판매자 사진의 개인정보 가림을 완료하지 못함" },
];

// 2차까지 통과했지만 판매자가 사진 공유를 거절함 (구매자 실패 이유, 지금 판매자 화면에는 거절 버튼 없음)
export const BUYER_SHARE_DECLINED_REASONS = [
  FIRST_PHOTO_PASSED_REASON,
  { passed: true, text: "두 번째 사진 인증 성공" },
  { passed: false, text: "판매자가 사진 공유를 거절함" },
];

// 시간 만료(failureCode=REQUEST_TIMEOUT) 구매자 결과 화면 문구
export const EXPIRED_BUYER_REASON = "판매자가 30분 안에 인증을 시작하지 않았어요.";

// 판독 로딩을 보여주는 최소 시간(ms)
export const JUDGE_LOADING_MS = 2000;

// ---------- 목업 전용 (VITE_USE_MOCK=true, mock/trueShotApi.js) ----------

// 판매자 촬영 제한 시간(초): 1차 3분, 2차 1분
export const FIRST_SHOT_SECONDS = 180;
export const SECOND_SHOT_SECONDS = 60;

// 2차 미션 (서버와 같은 종류: 브이 / 화면 가리키기 / 브이 + 위치)
const POSITION_TEXTS = { LEFT: "왼쪽", RIGHT: "오른쪽", ABOVE: "위", BELOW: "아래" };

// 서버처럼 브이·브이 위치 미션만 발급 (화면 가리키기 POINT_SCREEN은 2026-11-20 신규 발급 제외, 화면 처리는 기존 발급 건 호환용으로 남김)
export const MOCK_SECOND_MISSIONS = [
  { instruction2: "브이를 하고 예매 화면과 함께 찍어 주세요.", mission2: { type: "GESTURE", gesture: "Victory", position: null } },
  ...Object.entries(POSITION_TEXTS).map(([position, label]) => ({
    instruction2: `브이를 예매 화면 ${label}에 두고 찍어 주세요.`,
    mission2: { type: "GESTURE_POSITION", gesture: "Victory", position },
  })),
];
