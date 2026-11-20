import { useState } from "react";
import MainButton from "../../components/common/MainButton.jsx";
import useAuthRedirect from "../../hooks/useAuthRedirect.js";
import FormField from "../../components/auth/FormField.jsx";
import { StyledBottomAction, StyledFields } from "../../components/auth/authStyles.js";
import { EMAIL_ERROR, isValidEmail, login } from "../../api/auth.js";

// 로그인 폼: 이메일·비밀번호를 모두 입력하면 버튼 활성, 실패하면 비밀번호 아래 안내
export default function LoginForm() {
  // 성공하면 원래 들어오려던 화면(없으면 홈)으로
  const redirectAfterAuth = useAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loginError, setLoginError] = useState("");

  const emailValid = isValidEmail(email);
  const canSubmit = emailValid && password.length > 0;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setLoginError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await login({ email, password });
      redirectAfterAuth();
    } catch (error) {
      setLoginError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StyledFields>
        <FormField
          label="이메일"
          type="email"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => setEmailTouched(true)}
          error={emailTouched && email && !emailValid ? EMAIL_ERROR : ""}
        />
        <FormField
          label="비밀번호"
          hint="8자 이상, 영문+숫자로 구성"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
          error={loginError}
        />
      </StyledFields>

      <StyledBottomAction>
        <MainButton type="submit" disabled={!canSubmit}>
          로그인하기
        </MainButton>
      </StyledBottomAction>
    </form>
  );
}
