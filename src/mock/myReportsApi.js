// 내 신고 API 목업 (VITE_USE_MOCK=true일 때 api/myReports.js가 사용)
// 서버와 같은 응답 모양({ code, message, data }의 data 부분)을 돌려줌, 메모리에만 저장 (새로고침하면 처음 목데이터)
import { ApiError } from "../api/client.js";
import { createMockMyReports } from "./myReports.js";

let reports = createMockMyReports();

const findReport = (reportId) => {
  const report = reports.find((item) => item.reportId === Number(reportId));
  if (!report) throw new ApiError(404, "신고 기록을 찾을 수 없습니다.");
  return report;
};

// GET /me/reports → 페이지 (목록 항목에는 근거 문장 없음, 식별자는 있음)
export async function getMyReports() {
  const content = reports.map(({ reportId, kind, status, tradeType, createdAt, disputes, identifiers }) => ({
    reportId,
    kind,
    status,
    tradeType,
    createdAt,
    disputes,
    identifiers,
  }));
  return { content, totalElements: content.length, number: 0, last: true };
}

// GET /me/reports/{reportId}
export async function getMyReport(reportId) {
  return findReport(reportId);
}

// POST /disputes/{disputeId}/decision: MAINTAINED → 게시 중, DELETED → 신고 삭제
export async function decideDispute(disputeId, { reportId, decision }) {
  const report = findReport(reportId);
  const dispute = report.disputes.find((item) => item.disputeId === disputeId);
  if (!dispute?.canRespond) throw new ApiError(409, "이미 처리된 이의제기입니다.");

  if (decision === "DELETED") {
    reports = reports.filter((item) => item.reportId !== report.reportId);
  } else {
    reports = reports.map((item) =>
      item.reportId === report.reportId
        ? {
            ...item,
            status: "PUBLISHED",
            disputes: item.disputes.map((d) =>
              d.disputeId === disputeId ? { ...d, status: "MAINTAINED", canRespond: false } : d,
            ),
          }
        : item,
    );
  }

  return { disputeId, reportId: report.reportId, decision, message: "처리가 완료되었습니다." };
}
