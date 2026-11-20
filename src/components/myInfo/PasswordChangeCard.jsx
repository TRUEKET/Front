import { useState } from "react";
import styled from "styled-components";
import Button from "../common/Button.jsx";
import MainButton from "../common/MainButton.jsx";
import { StyledFieldCard, StyledFieldError } from "../auth/authStyles.js";
import { PASSWORD_ERROR, isValidPassword } from "../../api/auth.js";
import { PASSWORD_CONFIRM_ERROR, changePassword } from "../../api/account.js";

const StyledTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
`;

// 칩 라벨 + 입력칸 (+ 에러 문구)
const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledFieldRow = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 테두리 없는 입력칸 (피그마는 칩 옆 안내 문구만 있음, 입력 중 위치를 알 수 있게 포커스 때만 밑줄)
const StyledInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 2px 0;
  border: none;
  border-bottom: 1px solid transparent;
  outline: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;

  &::placeholder {
    color: #4e4a57;
  }

  &:focus {
    border-bottom-color: #cac0f2;
  }
`;

const FIELDS = [
  { key: "current", label: "현재 비밀번호", placeholder: "입력하세요...", autoComplete: "current-password" },
  { key: "next", label: "새 비밀번호", placeholder: "8자 이상, 영문+숫자로 구성되어야 합니다.", autoComplete: "new-password" },
  { key: "confirm", label: "새 비밀번호 확인", placeholder: "위와 동일한 비밀번호를 입력해주세요.", autoComplete: "new-password" },
];

// 비밀번호 변경 카드 (저장 성공 시 onSaved)
// 새 비밀번호·확인은 입력칸을 벗어날 때 검사, 현재 비밀번호는 저장할 때 서버가 확인 (틀리면 서버 문구)
export default function PasswordChangeCard({ onSaved }) {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [touched, setTouched] = useState({ next: false, confirm: false });
  const [currentError, setCurrentError] = useState("");

  const errors = {
    current: currentError,
    next: touched.next && values.next && !isValidPassword(values.next) ? PASSWORD_ERROR : "",
    confirm: touched.confirm && values.confirm && values.confirm !== values.next ? PASSWORD_CONFIRM_ERROR : "",
  };
  const canSave = values.current && isValidPassword(values.next) && values.next === values.confirm;

  const handleChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === "current") setCurrentError("");
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await changePassword({ currentPassword: values.current, newPassword: values.next, confirmPassword: values.confirm });
      onSaved();
    } catch (error) {
      setCurrentError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledFieldCard $gap={12} $shadow>
      <StyledTitle>비밀번호 변경</StyledTitle>
      {FIELDS.map(({ key, label, placeholder, autoComplete }) => (
        <StyledField key={key}>
          <StyledFieldRow>
            <Button as="span">{label}</Button>
            <StyledInput
              type="password"
              placeholder={placeholder}
              autoComplete={autoComplete}
              value={values[key]}
              onChange={handleChange(key)}
              onBlur={() => key !== "current" && setTouched((prev) => ({ ...prev, [key]: true }))}
              aria-invalid={Boolean(errors[key])}
            />
          </StyledFieldRow>
          {errors[key] && <StyledFieldError role="alert">{errors[key]}</StyledFieldError>}
        </StyledField>
      ))}
      <MainButton type="button" disabled={!canSave || saving} onClick={handleSave}>
        저장하기
      </MainButton>
    </StyledFieldCard>
  );
}
