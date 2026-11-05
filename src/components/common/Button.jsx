import styled, { css } from "styled-components";

// 상태별 배경·글씨·테두리 (variant: default 기본 / selected 선택됨 / disabled 비활성)
const variantStyles = {
  default: css`
    background: #fdfdfd;
    color: #191919;
    border: 1px solid #e5e1f9;
    font-weight: 500;
  `,
  selected: css`
    background: #191919;
    color: #fdfdfd;
    border: none;
    font-weight: 700;
  `,
  disabled: css`
    background: #dedbe5;
    color: #4e4a57;
    border: 1.5px solid #a9a4b2;
    font-weight: 700;
  `,
};

// 알약 모양 작은 버튼 (필터·선택 칩 등)
const StyledChipButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 20px;
  font-family: "esamanru", sans-serif;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;

  ${({ $variant }) => variantStyles[$variant]}
`;

// 정가 양도 등 선택형 칩 버튼
export default function Button({ variant = "default", children, ...props }) {
  return (
    <StyledChipButton $variant={variant} {...props}>
      {children}
    </StyledChipButton>
  );
}
