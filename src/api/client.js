// 모든 API 요청이 같이 쓰는 공통 요청 함수
// 백엔드는 세션 쿠키 + CSRF 방식이라
// 1) 모든 요청에 쿠키를 포함하고
// 2) POST, PUT, PATCH, DELETE 요청에는 GET /auth/csrf 로 받은 토큰을 헤더에 넣어 보냄

// API 주소 앞부분 (기본값 /api: 개발 서버 프록시가 /api를 떼고 백엔드로 전달)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// CSRF 토큰이 필요한 메서드
const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// 서버가 message를 주지 않았을 때 보여줄 기본 문구
const DEFAULT_ERROR_MESSAGE = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
const NETWORK_ERROR_MESSAGE = "네트워크 연결을 확인해 주세요.";
const STATUS_MESSAGES = {
  401: "로그인이 필요해요.",
  429: "요청이 많아요. 잠시 후 다시 시도해 주세요.",
};

// API 실패 시 던지는 오류 (status: HTTP 상태 코드, 네트워크 오류면 0 / data: 서버가 준 응답 본문)
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// 응답 본문을 형식에 맞게 꺼냄 (204면 null, JSON이면 객체, 이미지면 Blob, 나머지는 글자)
const parseBody = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  if (contentType.startsWith("image/")) return response.blob();

  const text = await response.text();
  return text || null;
};

// 실패 응답을 ApiError로 바꿈 (서버 오류 형식 { message }를 우선 사용)
const toApiError = async (response) => {
  let data = null;
  try {
    data = await parseBody(response);
  } catch {
    // 본문을 읽지 못해도 상태 코드로 처리
  }

  const serverMessage = data && typeof data === "object" ? data.message : null;
  const fallback = response.status >= 500 ? DEFAULT_ERROR_MESSAGE : STATUS_MESSAGES[response.status];
  return new ApiError(response.status, serverMessage || fallback || DEFAULT_ERROR_MESSAGE, data);
};

// fetch 자체가 실패한 경우(서버 꺼짐, 인터넷 끊김)도 ApiError로 통일 (요청 취소는 그대로 던짐)
const send = async (url, init) => {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }
};

// 경로 + 쿼리 → 전체 주소 (값이 없는 쿼리는 뺌)
const buildUrl = (path, query) => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.append(key, value);
  });
  const queryString = params.toString();
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
};

// ---------- CSRF ----------

// 받아온 토큰을 재사용 (동시에 여러 요청이 와도 발급은 한 번만)
let csrfPromise = null;

const fetchCsrfToken = async () => {
  const response = await send(buildUrl("/auth/csrf"), { credentials: "include" });
  if (!response.ok) throw await toApiError(response);

  const { headerName, token } = await response.json();
  return { headerName, token };
};

const getCsrfToken = () => {
  if (!csrfPromise) {
    csrfPromise = fetchCsrfToken().catch((error) => {
      csrfPromise = null;
      throw error;
    });
  }
  return csrfPromise;
};

// 로그인, 회원가입, 로그아웃 성공 후 꼭 호출 (세션이 바뀌어 기존 토큰을 못 씀, 다음 요청 때 새로 받음)
export function resetCsrfToken() {
  csrfPromise = null;
}

// ---------- 요청 ----------

// 공통 요청 함수
// - body: 객체면 JSON으로, FormData면 multipart로 보냄 (multipart 경계값은 브라우저가 채움)
// - query: { q: "010-1234-5678" } 처럼 넘기면 주소 뒤에 붙임
// - 성공하면 응답 본문, 실패하면 ApiError를 던짐
export async function request(path, { method = "GET", query, body, headers, signal } = {}) {
  const upperMethod = method.toUpperCase();
  const needsCsrf = CSRF_METHODS.has(upperMethod);
  const isFormData = body instanceof FormData;
  const url = buildUrl(path, query);

  const sendRequest = async () => {
    const requestHeaders = { ...headers };
    if (body !== undefined && !isFormData) requestHeaders["Content-Type"] = "application/json";
    if (needsCsrf) {
      const { headerName, token } = await getCsrfToken();
      requestHeaders[headerName] = token;
    }

    return send(url, {
      method: upperMethod,
      credentials: "include",
      headers: requestHeaders,
      body: body === undefined || isFormData ? body : JSON.stringify(body),
      signal,
    });
  };

  let response = await sendRequest();

  // 토큰이 만료되거나 세션이 바뀌면 403이 옴 → 토큰을 새로 받아 한 번만 다시 보냄
  if (response.status === 403 && needsCsrf) {
    resetCsrfToken();
    response = await sendRequest();
  }

  if (!response.ok) throw await toApiError(response);
  return parseBody(response);
}

// 메서드별 짧은 이름 (예: api.get("/lookup", { query: { q } }), api.post("/reports", body))
export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
