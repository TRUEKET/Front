import { useEffect, useId, useState } from "react";
import styled from "styled-components";
import DemoSmsInbox from "./DemoSmsInbox.jsx";
import { StyledFieldCard, StyledInput, StyledLabel } from "./authStyles.js";
import { formatPhone, isValidPhone, sendVerifyCode } from "../../api/auth.js";
import { AUTO_VERIFY_DELAY } from "../../mock/auth.js";

// 입력칸 + 전송 버튼 + 완료 문구
const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

// 전화번호 입력칸은 가운데 정렬
const StyledPhoneInput = styled(StyledInput)`
  flex: 1 0 0;
  text-align: center;
`;

// 회색 알약 버튼 (인증번호 전송 / 재전송 / 다시 인증하기)
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

// 인증 단계별 버튼 문구 (idle 전송 전 / sent 문자 대기 중 / expired 시간 초과 / verified 인증 완료)
const BUTTON_LABELS = {
  idle: "인증번호 전송",
  sent: "인증번호 전송",
  expired: "재전송",
  verified: "다시 인증하기",
};

// 전화번호 인증 박스 + 시연용 문자 수신함
// 전송하면 수신함이 뜨고 AUTO_VERIFY_DELAY 뒤 자동 인증 완료 (목업)
export default function PhoneVerify({ phone, onPhoneChange, onVerifiedChange, shadow = false }) {
  const id = useId();
  const [status, setStatus] = useState("idle");
  const [sms, setSms] = useState(null);
  const [remainSeconds, setRemainSeconds] = useState(0);

  // 문자 대기 중 남은 시간이 0이 되면 시간 초과 (재전송 가능)
  const phase = status === "sent" && remainSeconds === 0 ? "expired" : status;

  const changeStatus = (next) => {
    setStatus(next);
    onVerifiedChange(next === "verified");
  };

  // 문자 대기 중: 1초마다 남은 시간 감소
  useEffect(() => {
    if (phase !== "sent") return undefined;

    const timer = setInterval(() => {
      setRemainSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // 문자 대기 중: 일정 시간 뒤 자동 인증 완료 (TODO: API 연동 시 인증번호 확인으로 교체)
  useEffect(() => {
    if (phase !== "sent") return undefined;

    const timeout = setTimeout(() => changeStatus("verified"), AUTO_VERIFY_DELAY);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSend = async () => {
    if (phase === "verified") {
      // 다시 인증하기: 처음 상태로
      setSms(null);
      changeStatus("idle");
      return;
    }

    const result = await sendVerifyCode(phone);
    setSms(result);
    setRemainSeconds(result.expiresIn);
    changeStatus("sent");
  };

  const isVerified = phase === "verified";
  const canSend = isVerified || (phase !== "sent" && isValidPhone(phone));

  return (
    <>
      <StyledFieldCard $gap={12} $shadow={shadow}>
        <StyledLabel htmlFor={id}>전화번호 인증</StyledLabel>
        <StyledGroup>
          <StyledRow>
            <StyledPhoneInput
              id={id}
              type="tel"
              inputMode="numeric"
              placeholder="010-XXXX-XXXX"
              value={phone}
              onChange={(e) => onPhoneChange(formatPhone(e.target.value))}
              readOnly={phase === "sent" || isVerified}
              $filled={isVerified}
            />
            <StyledSendButton type="button" onClick={handleSend} disabled={!canSend}>
              {BUTTON_LABELS[phase]}
            </StyledSendButton>
          </StyledRow>
          {isVerified && <StyledDone>인증이 완료되었습니다.</StyledDone>}
        </StyledGroup>
      </StyledFieldCard>

      {phase === "sent" && sms && <DemoSmsInbox phone={sms.phone} code={sms.code} remainSeconds={remainSeconds} />}
    </>
  );
}
