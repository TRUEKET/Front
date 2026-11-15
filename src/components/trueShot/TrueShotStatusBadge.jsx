import styled from "styled-components";

// 상태별 이름과 색 (pending 촬영 대기 노랑 / success 인증 성공 초록 / failed 인증 실패 빨강)
const STATUS_STYLE = {
  pending: { label: "촬영 대기", bg: "#fff4dd", color: "#bf7100" },
  success: { label: "인증 성공", bg: "#d6f7e3", color: "#1d6b43" },
  failed: { label: "인증 실패", bg: "#ffdfdf", color: "#a81e14" },
};

const StyledBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 8px;
  background: ${({ $status }) => STATUS_STYLE[$status].bg};
  border-radius: 5px;
  color: ${({ $status }) => STATUS_STYLE[$status].color};
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
`;

// 트루샷 요청 상태 배지
export default function TrueShotStatusBadge({ status }) {
  return <StyledBadge $status={status}>{STATUS_STYLE[status].label}</StyledBadge>;
}
