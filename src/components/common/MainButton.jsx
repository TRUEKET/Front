import styled, { css } from "styled-components";

// 상태별 배경·글씨·테두리 (variant: primary 검정 / accent 보라 / outline 테두리)
const variantStyles = {
  primary: css`
    background: #191919;
    color: #fdfdfd;
    border: none;
  `,
  accent: css`
    background: #5434d6;
    color: #fdfdfd;
    border: none;
  `,
  outline: css`
    background: transparent;
    color: #4e4a57;
    border: 1px solid #4e4a57;

    &:hover:not(:disabled) {
      background: #a9a4b2;
      border-color: #a9a4b2;
    }
  `,
};

// 가로 꽉 채우는 메인 액션 버튼 (높이 50)
const StyledMainButton = styled.button`
  width: 100%;
  height: 50px;
  padding: 12px 16px;
  box-sizing: border-box;
  border-radius: 10px;
  font-family: "esamanru", sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;

  ${({ $variant }) => variantStyles[$variant]}

  &:disabled {
    background: #dedbe5;
    color: #a9a4b2;
    border: none;
    cursor: not-allowed;
  }
`;

// 화면 하단·폼 등에서 쓰는 메인 버튼 (확인하기 등)
export default function MainButton({ variant = "primary", children, ...props }) {
  return (
    <StyledMainButton $variant={variant} {...props}>
      {children}
    </StyledMainButton>
  );
}
