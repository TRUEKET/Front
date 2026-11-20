import styled from "styled-components";

// 보라 알약 타이머 (예: 03:00)
const StyledBadge = styled.span`
  align-self: center;
  padding: 8px 16px;
  background: #5434d6;
  border-radius: 20px;
  color: #fdfdfd;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: normal;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const pad = (value) => String(value).padStart(2, "0");

// 남은 초를 mm:ss로 보여주는 타이머 배지 (판매자 1차·2차 지시, 1차 실패 모달)
export default function CountdownBadge({ seconds }) {
  return (
    <StyledBadge role="timer" aria-label={`남은 시간 ${Math.floor(seconds / 60)}분 ${seconds % 60}초`}>
      {pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}
    </StyledBadge>
  );
}
