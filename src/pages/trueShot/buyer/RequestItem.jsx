import styled from "styled-components";
import TrueShotStatusBadge from "../../../components/trueShot/TrueShotStatusBadge.jsx";
import { formatDateTime, formatTime } from "../../../utils/dateFormat.js";

// 흰 카드 + 연보라 테두리: 왼쪽 이름·날짜, 오른쪽 상태 배지
const StyledItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid #cac0f2;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: #191919;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
  cursor: pointer;
`;

const StyledInfo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledName = styled.span`
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 요청 시각 + (촬영 대기일 때만) 요청 만료 예정 시각 (판매자가 시작했어도 요청 30분이 지나면 종료)
const StyledDates = styled.span`
  display: flex;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;

  strong {
    font-weight: 600;
  }
`;

// 내가 요청한 트루샷 목록 한 줄 (request: api/trueShot.js의 목록 항목 { id, name, createdAt, expiresAt, status })
export default function RequestItem({ request, onClick }) {
  const { status } = request;

  return (
    <StyledItem type="button" onClick={onClick}>
      <StyledInfo>
        <StyledName>{request.name}</StyledName>
        <StyledDates>
          {formatDateTime(request.createdAt)}
          {status === "pending" && <strong>| {formatTime(request.expiresAt)} 만료 예정</strong>}
        </StyledDates>
      </StyledInfo>
      <TrueShotStatusBadge status={status} />
    </StyledItem>
  );
}
