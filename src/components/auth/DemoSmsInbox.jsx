import styled from "styled-components";
import mailIcon from "../../assets/icons/auth_mail.svg";

// 실제 문자 대신 인증번호를 보여주는 시연용 수신함 (점선 보라 테두리)
const StyledInbox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #eeebfb;
  border: 1px dashed #5434d6;
  border-radius: 16px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  line-height: 1.45;
  text-align: left;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 메일 아이콘 + "문자 수신함"
const StyledTitle = styled.p`
  display: flex;
  gap: 6px;
  align-items: center;
  color: #3f27a1;
  font-size: 14px;
  font-weight: 700;

  img {
    display: block;
  }
`;

const StyledBadge = styled.span`
  padding: 3px 7px;
  background: #5434d6;
  border-radius: 6px;
  color: #fdfdfd;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.66px;
`;

// 문자 내용이 담긴 흰 말풍선
const StyledMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background: #fdfdfd;
  border-radius: 12px;
`;

const StyledMeta = styled.p`
  color: #4e4a57;
  font-size: 12px;
  font-weight: 400;
`;

const StyledBody = styled.p`
  color: #191919;
  font-size: 14px;
  font-weight: 400;

  strong {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 2.4px;
  }
`;

const StyledFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledTimer = styled.p`
  color: #3f27a1;
  font-size: 13px;
  font-weight: 700;
`;

const StyledNote = styled.p`
  color: #4e4a57;
  font-size: 11.5px;
  font-weight: 400;
`;

// 010-1234-5678 → 010-****-5678
const maskPhone = (phone) => phone.replace(/^(\d{3})-?\d{3,4}-?(\d{4})$/, "$1-****-$2");

// 남은 초 → 02:47
const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

// 전화번호 인증 시연용 문자 수신함
export default function DemoSmsInbox({ phone, code, remainSeconds }) {
  return (
    <StyledInbox aria-label="시연용 문자 수신함">
      <StyledHeader>
        <StyledTitle>
          <img src={mailIcon} alt="" />
          문자 수신함
        </StyledTitle>
        <StyledBadge>DEMO</StyledBadge>
      </StyledHeader>
      <StyledMessage>
        <StyledMeta>수신 번호 {maskPhone(phone)} · 방금</StyledMeta>
        <StyledBody>
          [트루켓] 인증번호 <strong>{code}</strong> 를 입력해 주세요.
        </StyledBody>
      </StyledMessage>
      <StyledFooter>
        <StyledTimer>남은 시간 {formatTime(remainSeconds)}</StyledTimer>
        <StyledNote>재발급은 60초 후 가능 · 오입력 5회 제한</StyledNote>
      </StyledFooter>
    </StyledInbox>
  );
}
