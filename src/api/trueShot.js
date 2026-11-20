// 트루샷 요청 관련 로직 모음 (화면은 이 파일의 함수만 사용)
// 백엔드 명세: TRUEKET/Back docs/trueshot-api.md, trueshot-finalization-api.md
// 구매자 API는 로그인 필요, 판매자는 로그인 없이 링크 token + 시작한 브라우저 세션으로 진행
// 시간 판정은 서버 기준 (failureCode·마감 시각·remainingMillis)
// VITE_USE_MOCK=true면 mock/trueShotApi.js(localStorage 목업)로, 아니면 실제 서버로 요청
import { api } from "./client.js";
import { USE_MOCK } from "./mockMode.js";
import * as mockTrueShot from "../mock/trueShotApi.js";
import { submitSecondPhoto } from "./handAnalyze.js";
import {
  BUYER_PHOTO_NOT_SENT_REASONS,
  BUYER_TIMEOUT_REASONS,
  EXPIRED_BUYER_REASON,
  FIRST_PHOTO_PASSED_REASON,
  SELLER_CHECK_TEXTS,
  SELLER_PHOTO_NOT_SENT_REASONS,
  SELLER_MESSAGE,
  SELLER_TIMEOUT_REASONS,
  SUCCESS_REASONS,
} from "../mock/trueShot.js";

// 서버가 주는 상대 경로(/trueshot/1/photos/1, /s/{token}/preview/1)를 요청 주소로 (client.js와 같은 기본 주소)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const toApiUrl = (path) => (!path ? null : /^(https?:|data:)/.test(path) ? path : `${API_BASE_URL}${path}`);

// ---------- 구매자: 상태 ----------

// 화면 상태: pending 촬영 대기 / success 인증 성공 / failed 인증 실패 / expired 시간 만료
// 목록·상세 응답 모두 failureCode가 있어 시간 만료(REQUEST_TIMEOUT)를 목록 배지에서도 구분
// 서버는 2차 판정 통과 시 바로 PASSED + SHARE_WAITING, 판매자가 사진을 가리고 보내면(또는 공유 기한이 지나면) COMPLETED
// → 구매자에게는 판매자가 사진을 보낸 뒤에 인증 성공을 보여주도록 SHARE_WAITING까지는 진행 중으로 처리
// → 사진 없이 COMPLETED(공유 기한 지남·자동 가림 불확실로 공유 불가)면 사진을 못 받았으니 인증 실패
const isPhotoNotSent = ({ status, phase, photosSharedAt, photos }) =>
  status === "PASSED" && phase === "COMPLETED" && photosSharedAt === null && !photos?.length;

const toStatus = (request) => {
  const { status, phase, failureCode } = request;
  if (status === "PASSED") {
    if (phase === "SHARE_WAITING") return "pending";
    return isPhotoNotSent(request) ? "failed" : "success";
  }
  if (status === "FAILED") return failureCode === "REQUEST_TIMEOUT" ? "expired" : "failed";
  return "pending";
};

// 판매자 진행 단계 (phase 순서)
const PHASE_ORDER = ["WAITING", "FIRST_CHECKING", "FIRST_MASKING", "SECOND_WAITING", "JUDGING", "SHARE_WAITING", "COMPLETED"];
const reached = (phase, target) => PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target);

// 실패로 끝난 요청은 phase가 FAILED라 failureCode로 어디까지 했는지 판단
const FAILED_FIRST_DONE = ["SECOND_PHOTO_TIMEOUT", "ANALYSIS_TIMEOUT", "VERIFICATION_FAILED"];
const FAILED_SECOND_DONE = ["ANALYSIS_TIMEOUT", "VERIFICATION_FAILED"];

// 진행 단계 4개 (시간 만료는 '링크 제작 완료'만 체크)
// '인증 완료'는 화면 상태가 인증 성공일 때만 체크 (실패·판매자 사진 전송 전에 켜면 성공처럼 보임)
const toProgress = (request) => {
  const { phase, status, failureCode } = request;
  const failed = status === "FAILED";
  const expired = failureCode === "REQUEST_TIMEOUT";
  return [
    { label: "링크 제작 완료", done: true },
    {
      label: "판매자의 첫 번째 촬영",
      done: !expired && (failed ? FAILED_FIRST_DONE.includes(failureCode) : reached(phase, "FIRST_MASKING")),
    },
    {
      label: "판매자의 두 번째 촬영",
      done: !expired && (failed ? FAILED_SECOND_DONE.includes(failureCode) : reached(phase, "JUDGING")),
    },
    { label: "인증 완료", done: toStatus(request) === "success" },
  ];
};

// 구매자 실패 이유 ({ passed, text } 목록)
// 촬영 시간 초과는 기획 확정 문구, 판정 실패는 첫 사진 통과 + 서버 failReasons
const toBuyerFailReasons = (request) => {
  const { failureCode, failReasons = [] } = request;
  if (isPhotoNotSent(request)) return BUYER_PHOTO_NOT_SENT_REASONS;
  if (BUYER_TIMEOUT_REASONS[failureCode]) return BUYER_TIMEOUT_REASONS[failureCode];
  const reasons = failReasons.map((text) => ({ passed: false, text }));
  return FAILED_FIRST_DONE.includes(failureCode) ? [FIRST_PHOTO_PASSED_REASON, ...reasons] : reasons;
};

// 판매자 링크 (서버 sellerPath /s/{token} → 프론트 판매자 화면 /trueshot/seller/{token})
const toSellerLink = (sellerPath = "") => `${window.location.origin}/trueshot/seller/${sellerPath.split("/").pop()}`;

// 목록 한 줄
const toRequestSummary = (request) => ({
  id: request.id,
  name: request.title,
  createdAt: request.createdAt,
  expiresAt: request.expiresAt,
  status: toStatus(request),
});

// 상세·결과 화면 데이터
const toRequestDetail = (request) => {
  const status = toStatus(request);
  const photos = new Map((request.photos ?? []).map((photo) => [photo.number, toApiUrl(photo.url)]));
  return {
    ...toRequestSummary(request),
    code: request.code,
    sellerLink: toSellerLink(request.sellerPath),
    status,
    phase: request.phase,
    instruction2: request.instruction2 ?? "",
    progress: toProgress(request),
    failReasons: status === "failed" ? toBuyerFailReasons(request) : [],
    // 공유된 가림 사진 2장 (공유 전·거절이면 null → 회색 자리)
    photos: [photos.get(1) ?? null, photos.get(2) ?? null],
  };
};

// ---------- 구매자: API ----------

// GET /trueshot/{id} 원본 응답
const fetchRequest = (id, options) => (USE_MOCK ? mockTrueShot.getRequest(id) : api.get(`/trueshot/${id}`, options));

// 목록 응답에는 사진 공유 여부(photosSharedAt·photos)가 없어서, 성공으로 끝난 요청(PASSED + COMPLETED)만
// 상세를 한 번 더 불러와 사진을 받았는지 확인 (받지 못했으면 목록 배지도 인증 실패)
// TODO: 백엔드 목록 응답에 photosSharedAt이 생기면 이 추가 요청 없애기
const withShareInfo = async (request, options) => {
  if (request.status !== "PASSED" || request.phase !== "COMPLETED") return request;
  try {
    const { photosSharedAt, photos } = await fetchRequest(request.id, options);
    return { ...request, photosSharedAt, photos };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    // 확인 실패면 목록 응답 그대로 (인증 성공)
    return request;
  }
};

// GET /trueshot → 최신 순 목록
export async function getTrueShotRequests(options) {
  const requests = USE_MOCK ? await mockTrueShot.listRequests() : await api.get("/trueshot", options);
  const checked = await Promise.all(requests.map((request) => withShareInfo(request, options)));
  return checked.map(toRequestSummary);
}

// POST /trueshot → 새 요청 (이름은 서버가 "요청 N"으로 정함)
export async function createTrueShotRequest() {
  const request = USE_MOCK ? await mockTrueShot.createRequest({}) : await api.post("/trueshot", {});
  return toRequestDetail(request);
}

// GET /trueshot/{id} → 상세 (다른 사람의 요청·없는 요청은 404 ApiError)
export async function getTrueShotRequest(id, options) {
  return toRequestDetail(await fetchRequest(id, options));
}

// PATCH /trueshot/{id} → 제목 수정 후 상세 (제목 필수·최대 20자·공백만 불가는 400, 앞뒤 공백은 서버가 제거)
export async function renameTrueShotRequest(id, title) {
  const body = { title };
  const request = USE_MOCK ? await mockTrueShot.updateTitle(id, body) : await api.patch(`/trueshot/${id}`, body);
  return toRequestDetail(request);
}

// 판매자 송신용 메시지 미리보기 문구
export const getSellerMessage = () => SELLER_MESSAGE;

// 판매자에게 보낼 내용(안내 문구 + 판매자 링크) 전송
// 공유 기능이 있으면(iOS·안드로이드 등) 공유 시트로, 없으면 클립보드에 복사 → "shared" / "copied" / "cancelled"
export async function sendSellerMessage(request) {
  const text = `${SELLER_MESSAGE}\n${request.sellerLink}`;
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      // 사용자가 공유 시트를 닫음
      if (error.name === "AbortError") return "cancelled";
      // 그 외(권한 등)로 공유가 안 되면 복사로 대신
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

// 성공 이유 (인증코드 줄에 요청의 코드를 넣음)
export function getSuccessReasons(request) {
  return {
    checks: SUCCESS_REASONS.checks.map((text) => text.replace("{code}", request.code)),
    notes: SUCCESS_REASONS.notes,
  };
}

// 시간 만료 결과 화면 문구
export const getExpiredReason = () => EXPIRED_BUYER_REASON;

// ---------- 판매자: 화면 데이터 ----------

// 판매자 체크 항목 → { passed, text } (피그마 문구, 모르는 코드·상태는 서버 message, 대기·미확인은 뺌)
export const toSellerReasons = (checks = [], code = "") =>
  checks
    .filter((check) => check.status === "PASSED" || check.status === "FAILED")
    .map((check) => ({
      passed: check.status === "PASSED",
      text: (SELLER_CHECK_TEXTS[check.code]?.[check.status] ?? check.message).replace("{code}", code),
    }));

// 판매자 최종 실패 이유: 시간 초과는 피그마 문구, 판정 실패는 체크 항목, 그 외는 서버 failReasons
// 체크 항목은 두 사진 결과가 같이 와서(1번 화질 통과 + 2번 흐림 등) 그대로 나열하면 모순처럼 보임
// → 구매자 결과 화면처럼 1번 사진이 모두 통과면 '첫 번째 사진 인증 성공' 한 줄 + 2번 사진 실패 이유
// 2번 사진 체크에 실패 항목이 없으면(예매 화면 못 찾음·분석 시간 초과 등은 NOT_CHECKED) 서버 failReasons를 이유로 씀
const toSellerFailReasons = (result) => {
  if (SELLER_TIMEOUT_REASONS[result.failureCode]) return SELLER_TIMEOUT_REASONS[result.failureCode];
  const checks = result.checks ?? [];
  const firstChecks = checks.filter((check) => check.photoNumber === 1);
  const firstPassed = firstChecks.length > 0 && firstChecks.every((check) => check.status === "PASSED");
  const firstReasons = firstPassed ? [FIRST_PHOTO_PASSED_REASON] : toSellerReasons(firstChecks, result.code);
  const secondFailed = toSellerReasons(
    checks.filter((check) => check.photoNumber === 2 && check.status === "FAILED"),
    result.code,
  );
  const secondReasons =
    secondFailed.length > 0 ? secondFailed : (result.failReasons ?? []).map((text) => ({ passed: false, text }));
  return [...firstReasons, ...secondReasons];
};

// 판매자 결과(GET /s/{token}/result 등) → 화면 데이터
// deadline: 현재 단계 마감 시각(ms, 이 브라우저 시계 기준, remainingMillis로 계산), pollAfter: 판정 중 다시 조회할 간격(ms)
// 판매자가 2차까지 통과했지만 사진을 보내지 않고 끝남 (공유 기한 지남·공유 불가) → 판매자 화면도 인증 실패
const isSellerPhotoNotSent = ({ status, phase, photosSharedAt }) =>
  status === "PASSED" && phase === "COMPLETED" && photosSharedAt === null;

const toSellerSession = (result) => ({
  ...result,
  photoNotSent: isSellerPhotoNotSent(result),
  deadline: result.remainingMillis === null || result.remainingMillis === undefined ? null : Date.now() + result.remainingMillis,
  pollAfter: result.pollAfterMillis ?? null,
  previews: Object.fromEntries((result.photos ?? []).map((photo) => [photo.number, toApiUrl(photo.previewPath)])),
  failReasonList: isSellerPhotoNotSent(result)
    ? SELLER_PHOTO_NOT_SENT_REASONS
    : result.status === "FAILED"
      ? toSellerFailReasons(result)
      : [],
});

// ---------- 판매자: API ----------

// GET /s/{token}/result (시작한 브라우저 세션이 아니면 403)
export async function getSellerSession(token) {
  const result = USE_MOCK ? await mockTrueShot.getResult(token) : await api.get(`/s/${token}/result`);
  return toSellerSession(result);
}

// 판매자 화면 진입: 시작한 세션이면 결과(진행 상태), 시작 전이면 안내 정보
// → { started: true, session } / { started: false, link: { title, expiresAt } }
// 없는 링크 404, 다른 브라우저에서 이미 시작 409, 기한 지남 410 (ApiError)
export async function enterSellerSession(token) {
  try {
    return { started: true, session: await getSellerSession(token) };
  } catch (error) {
    if (error.status !== 403) throw error;
  }
  const link = USE_MOCK ? await mockTrueShot.getSellerLink(token) : await api.get(`/s/${token}`);
  return { started: false, link };
}

// POST /s/{token}/start: 사진 전달 동의 + 첫 촬영 3분 타이머 시작
export async function startSellerSession(token) {
  const body = { sellerConsented: true };
  if (USE_MOCK) await mockTrueShot.startSeller(token, body);
  else await api.post(`/s/${token}/start`, body);
  return getSellerSession(token);
}

// POST /s/{token}/photo (n=1): 통과면 accepted, 재촬영이면 accepted false + 체크 항목
// → { passed, reasons } (reasons: 판매자 화면 문구)
export async function submitFirstShot(token, { image, code, forceFail = false }) {
  let response;
  if (USE_MOCK) {
    response = await mockTrueShot.submitPhoto(token, { number: 1, photo: image, forceFail });
  } else {
    const form = new FormData();
    form.append("n", "1");
    form.append("photo", image, "photo.jpg");
    response = await api.post(`/s/${token}/photo`, form);
  }
  const reasons = toSellerReasons(response.checks, code);
  const failReasons = reasons.some((reason) => !reason.passed)
    ? reasons
    : (response.retryReasons ?? []).map((text) => ({ passed: false, text }));
  return { passed: response.accepted, reasons: response.accepted ? reasons : failReasons };
}

// POST /s/{token}/mask: 첫 사진 자동 가림 → { maskStatus, previewUrl } (FAILED면 previewUrl null)
export async function requestAutoMask(token) {
  const result = USE_MOCK ? await mockTrueShot.autoMask(token) : await api.post(`/s/${token}/mask`);
  return { maskStatus: result.maskStatus, previewUrl: toApiUrl(result.previewPath) };
}

// POST /s/{token}/first-mask/confirm: 판매자가 더 가린 영역(boxes) 저장 + 두 번째 미션 공개
export async function confirmFirstMask(token, boxes) {
  const body = { boxes };
  if (USE_MOCK) await mockTrueShot.confirmFirstMask(token, body);
  else await api.post(`/s/${token}/first-mask/confirm`, body);
  return getSellerSession(token);
}

// POST /s/{token}/photo (n=2, MediaPipe 손 분석 포함) → 접수 후 결과 다시 조회 (JUDGING이면 화면이 계속 조회)
export async function submitSecondShot(token, { image, analysis, forceFail = false }) {
  if (USE_MOCK) await mockTrueShot.submitPhoto(token, { number: 2, photo: image, forceFail });
  else await submitSecondPhoto(token, { image, analysis });
  return getSellerSession(token);
}

// POST /s/{token}/share: 2번 사진 추가 가림 + 사진 공유 (시작할 때 받은 전달 동의로 sharePhotos: true)
export async function shareSellerPhotos(token, boxes) {
  const body = { sharePhotos: true, boxes };
  const result = USE_MOCK ? await mockTrueShot.share(token, body) : await api.post(`/s/${token}/share`, body);
  return toSellerSession(result);
}
