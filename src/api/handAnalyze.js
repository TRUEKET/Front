// 트루샷 2차 인증 손 인식 로직 모음 (MediaPipe GestureRecognizer)
// 촬영 사진 준비(EXIF 회전 + 축소) → 손 좌표·손 모양 추출 → 2차 사진 제출 POST /s/{token}/photo에 함께 보냄
// 백엔드 명세: TRUEKET/Back docs/hand-analyze-api.md (별도 손 분석 API 없음, 판정은 서버가 사진 + 손 분석으로 함)
import { api } from "./client.js";

// 손 좌표로 보낼 랜드마크 번호: 검지 끝(8) (MediaPipe 손 랜드마크 21개 중, 백엔드 명세 확정)
export const HAND_POINT_INDEX = 8;

// ---------- MediaPipe ----------

// package.json의 @mediapipe/tasks-vision 버전과 같게 유지 (WASM은 CDN에서 같은 버전으로 받음)
const MEDIAPIPE_VERSION = "1.2.0";
const WASM_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

// 한 사진에서 찾을 최대 손 개수 (백엔드는 최대 10개까지 받음)
const MAX_HANDS = 4;

// 손 찾기 기준 점수 (MediaPipe 기본값 0.5)
// 실제 2차 사진은 예매 화면과 함께 찍어 손이 작아서 빈 배열이 많았음 → 0.3으로 완화
// 손이 아닌 것을 잡아도 서버가 브이 점수(0.7)·예매 화면 위치로 다시 판정해서 영향이 작음
const MIN_HAND_DETECTION_CONFIDENCE = 0.3;
const MIN_HAND_PRESENCE_CONFIDENCE = 0.3;

// 브이로 인정하는 점수 (서버 HandMissionEvaluator.MIN_GESTURE_CONFIDENCE와 같게)
export const VICTORY_MIN_SCORE = 0.7;

// 분석·전송 이미지의 긴 쪽 크기(px)
const MAX_IMAGE_SIZE = 1000;
const JPEG_QUALITY = 0.8;

// 손 인식기는 한 번만 만들어 재사용 (실패하면 다음에 다시 시도)
// 인식기(wasm 약 14.5MB + 모델 약 8.4MB)는 2차 사진을 분석할 때 처음 메모리에 올림
// (미리 올려 두면 카메라를 열 때 메모리가 부족해 모바일 브라우저가 페이지를 다시 불러올 수 있음)
// 대신 파일은 prefetchHandModel로 미리 다운로드만 해서 브라우저 캐시에 넣어 둠
let recognizerPromise = null;
let prefetchPromise = null;

const createRecognizer = async () => {
  const { FilesetResolver, GestureRecognizer } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
  return GestureRecognizer.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: "IMAGE",
    numHands: MAX_HANDS,
    minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
    minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
  });
};

const loadRecognizer = () => {
  if (!recognizerPromise) {
    recognizerPromise = createRecognizer().catch((error) => {
      recognizerPromise = null;
      throw error;
    });
  }
  return recognizerPromise;
};

// 응답 본문을 끝까지 읽기만 하고 버림 (브라우저 캐시에 저장되게, 메모리에 모아 두지 않음)
const drainToCache = async (url) => {
  const response = await fetch(url, { cache: "force-cache" });
  const reader = response.body?.getReader();
  if (!reader) return;
  while (!(await reader.read()).done) {
    // 버림
  }
};

// 2차 손 인식 파일(wasm·모델)을 미리 다운로드만 해 둠 (인식기는 만들지 않아 메모리에 올리지 않음)
// 판매자가 안내·1차를 진행하는 동안 호출 → 2차 사진을 찍은 뒤에는 캐시에서 바로 준비돼 시간 부족으로 손 정보가 비는 일을 줄임
export function prefetchHandModel() {
  if (!prefetchPromise) {
    prefetchPromise = (async () => {
      const { FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
      await Promise.all([fileset.wasmLoaderPath, fileset.wasmBinaryPath, MODEL_URL].map(drainToCache));
    })().catch((error) => {
      prefetchPromise = null;
      console.warn("[trueshot-hand] 손 인식 파일 미리 받기 실패 (분석할 때 다시 받음)", error);
    });
  }
  return prefetchPromise;
}

// ---------- 이미지 준비 ----------

// EXIF 회전을 반영해 이미지를 읽음 (createImageBitmap을 못 쓰는 브라우저는 img로 대신, 최신 브라우저는 img도 회전 반영)
const readImage = async (file) => {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

// APP1 구간이 EXIF인지 ("Exif\0\0"로 시작)
const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
const isExifSegment = (bytes, offset, length) =>
  bytes[offset + 1] === 0xe1 && length >= 8 && EXIF_HEADER.every((value, index) => bytes[offset + 4 + index] === value);

// JPEG에서 EXIF(APP1 "Exif") 구간만 뺌 (사진 데이터·다른 구간은 그대로, EXIF가 없으면 받은 Blob 그대로)
// Safari(WebKit)는 canvas.toBlob으로 만든 JPEG에도 EXIF를 새로 붙이는데(Chrome은 안 붙임),
// 백엔드는 EXIF가 남은 2차 사진을 전부 400으로 거절함 (회전은 캔버스에 이미 반영돼 있어 빼도 됨)
export async function removeJpegExif(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return blob;

  const parts = [bytes.subarray(0, 2)];
  let offset = 2;
  let removed = false;
  // 사진 데이터 시작(SOS 0xDA) 전까지의 머리 구간만 확인
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    if (isExifSegment(bytes, offset, length)) removed = true;
    else parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  if (!removed) return blob;
  parts.push(bytes.subarray(offset));
  return new Blob(parts, { type: "image/jpeg" });
}

// 촬영 파일 → EXIF 회전 반영 + 긴 쪽 1000px 캔버스 → EXIF 없는 JPEG
// 이 이미지 하나로 손 분석·전송·가리기를 모두 함 (좌표 기준이 같도록)
export async function prepareShotImage(file) {
  const source = await readImage(file);
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const encoded = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  const blob = await removeJpegExif(encoded);
  return { canvas, blob, dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY) };
}

// ---------- 손 추출 ----------

const clamp = (value, max) => Math.min(Math.max(Math.round(value), 0), max);

// MediaPipe 결과 → 손 목록 (toImage: 0~1 비율 좌표 → 원본 이미지 픽셀 좌표)
const toHands = (result, toImage) =>
  result.landmarks.map((points, index) => {
    const point = toImage(points[HAND_POINT_INDEX]);
    const topGesture = result.gestures[index]?.[0];
    return {
      x: point.x,
      y: point.y,
      gesture: topGesture?.categoryName || "None",
      confidence: Number((topGesture?.score ?? 0).toFixed(3)),
    };
  });

const hasGoodVictory = (hands) => hands.some((hand) => hand.gesture === "Victory" && hand.confidence >= VICTORY_MIN_SCORE);

// 다시 찾을 부분: 사진의 60% 크기 조각 4개(왼쪽 위·오른쪽 위·왼쪽 아래·오른쪽 아래, 서로 겹침)
// 조각을 따로 넣으면 그만큼 확대돼서 작게 찍힌 손도 찾기 쉬움
const TILE_RATIO = 0.6;
const tilesOf = (width, height) => {
  const tileWidth = Math.round(width * TILE_RATIO);
  const tileHeight = Math.round(height * TILE_RATIO);
  return [0, width - tileWidth].flatMap((left) =>
    [0, height - tileHeight].map((top) => ({ left, top, width: tileWidth, height: tileHeight })),
  );
};

// 같은 손이 여러 조각에서 잡히면 하나만 (검지 끝이 이미지 대각선의 5% 안이면 같은 손, 브이·높은 점수 우선)
const mergeHands = (hands, width, height) => {
  const near = Math.hypot(width, height) * 0.05;
  const rank = (hand) => (hand.gesture === "Victory" ? 1 : 0) + hand.confidence;
  return [...hands]
    .sort((a, b) => rank(b) - rank(a))
    .filter((hand, index, sorted) =>
      sorted.slice(0, index).every((kept) => Math.hypot(kept.x - hand.x, kept.y - hand.y) > near),
    )
    .slice(0, MAX_HANDS);
};

// 캔버스에서 손을 전부 찾아 백엔드에 보낼 형식으로 + 진단 정보
// analysis: { imageWidth, imageHeight, hands: [{ x, y, gesture, confidence }] } (x, y는 이미지 픽셀 좌표, 못 찾으면 hands: [])
// diagnostics: { modelMs 인식기 준비 시간, recognizeMs 인식 시간, tiled 조각 재인식 여부, error 오류 내용 }
// 전체 사진에서 손을 못 찾거나 브이 점수가 기준 미만이면 사진을 조각내 한 번 더 찾음
// MediaPipe를 불러오지 못하거나 분석에 실패해도 hands: []로 계속 진행 (판정은 백엔드)
export async function extractHands(canvas) {
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;
  const diagnostics = { modelMs: null, recognizeMs: null, tiled: false, error: null };

  try {
    const startedAt = performance.now();
    const recognizer = await loadRecognizer();
    const readyAt = performance.now();
    diagnostics.modelMs = Math.round(readyAt - startedAt);

    let hands = toHands(recognizer.recognize(canvas), (point) => ({ x: point.x * imageWidth, y: point.y * imageHeight }));
    if (!hasGoodVictory(hands)) {
      diagnostics.tiled = true;
      const tileCanvas = document.createElement("canvas");
      for (const tile of tilesOf(imageWidth, imageHeight)) {
        tileCanvas.width = tile.width;
        tileCanvas.height = tile.height;
        tileCanvas.getContext("2d").drawImage(canvas, tile.left, tile.top, tile.width, tile.height, 0, 0, tile.width, tile.height);
        const found = toHands(recognizer.recognize(tileCanvas), (point) => ({
          x: tile.left + point.x * tile.width,
          y: tile.top + point.y * tile.height,
        }));
        hands = hands.concat(found);
      }
      hands = mergeHands(hands, imageWidth, imageHeight);
    }
    diagnostics.recognizeMs = Math.round(performance.now() - readyAt);

    const analysis = {
      imageWidth,
      imageHeight,
      hands: hands.map((hand) => ({ ...hand, x: clamp(hand.x, imageWidth), y: clamp(hand.y, imageHeight) })),
    };
    return { analysis, diagnostics };
  } catch (error) {
    console.warn("[trueshot-hand] 손 인식 실패, hands: []로 진행", error);
    diagnostics.error = String(error?.message ?? error);
    return { analysis: { imageWidth, imageHeight, hands: [] }, diagnostics };
  }
}

// 손 인식을 정해진 시간 안에만 기다림 (2차는 1분 안에 서버에 도착해야 해서)
// 시간이 없으면(skipped) 건너뛰고, 시간 안에 못 끝나면(timedOut) hands: []로 진행, 판정은 서버가 함
export async function extractHandsWithin(canvas, timeoutMs) {
  const empty = { imageWidth: canvas.width, imageHeight: canvas.height, hands: [] };
  if (timeoutMs <= 0) return { analysis: empty, diagnostics: { skipped: true } };

  let timer = null;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[trueshot-hand] 손 인식이 ${timeoutMs}ms 안에 끝나지 않아 hands: []로 진행`);
      resolve({ analysis: empty, diagnostics: { timedOut: true, waitedMs: timeoutMs } });
    }, timeoutMs);
  });
  try {
    return await Promise.race([extractHands(canvas), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

// 보내기 전 확인: 2차 미션에 맞는 손이 있는지
// → null 통과 / "NO_HANDS" 손 없음 / "LOW_VICTORY" 브이 미션인데 브이 점수가 기준 미만
// 서버 미션: GESTURE·GESTURE_POSITION은 브이 필요, POINT_SCREEN은 손 위치만 봄
export function checkHandsForMission(analysis, mission) {
  if (analysis.hands.length === 0) return "NO_HANDS";
  if (mission?.type !== "POINT_SCREEN" && !hasGoodVictory(analysis.hands)) return "LOW_VICTORY";
  return null;
}

// ---------- 2차 사진 제출 ----------

// multipart 본문 (POST /s/{token}/photo)
// n: 2, photo: 손 분석에 쓴 같은 캔버스의 JPEG, analysis: extractHands 결과 JSON (application/json part)
// multipart 경계값(Content-Type)은 브라우저가 채움
export function buildSecondPhotoForm({ image, analysis }) {
  const form = new FormData();
  form.append("n", "2");
  form.append("photo", image, "photo.jpg");
  form.append("analysis", new Blob([JSON.stringify(analysis)], { type: "application/json" }));
  return form;
}

// 판매자 2차 사진 제출 (판매자 세션 쿠키 + CSRF 토큰은 client.js가 붙임, 실패하면 ApiError)
// 응답: { number, phase, accepted, deadline, retryReasons, checks, failReasons }
// accepted는 접수 여부일 뿐 인증 성공이 아님. phase로 결과 판단
// (SHARE_WAITING·COMPLETED 성공 / FAILED 실패 / JUDGING이면 같은 사진을 다시 보내지 말고 GET /s/{token}/result를 약 2초마다 조회)
// 판매자 화면은 api/trueShot.js의 submitSecondShot을 통해 사용 (목업 모드 분기 포함)
export function submitSecondPhoto(token, { image, analysis }, options) {
  return api.post(`/s/${encodeURIComponent(token)}/photo`, buildSecondPhotoForm({ image, analysis }), options);
}
