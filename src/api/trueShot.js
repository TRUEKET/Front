// 트루샷 요청 관련 로직 모음
// TODO: 트루샷 API 연동 시 각 함수 안쪽만 실제 요청으로 바꾸면 됨 (화면은 이 파일의 함수만 사용)
// 지금은 목업: 요청 목록을 localStorage에 저장 (새로고침·새 탭에서도 같은 요청을 찾을 수 있게)
import {
  MOCK_MY_PHONE_LAST4,
  REQUEST_EXPIRE_MINUTES,
  SELLER_MESSAGE,
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

// 트루샷 헤더에 보여줄 내 전화번호 뒷자리
export function getMyPhoneLast4() {
  return MOCK_MY_PHONE_LAST4;
}

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

// 결과 전인데 만료 시간이 지났는지
export const isExpired = (request, now = Date.now()) =>
  request.result === null && now > new Date(request.expiresAt).getTime();

// 화면에 보여줄 상태 (pending 촬영 대기 / success 인증 성공 / failed 인증 실패, 만료도 실패)
export function getRequestStatus(request, now = Date.now()) {
  if (request.result === "success") return "success";
  if (request.result === "failed" || isExpired(request, now)) return "failed";
  return "pending";
}

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

// 진행 단계 4개 (인증 완료는 성공·실패·만료 모두 완료로 봄)
export function getRequestProgress(request, now = Date.now()) {
  return [
    { label: "링크 제작 완료", done: true },
    { label: "판매자의 첫번째 촬영", done: Boolean(request.firstShotAt) },
    { label: "판매자의 두번째 촬영", done: Boolean(request.secondShotAt) },
    { label: "인증 완료", done: getRequestStatus(request, now) !== "pending" },
  ];
}
