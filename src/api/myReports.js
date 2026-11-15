// 내 신고 리스트 관련 로직 모음
// TODO: API 연동 시 각 함수 안쪽만 실제 요청으로 바꾸면 됨 (화면은 이 파일의 함수만 사용)
// 지금은 목업: 메모리에만 들고 있어서 새로고침하면 처음 목데이터로 돌아감
import { MOCK_MY_REPORTS } from "../mock/myReports.js";
import { getCurrentUser, getPhoneLast4 } from "./auth.js";

let reports = MOCK_MY_REPORTS;

// 리스트 상단에 보여줄 내 전화번호 뒷자리 (로그인 사용자, 비로그인이면 빈 값)
export function getMyPhoneLast4() {
  return getPhoneLast4(getCurrentUser()?.phone);
}

export function getMyReports() {
  return reports;
}

// 없는 id(삭제됨 등)면 null
export function getMyReport(id) {
  return reports.find((report) => report.id === id) ?? null;
}

// 이의제기 결정: 유지 → 게시 중으로 바뀌고 이의제기 내역은 정리됨
export function keepReport(id) {
  reports = reports.map((report) =>
    report.id === id ? { ...report, status: "posted", reason: null, dispute: null } : report,
  );
}

// 이의제기 결정: 삭제 → 리스트에서 빠짐
export function deleteReport(id) {
  reports = reports.filter((report) => report.id !== id);
}
