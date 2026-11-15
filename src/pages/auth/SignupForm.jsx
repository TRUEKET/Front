import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainButton from "../../components/common/MainButton.jsx";
import FormField from "../../components/auth/FormField.jsx";
import PhoneVerify from "../../components/auth/PhoneVerify.jsx";
import AgreeCheckbox from "../../components/auth/AgreeCheckbox.jsx";
import { StyledBottomAction, StyledFields } from "../../components/auth/authStyles.js";
import { EMAIL_ERROR, PASSWORD_ERROR, isValidEmail, isValidPassword, signup } from "../../api/auth.js";

// 회원가입 폼: 이메일·비밀번호 형식 + 전화번호 인증 + 동의 2개가 모두 되면 버튼 활성
export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const emailValid = isValidEmail(email);
  const passwordValid = isValidPassword(password);
  const canSubmit = emailValid && passwordValid && isVerified && agreePrivacy && agreeAge;

  // 입력칸을 벗어났을 때만 형식 에러 표시
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    await signup({ email, password, phone });
    navigate("/", { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StyledFields>
        <FormField
          shadow
          label="이메일"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleBlur("email")}
          error={touched.email && email && !emailValid ? EMAIL_ERROR : ""}
        />
        <FormField
          shadow
          label="비밀번호"
          hint="8자 이상, 영문+숫자로 구성"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handleBlur("password")}
          error={touched.password && password && !passwordValid ? PASSWORD_ERROR : ""}
        />
        <PhoneVerify shadow phone={phone} onPhoneChange={setPhone} onVerifiedChange={setIsVerified} />
        <AgreeCheckbox
          checked={agreePrivacy}
          onChange={setAgreePrivacy}
          linkText="개인정보 수집·이용 동의 자세히 보기 →"
        >
          개인정보 정책에 동의합니다.
        </AgreeCheckbox>
        <AgreeCheckbox checked={agreeAge} onChange={setAgreeAge}>
          만 14세 이상입니다.
        </AgreeCheckbox>
      </StyledFields>

      <StyledBottomAction>
        <MainButton type="submit" disabled={!canSubmit}>
          회원가입하기
        </MainButton>
      </StyledBottomAction>
    </form>
  );
}
