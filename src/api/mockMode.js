// 목업 전환: .env.local에 VITE_USE_MOCK=true를 넣으면 서버 없이 목업으로 동작
// 각 api 파일이 함수 안에서 목업과 실제 요청을 나눔 (화면 코드는 그대로)
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
