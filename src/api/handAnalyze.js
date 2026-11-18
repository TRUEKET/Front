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

// 손 찾기 기준 점수 (MediaPipe 기본값 0.5). 사진 속 손이 작으면 못 찾을 수 있어
// 실제 촬영 사진으로 확인하며 조정 (낮추면 더 잘 찾지만 손이 아닌 것도 잡을 수 있음)
const MIN_HAND_DETECTION_CONFIDENCE = 0.5;
const MIN_HAND_PRESENCE_CONFIDENCE = 0.5;

// 분석·전송 이미지의 긴 쪽 크기(px)
const MAX_IMAGE_SIZE = 1000;
const JPEG_QUALITY = 0.8;

// 손 인식기는 한 번만 만들어 재사용 (실패하면 다음에 다시 시도)
// 라이브러리는 필요할 때만 불러와서 다른 화면 번들 크기에 영향 없게 함
let recognizerPromise = null;

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

// 모델을 미리 불러둠 (첫 로드가 몇 초 걸려서 2차 지시 화면에 들어갈 때 호출)
export function preloadHandRecognizer() {
  loadRecognizer().catch(() => {
    // 미리 불러오기 실패는 무시 (분석할 때 다시 시도)
  });
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

// 촬영 파일 → EXIF 회전 반영 + 긴 쪽 1000px 캔버스
// 이 이미지 하나로 손 분석·전송·가리기를 모두 함 (좌표 기준이 같도록)
export async function prepareShotImage(file) {
  const source = await readImage(file);
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  return { canvas, blob, dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY) };
}

// ---------- 손 추출 ----------

const clamp = (value, max) => Math.min(Math.max(Math.round(value), 0), max);

// 캔버스에서 손을 전부 찾아 백엔드에 보낼 형식으로
// { imageWidth, imageHeight, hands: [{ x, y, gesture, confidence }] } (x, y는 이미지 픽셀 좌표, 못 찾으면 hands: [])
// MediaPipe를 불러오지 못하거나 분석에 실패해도 hands: []로 계속 진행 (판정은 백엔드)
export async function extractHands(canvas) {
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;

  try {
    const recognizer = await loadRecognizer();
    const result = recognizer.recognize(canvas);
    const hands = result.landmarks.map((points, index) => {
      const point = points[HAND_POINT_INDEX];
      const topGesture = result.gestures[index]?.[0];
      return {
        x: clamp(point.x * imageWidth, imageWidth),
        y: clamp(point.y * imageHeight, imageHeight),
        gesture: topGesture?.categoryName || "None",
        confidence: Number((topGesture?.score ?? 0).toFixed(3)),
      };
    });
    return { imageWidth, imageHeight, hands };
  } catch (error) {
    console.warn("손 인식 실패, hands: []로 진행", error);
    return { imageWidth, imageHeight, hands: [] };
  }
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
