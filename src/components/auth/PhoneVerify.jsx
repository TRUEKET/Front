import { useId, useState } from "react";
import styled from "styled-components";
import DemoSmsInbox from "./DemoSmsInbox.jsx";
import { StyledFieldCard, StyledFieldError, StyledInput, StyledLabel } from "./authStyles.js";
import { confirmVerifyCode, formatPhone, isValidPhone, sendVerifyCode } from "../../api/auth.js";
import useCountdown from "../../hooks/useCountdown.js";

// 입력칸 줄들 + 안내 문구
const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

// 전화번호·인증번호 입력칸은 가운데 정렬
const StyledCenterInput = styled(StyledInput)`
  flex: 1 0 0;
  text-align: center;
`;

// 회색 알약 버튼 (인증번호 전송 / 재전송 / 확인 / 다시 인증하기)
const StyledSendButton = styled.button`
  flex-shrink: 0;
  padding: 12px 16px;
  border: 1px solid #a9a4b2;
  border-radius: 20px;
  background: #dedbe5;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const StyledDone = styled.p`
  color: #1d6b43;
  font-size: 10px;
  font-weight: 500;
`;

const CODE_LENGTH = 6;

// 인증 단계별 전송 버튼 문구 (idle 전송 전 / sent 코드 입력 중 / expired 시간 초과 / verified 인증 완료)
const BUTTON_LABELS = {
  idle: "인증번호 전송",
  sent: "재전송",
  expired: "재전송",
  verified: "다시 인증하기",
};

const EXPIRED_MESSAGE = "인증 시간이 지났어요. 인증번호를 다시 받아 주세요.";

// 전화번호 인증 박스: 번호 입력 → 인증번호 전송 → 문자로 받은 코드 직접 입력 → 확인
// 서버가 demoSms(시연용)를 주면 아래 문자 수신함에 코드를 보여줌
// TODO: 인증번호 입력칸은 피그마 디자인이 없어 기존 입력칸·버튼 스타일로 임시 구현 (디자인 확인 필요)
// onVerifiedChange(verificationId | null): 인증 완료되면 서버 verificationId, 아니면 null
// sendCode·verifyCode: 기본은 가입용 API (번호 변경 화면은 변경용 API를 넘김)
// gap: 카드 안 간격 (회원가입 12 / 계정 정보 수정 16), children: 카드 안 맨 아래에 넣을 내용 (예: 저장하기 버튼)
export default function PhoneVerify({
  phone,
  onPhoneChange,
  onVerifiedChange,
  sendCode = sendVerifyCode,
  verifyCode = confirmVerifyCode,
  shadow = false,
  gap = 12,
  children,
}) {
  const phoneId = useId();
  const codeId = useId();
  const [status, setStatus] = useState("idle");
  // 발송 응답 { verificationId, expiresAt, demoSms? }
  const [sent, setSent] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const remainSeconds = useCountdown(sent ? new Date(sent.expiresAt).getTime() : null);
  // 코드 입력 중 남은 시간이 0이 되면 시간 초과 (재전송 필요)
  const phase = status === "sent" && remainSeconds === 0 ? "expired" : status;

  const changeStatus = (next, verificationId = null) => {
    setStatus(next);
    onVerifiedChange(next === "verified" ? verificationId : null);
  };

  // 처음 상태로 (다시 인증하기, 인증 중 번호 수정)
  const reset = () => {
    setSent(null);
    setCode("");
    setError("");
    changeStatus("idle");
  };

  const handlePhoneChange = (e) => {
    if (phase !== "idle") reset();
    onPhoneChange(formatPhone(e.target.value));
  };

  const handleSend = async () => {
    if (phase === "verified") {
      reset();
      return;
    }

    setPending(true);
    setError("");
    try {
      const result = await sendCode(phone);
      setSent(result);
      setCode("");
      changeStatus("sent");
    } catch (sendError) {
      // 60초 안에 재전송(429) 등 서버 안내 문구를 그대로 보여줌
      setError(sendError.message);
    } finally {
      setPending(false);
    }
  };

  const handleConfirm = async () => {
    setPending(true);
    setError("");
    try {
      await verifyCode({ verificationId: sent.verificationId, phone, code });
      changeStatus("verified", sent.verificationId);
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setPending(false);
    }
  };

  const isVerified = phase === "verified";
  const showCodeRow = phase === "sent" || phase === "expired";
  const canSend = !pending && (isVerified || isValidPhone(phone));
  const canConfirm = !pending && phase === "sent" && code.length === CODE_LENGTH;
  const message = phase === "expired" ? EXPIRED_MESSAGE : error;

  return (
    <>
      <StyledFieldCard $gap={gap} $shadow={shadow}>
        <StyledLabel htmlFor={phoneId}>전화번호 인증</StyledLabel>
        <StyledGroup>
          <StyledRows>
            <StyledRow>
              <StyledCenterInput
                id={phoneId}
                type="tel"
                inputMode="numeric"
                placeholder="010-XXXX-XXXX"
                value={phone}
                onChange={handlePhoneChange}
                readOnly={isVerified}
                $filled={isVerified}
              />
              <StyledSendButton type="button" onClick={handleSend} disabled={!canSend}>
                {BUTTON_LABELS[phase]}
              </StyledSendButton>
            </StyledRow>
            {showCodeRow && (
              <StyledRow>
                <StyledCenterInput
                  id={codeId}
                  aria-label="인증번호"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={`인증번호 ${CODE_LENGTH}자리`}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
                    setError("");
                  }}
                  disabled={phase === "expired"}
                />
                <StyledSendButton type="button" onClick={handleConfirm} disabled={!canConfirm}>
                  확인
                </StyledSendButton>
              </StyledRow>
            )}
          </StyledRows>
          {isVerified && <StyledDone>인증이 완료되었습니다.</StyledDone>}
          {message && <StyledFieldError role="alert">{message}</StyledFieldError>}
        </StyledGroup>
        {children}
      </StyledFieldCard>

      {phase === "sent" && sent?.demoSms && (
        <DemoSmsInbox phone={sent.demoSms.maskedPhone} code={sent.demoSms.code} remainSeconds={remainSeconds} />
      )}
    </>
  );
}
