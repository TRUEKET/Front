import { useState } from "react";
import MainButton from "../../components/common/MainButton.jsx";
import useAuthRedirect from "../../hooks/useAuthRedirect.js";
import FormField from "../../components/auth/FormField.jsx";
import PhoneVerify from "../../components/auth/PhoneVerify.jsx";
import AgreeCheckbox from "../../components/auth/AgreeCheckbox.jsx";
import PrivacyPolicySheet from "./PrivacyPolicySheet.jsx";
import { StyledBottomAction, StyledFieldError, StyledFields } from "../../components/auth/authStyles.js";
import { EMAIL_ERROR, PASSWORD_ERROR, isValidEmail, isValidPassword, signup } from "../../api/auth.js";

// 회원가입 폼: 이메일·비밀번호 형식 + 전화번호 인증 + 동의 2개가 모두 되면 버튼 활성
// 가입은 인증을 마친 verificationId와 함께 보내고, 성공하면 바로 로그인 상태
export default function SignupForm() {
  // 성공하면 원래 들어오려던 화면(없으면 홈)으로
  const redirectAfterAuth = useAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [phone, setPhone] = useState("");
  // 전화 인증을 마치면 서버 verificationId, 아니면 null
  const [verificationId, setVerificationId] = useState(null);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 동의 시트에서 "동의하고 닫기"를 누르면 개인정보 체크박스 자동 체크
  const handleAgreeFromSheet = () => {
    setAgreePrivacy(true);
    setIsSheetOpen(false);
  };

  const emailValid = isValidEmail(email);
  const passwordValid = isValidPassword(password);
  const canSubmit = emailValid && passwordValid && Boolean(verificationId) && agreePrivacy && agreeAge && !submitting;

  // 입력칸을 벗어났을 때만 형식 에러 표시
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await signup({ email, password, phone, verificationId });
      redirectAfterAuth();
    } catch (error) {
      // 이미 가입된 이메일·번호(409), 인증 만료 등 서버 안내 문구
      setSubmitError(error.message);
      setSubmitting(false);
    }
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
        <PhoneVerify shadow phone={phone} onPhoneChange={setPhone} onVerifiedChange={setVerificationId} />
        <AgreeCheckbox
          checked={agreePrivacy}
          onChange={setAgreePrivacy}
          linkText="개인정보 수집·이용 동의 자세히 보기 →"
          onLinkClick={() => setIsSheetOpen(true)}
        >
          개인정보 정책에 동의합니다.
        </AgreeCheckbox>
        <AgreeCheckbox checked={agreeAge} onChange={setAgreeAge}>
          만 14세 이상입니다.
        </AgreeCheckbox>
        {submitError && <StyledFieldError role="alert">{submitError}</StyledFieldError>}
      </StyledFields>

      <StyledBottomAction>
        <MainButton type="submit" disabled={!canSubmit}>
          회원가입하기
        </MainButton>
      </StyledBottomAction>

      {isSheetOpen && <PrivacyPolicySheet onClose={() => setIsSheetOpen(false)} onAgree={handleAgreeFromSheet} />}
    </form>
  );
}
