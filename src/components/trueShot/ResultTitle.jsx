import styled from "styled-components";

// 색 막대 + 결과 제목
const StyledTitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  &::before {
    content: "";
    flex-shrink: 0;
    width: 10px;
    height: 66px;
    background: ${({ $color }) => $color};
  }
`;

const StyledTitle = styled.h2`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: normal;
`;

// 트루샷 결과 제목 (color: 막대 색, 성공 초록 / 실패 빨강)
export default function ResultTitle({ color, children }) {
  return (
    <StyledTitleRow $color={color}>
      <StyledTitle>{children}</StyledTitle>
    </StyledTitleRow>
  );
}
