import { useId } from "react";
import styled from "styled-components";
import { StyledFieldCard, StyledFieldError, StyledInput, StyledLabel } from "./authStyles.js";

// 라벨 + 보조 문구 (사이 간격 없음)
const StyledLabelGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHint = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 입력칸 + 에러 문구
const StyledInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 이메일·비밀번호처럼 라벨 하나 + 입력칸 하나인 카드
export default function FormField({ label, hint, error, shadow = false, ...inputProps }) {
  const id = useId();

  return (
    <StyledFieldCard $shadow={shadow}>
      <StyledLabelGroup>
        <StyledLabel htmlFor={id}>{label}</StyledLabel>
        {hint && <StyledHint>{hint}</StyledHint>}
      </StyledLabelGroup>
      <StyledInputGroup>
        <StyledInput id={id} placeholder="입력하세요..." aria-invalid={Boolean(error)} {...inputProps} />
        {error && <StyledFieldError role="alert">{error}</StyledFieldError>}
      </StyledInputGroup>
    </StyledFieldCard>
  );
}
