import styled from "styled-components";
import { REPORT_TYPE_STYLE } from "./reportTypeStyle.js";

const StyledBadge = styled.span`
  align-self: flex-start;
  padding: 4px 8px;
  background: ${({ $type }) => REPORT_TYPE_STYLE[$type].bg};
  border-radius: 5px;
  color: ${({ $type }) => REPORT_TYPE_STYLE[$type].color};
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
`;

// 피해 신고 / 의심 제보 배지
export default function ReportTypeBadge({ type }) {
  return <StyledBadge $type={type}>{REPORT_TYPE_STYLE[type].label}</StyledBadge>;
}
