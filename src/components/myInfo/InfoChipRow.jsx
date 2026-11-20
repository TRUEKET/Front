import styled from "styled-components";
import Button from "../common/Button.jsx";

// 칩 라벨 + 값 (+ 오른쪽 버튼)
const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const StyledInfo = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
`;

const StyledValue = styled.span`
  overflow: hidden;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 내 계정 정보 한 줄 (예: '이메일' 칩 + 주소), actionLabel·onAction이 있으면 오른쪽에 회색 버튼
export default function InfoChipRow({ label, value, actionLabel, onAction }) {
  return (
    <StyledRow>
      <StyledInfo>
        <Button as="span">{label}</Button>
        <StyledValue>{value}</StyledValue>
      </StyledInfo>
      {actionLabel && (
        <Button variant="disabled" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </StyledRow>
  );
}
