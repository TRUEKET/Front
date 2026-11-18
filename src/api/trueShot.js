// 트루샷 요청 관련 로직 모음
// TODO: 트루샷 API 연동 시 각 함수 안쪽만 실제 요청으로 바꾸면 됨 (화면은 이 파일의 함수만 사용)
// 지금은 목업: 요청 목록을 localStorage에 저장 (새로고침·새 탭에서도 같은 요청을 찾을 수 있게)
import {
  EXPIRED_BUYER_REASON,
  FIRST_SHOT_SECONDS,
  REQUEST_EXPIRE_MINUTES,
  SECOND_MISSIONS,
  SECOND_SHOT_SECONDS,
  SELLER_FAIL_REASONS,
  SELLER_MESSAGE,
  SESSION_FAIL_REASONS,
  SUCCESS_REASONS,
  createMockRequests,
} from "../mock/trueShot.js";
import samplePhoto1 from "../assets/images/trueshot_sample_1.png";
import samplePhoto2 from "../assets/images/trueshot_sample_2.png";

// 목업 사진 이름 → 이미지 주소 (빌드마다 주소가 바뀌어 localStorage엔 이름만 저장)
const MOCK_PHOTOS = {
  "sample-1": samplePhoto1,
  "sample-2": samplePhoto2,
};

const REQUESTS_KEY = "trueket_trueshot_requests";

// 인증코드에 쓰는 글자 (헷갈리는 0·O·1·I는 뺌)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// localStorage 읽기·쓰기 (사생활 보호 모드 등에서 막혀도 화면이 깨지지 않도록 감쌈)
const readStorage = () => {
  try {
    const value = localStorage.getItem(REQUESTS_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeStorage = (requests) => {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    // 저장 실패 시 무시 (목업 단계)
  }
};

// 저장된 요청이 없으면 목데이터 3건으로 처음 채움
const loadRequests = () => {
  const saved = readStorage();
  if (saved) return saved;

  const initial = createMockRequests();
  writeStorage(initial);
  return initial;
};

const createCode = () =>
  Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// 요청 목록 (최신 순)
export function getTrueShotRequests() {
  return [...loadRequests()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// 없는 id면 null
export function getTrueShotRequest(id) {
  return loadRequests().find((request) => request.id === id) ?? null;
}

// 새 요청: 이름 "요청 N"(N = 지금까지 만든 요청 수 + 1), 랜덤 인증코드, 30분 뒤 만료
export function createTrueShotRequest() {
  const requests = loadRequests();
  const now = new Date();
  const request = {
    id: createId(),
    name: `요청 ${requests.length + 1}`,
    code: createCode(),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + REQUEST_EXPIRE_MINUTES * 60 * 1000).toISOString(),
    firstShotAt: null,
    secondShotAt: null,
    result: null,
  };

  writeStorage([request, ...requests]);
  return request;
}

// 요청 이름 바꾸기 (빈 이름이면 바꾸지 않음)
export function renameTrueShotRequest(id, name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  writeStorage(loadRequests().map((request) => (request.id === id ? { ...request, name: trimmed } : request)));
}

// 시간 만료: 판매자가 30분 안에 인증을 시작하지 않은 경우만 (시작했으면 30분이 지나도 만료 아님)
export const isExpired = (request, now = Date.now()) =>
  request.result === null && !request.firstStartedAt && now > new Date(request.expiresAt).getTime();

const passedSeconds = (startedAt, seconds, now) =>
  Boolean(startedAt) && now > new Date(startedAt).getTime() + seconds * 1000;

// 회차별 시작 시각·제한 시간·판독 통과 시각 필드
const ROUND_TIMES = {
  1: { startedKey: "firstStartedAt", seconds: FIRST_SHOT_SECONDS, passedKey: "firstPassedAt" },
  2: { startedKey: "secondStartedAt", seconds: SECOND_SHOT_SECONDS, passedKey: "secondPassedAt" },
};

// 이번 회차 AI 판독을 제한 시간 안에 통과했는지 (통과 후 가리기 중에는 시간이 지나도 실패 아님)
export const isRoundPassed = (request, round) => Boolean(request?.[ROUND_TIMES[round].passedKey]);

// 판매자가 인증을 시작한 뒤 회차 제한 시간(1차 3분, 2차 1분)을 넘겼는지 → 넘긴 회차(1, 2), 아니면 null
// 판매자 화면이 열려 있으면 실패가 저장되지만, 중간에 닫아도 구매자 쪽에서 실패로 보이게 시각으로도 판단
// 판독을 통과한 회차는 제외 (가리기 저장 전에 시간이 지나도 시간 초과 아님)
export function getTimeoutRound(request, now = Date.now()) {
  if (request.result !== null) return null;
  const round = request.firstShotAt ? 2 : 1;
  if (round === 2 && request.secondShotAt) return null;

  const { startedKey, seconds } = ROUND_TIMES[round];
  if (isRoundPassed(request, round)) return null;
  return passedSeconds(request[startedKey], seconds, now) ? round : null;
}

const TIMEOUT_REASON_KEYS = { 1: "firstTimeout", 2: "secondTimeout" };

// 회차 시간 초과 실패 이유 { seller, buyer } (시간 초과가 아니면 null)
const getTimeoutReasons = (request, now) => {
  const round = getTimeoutRound(request, now);
  return round ? SESSION_FAIL_REASONS[TIMEOUT_REASON_KEYS[round]] : null;
};

// 화면에 보여줄 상태
// pending 촬영 대기 / success 인증 성공 / failed 인증 실패(판독 실패, 회차 시간 초과) / expired 시간 만료(30분 안에 시작 안 함)
export function getRequestStatus(request, now = Date.now()) {
  if (request.result === "success") return "success";
  if (request.result === "failed" || getTimeoutRound(request, now)) return "failed";
  if (isExpired(request, now)) return "expired";
  return "pending";
}

// 시간 만료 결과 화면 문구
export const getExpiredReason = () => EXPIRED_BUYER_REASON;

// 판매자에게 보낼 링크 (임시 경로)
export const getSellerLink = (id) => `${window.location.origin}/trueshot/seller/${id}`;

// 판매자 송신용 메시지 미리보기 문구
export const getSellerMessage = () => SELLER_MESSAGE;

// 클립보드에 복사할 내용: 안내 문구 + 판매자 링크
export async function copySellerMessage(id) {
  await navigator.clipboard.writeText(`${SELLER_MESSAGE}\n${getSellerLink(id)}`);
}

// 판매자 촬영 사진 2장의 이미지 주소 (아직 없으면 null → 화면에서 회색 자리 표시)
export function getShotPhotos(request) {
  const photos = request.photos ?? [];
  return [0, 1].map((index) => MOCK_PHOTOS[photos[index]] ?? photos[index] ?? null);
}

// 성공 이유 (인증코드 줄에 요청의 코드를 넣음)
export function getSuccessReasons(request) {
  return {
    checks: SUCCESS_REASONS.checks.map((text) => text.replace("{code}", request.code)),
    notes: SUCCESS_REASONS.notes,
  };
}

// localStorage에 예전 표기('첫번째', '두번째')로 저장된 이유를 새 표기로 바꿔서 보여줌 (저장값은 그대로)
const fixOrdinalSpacing = (reasons) =>
  reasons.map((reason) => ({
    ...reason,
    text: reason.text.replace(/첫번째/g, "첫 번째").replace(/두번째/g, "두 번째"),
  }));

// 실패 이유 ({ passed, text } 목록)
// 판정된 이유가 저장돼 있으면 그대로(예전 표기는 새 표기로), 판매자 화면이 닫혀 저장되지 않은 회차 시간 초과는 시각으로 판단
// 둘 다 없는 예전 데이터는 마친 촬영은 체크 + 마지막에 "시간 만료"
export function getFailReasons(request, now = Date.now()) {
  if (request.failReasons) return fixOrdinalSpacing(request.failReasons);

  const timeoutReasons = getTimeoutReasons(request, now);
  if (timeoutReasons) return timeoutReasons.buyer;

  return [
    ...(request.firstShotAt ? [{ passed: true, text: "첫 번째 사진 인증 성공" }] : []),
    ...(request.secondShotAt ? [{ passed: true, text: "두 번째 사진 인증 성공" }] : []),
    { passed: false, text: "시간 만료" },
  ];
}

// 진행 단계 4개 (인증 완료는 성공·실패만 완료, 시간 만료는 '링크 제작 완료'만 체크)
export function getRequestProgress(request, now = Date.now()) {
  return [
    { label: "링크 제작 완료", done: true },
    { label: "판매자의 첫 번째 촬영", done: Boolean(request.firstShotAt) },
    { label: "판매자의 두 번째 촬영", done: Boolean(request.secondShotAt) },
    { label: "인증 완료", done: ["success", "failed"].includes(getRequestStatus(request, now)) },
  ];
}

// ---------- 판매자 ----------

// 요청 일부 값 바꿔서 저장하고, 바뀐 요청을 돌려줌
const updateTrueShotRequest = (id, patch) => {
  let updated = null;
  writeStorage(
    loadRequests().map((request) => {
      if (request.id !== id) return request;
      updated = { ...request, ...patch };
      return updated;
    }),
  );
  return updated;
};

// 판매자가 "인증 시작하기"를 누름: 1차 타이머 시작 + 2차 무작위 지시를 하나 골라 저장
export function startSellerSession(id) {
  return updateTrueShotRequest(id, {
    firstStartedAt: new Date().toISOString(),
    secondMission: SECOND_MISSIONS[Math.floor(Math.random() * SECOND_MISSIONS.length)],
  });
}

// AI 판독 (목업: 항상 통과, forceFail이면 실패 이유와 함께 실패)
// TODO: 판독 API 연동 시 사진을 보내고 결과를 받아오도록 교체
export function judgeSellerShot(request, round, { forceFail = false } = {}) {
  if (!forceFail) return { passed: true, reasons: [] };

  return {
    passed: false,
    reasons: SELLER_FAIL_REASONS[round].map((reason) => ({ ...reason, text: reason.text.replace("{code}", request.code) })),
  };
}

// AI 판독 통과 시각 저장 (결과 전이고 회차 제한 시간 안에 통과했을 때만)
// 저장해 두면 가리기 중에 제한 시간이 지나도 구매자 쪽에서 시간 초과 실패로 보이지 않음
export function markRoundPassed(id, round, now = Date.now()) {
  const request = getTrueShotRequest(id);
  const { startedKey, seconds, passedKey } = ROUND_TIMES[round];
  if (!request || request.result !== null || passedSeconds(request[startedKey], seconds, now)) return request;

  return updateTrueShotRequest(id, { [passedKey]: new Date(now).toISOString() });
}

// 1차 가리기 저장: 가린 사진 1 저장 + 구매자 진행 단계 '첫 번째 촬영' 체크 + 2차 타이머 시작
export function saveFirstShot(id, photo) {
  const now = new Date().toISOString();
  return updateTrueShotRequest(id, { firstShotAt: now, secondStartedAt: now, photos: [photo] });
}

// 최종 실패 저장 (reasons: { seller, buyer } 실패 이유) → 구매자 결과가 '인증 실패'로 바뀜
export function failSellerSession(id, reasons) {
  return updateTrueShotRequest(id, {
    result: "failed",
    failReasons: reasons.buyer,
    sellerFailReasons: reasons.seller,
  });
}

// 판매자 결과 화면의 실패 이유 (저장된 판매자용 이유 → 시각으로 판단한 회차 시간 초과 → 예전 데이터는 구매자용 이유로 대신)
export const getSellerFailReasons = (request, now = Date.now()) =>
  (request.sellerFailReasons && fixOrdinalSpacing(request.sellerFailReasons)) ??
  getTimeoutReasons(request, now)?.seller ??
  getFailReasons(request, now);

// 2차 가리기 후 요청자에게 전송: 가린 사진 2 저장 + '두 번째 촬영'·'인증 완료' 체크 → 구매자 결과 '인증 성공'
export function completeSellerSession(id, photo) {
  const request = getTrueShotRequest(id);
  return updateTrueShotRequest(id, {
    secondShotAt: new Date().toISOString(),
    photos: [request.photos?.[0] ?? null, photo],
    result: "success",
  });
}

// 2차 지시 문구 (예전 데이터는 문구만 문자열로 저장돼 있음)
export const getSecondMissionText = (request) =>
  typeof request.secondMission === "string" ? request.secondMission : (request.secondMission?.text ?? "");
