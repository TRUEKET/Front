// 신고 종류별 이름과 색 (report 피해 신고 빨강 / suspect 의심 제보 노랑)
// border: 리스트 카드 테두리, bg·color: 종류 배지
export const REPORT_TYPE_STYLE = {
  report: { label: "피해 신고", border: "#ca2317", bg: "#ffdfdf", color: "#a81e14" },
  suspect: { label: "의심 제보", border: "#e0a21c", bg: "#fff4dd", color: "#bf7100" },
};

// 게시 상태 이름
export const REPORT_STATUS_LABEL = {
  private: "비공개",
  posted: "게시 중",
};
