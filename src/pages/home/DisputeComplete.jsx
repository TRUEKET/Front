import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import MainButton from "../../components/common/MainButton.jsx";
import checkIcon from "../../assets/icons/dispute_complete_check.svg";
import { MOCK_DISPUTE_REASONS } from "../../mock/disputeReason.js";
import { MOCK_DISPUTE_RECEIPT_NO } from "../../mock/disputeComplete.js";

// line-height:1로 Figma의 lineHeight 100%에 맞춤
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  line-height: 1;
`;

const StyledIcon = styled.img`
  display: block;
  margin-top: 100px;
`;

const StyledMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  text-align: center;
  white-space: nowrap;
`;

const StyledTitle = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
`;

const StyledDescription = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
`;

// 접수번호·계좌번호·이유를 한 줄씩 보여주는 흰 카드
const StyledReceiptCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
`;

const StyledReceiptRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledReceiptLabel = styled.span`
  color: #4e4a57;
`;

const StyledReceiptValue = styled.span`
  color: #191919;
`;

// 푸터 자리에 고정되는 닫기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
const StyledBottomAction = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 아이디 앞 3글자만 남기고 가림 (예: hello@gmail.com → hel***@gmail.com)
function maskEmail(email) {
  const [id, domain] = email.split("@");
  if (!domain) return email;
  return `${id.slice(0, 3)}***@${domain}`;
}

// 증빙 제출 후 접수 결과를 보여주는 화면
export default function DisputeComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reasonLabel = MOCK_DISPUTE_REASONS.find(({ id }) => id === state?.reason)?.title;

  const rows = [
    { label: "접수번호", value: MOCK_DISPUTE_RECEIPT_NO },
    { label: "계좌번호", value: state?.account },
    { label: "이유", value: reasonLabel },
  ];

  return (
    <>
      <StyledContent>
        <StyledIcon src={checkIcon} alt="" />
        <StyledMessage>
          <StyledTitle>이의제기가 접수되었어요</StyledTitle>
          <StyledDescription>
            진행 상황을 {maskEmail(state?.email ?? "")}으로
            <br />
            보내드립니다.
          </StyledDescription>
        </StyledMessage>
        <StyledReceiptCard>
          {rows.map(({ label, value }) => (
            <StyledReceiptRow key={label}>
              <StyledReceiptLabel>{label}</StyledReceiptLabel>
              <StyledReceiptValue>{value}</StyledReceiptValue>
            </StyledReceiptRow>
          ))}
        </StyledReceiptCard>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="primary" onClick={() => navigate("/", { replace: true })}>
          닫기
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
