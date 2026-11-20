// 트루샷 API 목업 (VITE_USE_MOCK=true일 때 api/trueShot.js가 사용)
// 서버와 같은 응답 모양 (TRUEKET/Back docs/trueshot-api.md, trueshot-finalization-api.md)
// 요청은 localStorage에 저장 (새로고침·새 탭에서도 같은 요청을 찾을 수 있게), 사진은 data URL
// AI 판정·자동 가림은 흉내만 냄: 1차는 기본 통과, 2차는 3초 뒤 통과 (forceFail이면 실패)
import { ApiError } from "../api/client.js";
import { FIRST_SHOT_SECONDS, MOCK_SECOND_MISSIONS, REQUEST_EXPIRE_MINUTES, SECOND_SHOT_SECONDS } from "./trueShot.js";
import samplePhoto1 from "../assets/images/trueshot_sample_1.png";
import samplePhoto2 from "../assets/images/trueshot_sample_2.png";

const STORAGE_KEY = "trueket_mock_trueshot";
const MINUTE = 60 * 1000;
const JUDGING_MS = 3000;
const POLL_AFTER_MILLIS = 2000;

// 인증코드에 쓰는 글자 (헷갈리는 0·O·1·I는 뺌)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const iso = (ms) => new Date(ms).toISOString();
const absoluteUrl = (url) => new URL(url, window.location.href).href;

// ---------- 저장 ----------

const readStorage = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeStorage = (requests) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // 저장 실패 시 무시 (용량 초과 등)
  }
};

const randomCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
const randomToken = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

// 처음 열었을 때 넣는 요청 3건 (촬영 대기 / 인증 성공 / 인증 실패)
const createSeedRequests = (now = Date.now()) => {
  const base = (id, title, createdAt) => ({
    id,
    title,
    code: randomCode(),
    token: randomToken(),
    status: "PENDING",
    phase: "WAITING",
    createdAt: iso(createdAt),
    expiresAt: iso(createdAt + REQUEST_EXPIRE_MINUTES * MINUTE),
    startedAt: null,
    deadline1: null,
    deadline2: null,
    instruction2: null,
    mission2: null,
    checks: [],
    failReasons: [],
    failureCode: null,
    judgedAt: null,
    photosSharedAt: null,
    photos: {},
  });
  const successAt = Date.parse("2026-10-09T14:26:00+09:00");
  const failedAt = Date.parse("2026-10-01T14:26:00+09:00");
  return [
    base(3, "안녕하세요 댈티", now),
    {
      ...base(2, "요청 1", successAt),
      status: "PASSED",
      phase: "COMPLETED",
      startedAt: iso(successAt + 2 * MINUTE),
      instruction2: MOCK_SECOND_MISSIONS[2].instruction2,
      mission2: MOCK_SECOND_MISSIONS[2].mission2,
      judgedAt: iso(successAt + 10 * MINUTE),
      photosSharedAt: iso(successAt + 11 * MINUTE),
      photos: { 1: { maskStatus: "READY", masked: absoluteUrl(samplePhoto1) }, 2: { maskStatus: "READY", masked: absoluteUrl(samplePhoto2) } },
    },
    {
      ...base(1, "가나다 댈티", failedAt),
      status: "FAILED",
      phase: "FAILED",
      startedAt: iso(failedAt + 2 * MINUTE),
      instruction2: MOCK_SECOND_MISSIONS[0].instruction2,
      mission2: MOCK_SECOND_MISSIONS[0].mission2,
      failureCode: "SECOND_PHOTO_TIMEOUT",
      failReasons: ["두 번째 사진 제출 시간이 지났어요."],
    },
  ];
};

const loadRequests = () => {
  const saved = readStorage();
  if (saved) return saved;
  const initial = createSeedRequests();
  writeStorage(initial);
  return initial;
};

const saveRequest = (updated) => {
  writeStorage(loadRequests().map((request) => (request.id === updated.id ? updated : request)));
  return updated;
};

// ---------- 시간·판정 반영 (서버의 주기 작업을 조회 시점에 흉내) ----------

const fail = (request, failureCode, failReasons) => ({
  ...request,
  status: "FAILED",
  phase: "FAILED",
  failureCode,
  failReasons,
  judgedAt: request.judgedAt ?? iso(Date.now()),
});

const isFinished = (request) => ["COMPLETED", "FAILED"].includes(request.phase);

const refresh = (request, now = Date.now()) => {
  let next = request;
  if (!isFinished(next) && next.phase !== "SHARE_WAITING" && now > Date.parse(next.expiresAt)) {
    next = fail(next, "REQUEST_TIMEOUT", ["인증 링크 기한이 지났어요."]);
  }
  // 성공했지만 판매자가 공유 기한(요청 30분) 안에 사진을 안 보냄 → 서버 closeShareWindow처럼 사진 없이 COMPLETED
  if (next.phase === "SHARE_WAITING" && now > Date.parse(next.expiresAt)) {
    next = { ...next, phase: "COMPLETED" };
  }
  if (next.phase === "FIRST_CHECKING" && now > Date.parse(next.deadline1)) {
    next = fail(next, "FIRST_PHOTO_TIMEOUT", ["첫 번째 사진 제출 시간이 지났어요."]);
  }
  if (next.phase === "SECOND_WAITING" && now > Date.parse(next.deadline2)) {
    next = fail(next, "SECOND_PHOTO_TIMEOUT", ["두 번째 사진 제출 시간이 지났어요."]);
  }
  if (next.phase === "JUDGING" && now >= next.judgingUntil) {
    const passed = !next.forceFail2;
    const checks = [
      ...next.checks.filter((check) => check.photoNumber === 1),
      // 실패 확인용: 2번 사진이 흐리고 미션도 실패 (서버 TrueshotChecks 문구와 같게)
      passed
        ? { photoNumber: 2, code: "PHOTO_QUALITY", status: "PASSED", message: "내용을 알아볼 수 있는 화질이에요." }
        : { photoNumber: 2, code: "PHOTO_QUALITY", status: "FAILED", message: "사진이 흐리거나 내용이 잘 보이지 않아요." },
      passed
        ? { photoNumber: 2, code: "MISSION", status: "PASSED", message: "촬영 미션을 지켰어요." }
        : { photoNumber: 2, code: "MISSION", status: "FAILED", message: "손이 없거나 손 모양·위치가 지시와 일치하지 않아요." },
    ];
    next = passed
      ? { ...next, status: "PASSED", phase: "SHARE_WAITING", checks, judgedAt: iso(now), photos: { ...next.photos, 2: { ...next.photos[2], maskStatus: "READY" } } }
      : {
          ...fail(next, "VERIFICATION_FAILED", [
            "두 번째 사진이 흐리거나 예매 화면의 내용을 확인할 수 없음",
            "두 번째 사진의 손 모양 또는 위치가 지시와 일치하지 않음",
          ]),
          checks,
        };
  }
  return next === request ? request : saveRequest(next);
};

const findById = (id) => {
  const request = loadRequests().find((item) => item.id === Number(id));
  if (!request) throw new ApiError(404, "트루샷 요청을 찾을 수 없어요.");
  return refresh(request);
};

const findByToken = (token) => {
  const request = loadRequests().find((item) => item.token === token);
  if (!request) throw new ApiError(404, "트루샷 링크를 찾을 수 없어요.");
  return refresh(request);
};

// ---------- 응답 만들기 ----------

// 목록 항목 (서버 RequestSummary와 같게 photosSharedAt 포함, 공유 전·공유 없이 종료면 null)
const summary = ({ id, title, status, phase, createdAt, expiresAt, failureCode, photosSharedAt }) => ({
  id,
  title,
  status,
  phase,
  createdAt,
  expiresAt,
  failureCode,
  photosSharedAt: photosSharedAt ?? null,
});

const detail = (request) => ({
  ...summary(request),
  code: request.code,
  sellerPath: `/s/${request.token}`,
  instruction2: request.instruction2,
  mission2: request.mission2,
  startedAt: request.startedAt,
  deadline1: request.deadline1,
  deadline2: request.deadline2,
  photosSharedAt: request.photosSharedAt,
  failReasons: request.failReasons,
  judgedAt: request.judgedAt,
  judgmentResult: null,
  serverTime: iso(Date.now()),
  photos:
    request.status === "PASSED" && request.photosSharedAt
      ? [1, 2].map((number) => ({ number, url: request.photos[number]?.masked })).filter((photo) => photo.url)
      : [],
});

const activeDeadline = (request) => {
  if (request.phase === "FIRST_CHECKING") return request.deadline1;
  if (request.phase === "SECOND_WAITING") return request.deadline2;
  if (request.phase === "JUDGING") return iso(request.judgingUntil + 60 * 1000);
  if (["FIRST_MASKING", "SHARE_WAITING"].includes(request.phase)) return request.expiresAt;
  return null;
};

const sellerResult = (request) => {
  const now = Date.now();
  const deadline = activeDeadline(request);
  const previewable = request.phase === "FIRST_MASKING" ? [1] : request.phase === "SHARE_WAITING" ? [1, 2] : [];
  return {
    status: request.status,
    phase: request.phase,
    judgedAt: request.judgedAt,
    photosSharedAt: request.photosSharedAt,
    canShare: request.phase === "SHARE_WAITING",
    message: request.phase === "JUDGING" ? "사진을 확인하고 있어요." : "",
    checks: request.checks,
    failReasons: request.failReasons,
    judgmentDeadline: request.phase === "JUDGING" ? deadline : null,
    pollAfterMillis: request.phase === "JUDGING" ? POLL_AFTER_MILLIS : null,
    failureCode: request.failureCode,
    title: request.title,
    code: request.code,
    instruction2: request.instruction2,
    mission2: request.mission2,
    expiresAt: request.expiresAt,
    deadline1: request.deadline1,
    deadline2: request.deadline2,
    serverTime: iso(now),
    photos: Object.entries(request.photos).map(([number, photo]) => ({
      number: Number(number),
      maskStatus: photo.maskStatus,
      previewPath: previewable.includes(Number(number)) && photo.maskStatus === "READY" ? photo.masked : null,
    })),
    activeDeadline: deadline,
    remainingMillis: deadline ? Math.max(0, Date.parse(deadline) - now) : null,
  };
};

// ---------- 사진 처리 ----------

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// 사진 위에 가림 사각형(0~1 비율)을 검정으로 칠한 JPEG data URL
const paintBoxes = (photoUrl, boxes) =>
  new Promise((resolve, reject) => {
    if (boxes.length === 0) {
      resolve(photoUrl);
      return;
    }
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      ctx.fillStyle = "#000000";
      boxes.forEach(({ x, y, width, height }) =>
        ctx.fillRect(x * canvas.width, y * canvas.height, width * canvas.width, height * canvas.height),
      );
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = reject;
    image.src = photoUrl;
  });

// ---------- 구매자 ----------

export async function createRequest({ title } = {}) {
  const requests = loadRequests();
  const now = Date.now();
  const id = Math.max(0, ...requests.map((request) => request.id)) + 1;
  const request = {
    ...createSeedRequests(now)[0],
    id,
    title: title?.trim() || `요청 ${requests.length + 1}`,
    code: randomCode(),
    token: randomToken(),
  };
  writeStorage([request, ...requests]);
  return detail(request);
}

export async function listRequests() {
  return loadRequests()
    .map((request) => refresh(request))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(summary);
}

export async function getRequest(id) {
  return detail(findById(id));
}

// PATCH /trueshot/{id}: 제목 수정 (필수, 앞뒤 공백 제거, 공백만·20자 초과는 400, 진행·완료·만료 상태에서도 가능)
export async function updateTitle(id, { title }) {
  const request = findById(id);
  const trimmed = (title ?? "").trim();
  if (!trimmed || trimmed.length > 20) throw new ApiError(400, "제목은 1~20자로 입력해 주세요.");
  return detail(saveRequest({ ...request, title: trimmed }));
}

// ---------- 판매자 ----------

export async function getSellerLink(token) {
  const request = findByToken(token);
  if (request.failureCode === "REQUEST_TIMEOUT" || Date.now() > Date.parse(request.expiresAt)) {
    throw new ApiError(410, "인증 링크 기한이 지났어요.");
  }
  if (request.phase !== "WAITING") throw new ApiError(409, "이미 시작된 링크예요.");
  return { title: request.title, expiresAt: request.expiresAt };
}

export async function startSeller(token, { sellerConsented }) {
  if (!sellerConsented) throw new ApiError(400, "사진 전달에 동의해 주세요.");
  await getSellerLink(token);
  const request = findByToken(token);
  const now = Date.now();
  const mission = MOCK_SECOND_MISSIONS[Math.floor(Math.random() * MOCK_SECOND_MISSIONS.length)];
  const started = saveRequest({
    ...request,
    status: "IN_PROGRESS",
    phase: "FIRST_CHECKING",
    startedAt: iso(now),
    deadline1: iso(now + FIRST_SHOT_SECONDS * 1000),
    pendingMission: mission,
  });
  return { title: started.title, code: started.code, deadline1: started.deadline1, expiresAt: started.expiresAt };
}

// 판매자 세션 결과 (목업은 브라우저 구분 없이 시작한 요청이면 응답, 시작 전이면 403)
export async function getResult(token) {
  const request = findByToken(token);
  if (request.phase === "WAITING") throw new ApiError(403, "인증을 시작한 브라우저에서만 확인할 수 있어요.");
  return sellerResult(request);
}

// POST /s/{token}/photo: n=1 인증코드 사진 / n=2 미션 사진(+ analysis)
export async function submitPhoto(token, { number, photo, forceFail = false }) {
  const request = findByToken(token);
  const now = Date.now();

  if (number === 1) {
    if (request.phase !== "FIRST_CHECKING") throw new ApiError(409, "첫 번째 촬영 단계가 아니에요.");
    if (forceFail) {
      const checks = [
        { photoNumber: 1, code: "PHOTO_QUALITY", status: "PASSED", message: "내용을 알아볼 수 있는 화질이에요." },
        { photoNumber: 1, code: "AUTH_CODE", status: "FAILED", message: "인증코드가 일치하지 않아요." },
      ];
      return { number: 1, phase: "FIRST_CHECKING", accepted: false, deadline: request.deadline1, retryReasons: ["인증코드가 잘 보이게 다시 찍어 주세요"], checks, failReasons: ["인증코드가 일치하지 않아요."] };
    }
    const checks = [
      { photoNumber: 1, code: "PHOTO_QUALITY", status: "PASSED", message: "내용을 알아볼 수 있는 화질이에요." },
      { photoNumber: 1, code: "AUTH_CODE", status: "PASSED", message: "인증코드가 일치해요." },
    ];
    const original = await blobToDataUrl(photo);
    saveRequest({ ...request, phase: "FIRST_MASKING", checks, photos: { 1: { maskStatus: "PENDING", original } } });
    return { number: 1, phase: "FIRST_MASKING", accepted: true, deadline: null, retryReasons: [], checks, failReasons: [] };
  }

  if (request.phase !== "SECOND_WAITING") throw new ApiError(409, "두 번째 촬영 단계가 아니에요.");
  const original = await blobToDataUrl(photo);
  const judgingUntil = now + JUDGING_MS;
  saveRequest({ ...request, phase: "JUDGING", judgingUntil, forceFail2: forceFail, photos: { ...request.photos, 2: { maskStatus: "PENDING", original, masked: original } } });
  return { number: 2, phase: "JUDGING", accepted: true, deadline: iso(judgingUntil + 60 * 1000), retryReasons: [], checks: [], failReasons: [] };
}

// POST /s/{token}/mask: 목업은 자동 가림 없이 원본을 미리보기로
export async function autoMask(token) {
  const request = findByToken(token);
  if (request.phase !== "FIRST_MASKING") throw new ApiError(409, "가림 단계가 아니에요.");
  const photo = { ...request.photos[1], maskStatus: "READY", masked: request.photos[1].original };
  saveRequest({ ...request, photos: { ...request.photos, 1: photo } });
  return { maskStatus: "READY", previewPath: photo.masked, message: "가린 사진을 확인하고 필요하면 더 가려 주세요." };
}

// POST /s/{token}/first-mask/confirm: 추가 가림 반영 + 2차 미션 공개, 1분 타이머 시작
export async function confirmFirstMask(token, { boxes }) {
  const request = findByToken(token);
  if (request.phase !== "FIRST_MASKING") throw new ApiError(409, "가림 단계가 아니에요.");
  const now = Date.now();
  const masked = request.photos[1]?.masked ? await paintBoxes(request.photos[1].masked, boxes) : null;
  const mission = request.pendingMission ?? MOCK_SECOND_MISSIONS[0];
  const updated = saveRequest({
    ...request,
    phase: "SECOND_WAITING",
    instruction2: mission.instruction2,
    mission2: mission.mission2,
    deadline2: iso(Math.min(now + SECOND_SHOT_SECONDS * 1000, Date.parse(request.expiresAt))),
    photos: { ...request.photos, 1: { ...request.photos[1], masked } },
  });
  return { instruction2: updated.instruction2, mission2: updated.mission2, deadline2: updated.deadline2, expiresAt: updated.expiresAt };
}

// POST /s/{token}/share: 2번 사진 추가 가림 + 공유 동의 → COMPLETED
export async function share(token, { sharePhotos, boxes }) {
  const request = findByToken(token);
  if (request.phase !== "SHARE_WAITING") throw new ApiError(409, "공유 단계가 아니에요.");
  const masked = await paintBoxes(request.photos[2].masked, boxes);
  const updated = saveRequest({
    ...request,
    phase: "COMPLETED",
    photosSharedAt: sharePhotos ? iso(Date.now()) : null,
    photos: { ...request.photos, 2: { ...request.photos[2], masked } },
  });
  return sellerResult(updated);
}
