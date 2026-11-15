import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MainButton from "../../components/common/MainButton.jsx";
import AccountSummaryCard from "../../components/common/AccountSummaryCard.jsx";

// 안내 카드 + 계좌 카드를 세로로 나열, line-height:1로 Figma의 lineHeight 100%에 맞춤
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  line-height: 1;
`;

const StyledTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
`;

// 푸터 자리에 고정되는 시작하기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
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

const StyledTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  width: 100%;
`;

const StyledGuideCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
`;

const StyledGuideTitle = styled.p`
  margin: 0;
  width: 100%;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
`;

const StyledGuideStep = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
`;

const StyledGuideNumber = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  background: #5434d6;
  border-radius: 50%;
  color: #fdfdfd;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

const StyledGuideTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  min-width: 0;
  text-align: left;
`;

const StyledGuideHeadline = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
`;

const StyledGuideDetail = styled.div`
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 400;
`;

const StyledGuideList = styled.ul`
  margin: 0;
  padding-left: 15px;
`;

// 계좌를 조회한 뒤 이의제기를 시작하기 전 보여주는 안내 화면
export default function Dispute() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <BackHeader label="뒤로가기" />
      <StyledContent>
        <StyledTitle>이의신청</StyledTitle>
        <StyledTop>
          <AccountSummaryCard
            status={state?.status}
            account={state?.account}
            reportCount={state?.reportCount}
            suspectCount={state?.suspectCount}
          />

          <StyledGuideCard>
            <StyledGuideTitle>이의제기 설명사항</StyledGuideTitle>

            <StyledGuideStep>
              <StyledGuideNumber>1</StyledGuideNumber>
              <StyledGuideTexts>
                <StyledGuideHeadline>이 계좌의 주인만 신청 가능합니다.</StyledGuideHeadline>
                <StyledGuideDetail>계좌번호가 보이는 증빙이 필요합니다.</StyledGuideDetail>
              </StyledGuideTexts>
            </StyledGuideStep>

            <StyledGuideStep>
              <StyledGuideNumber>2</StyledGuideNumber>
              <StyledGuideTexts>
                <StyledGuideHeadline>게시자가 증빙을 보고 직접 판단합니다.</StyledGuideHeadline>
                <StyledGuideDetail>
                  이의제기를 완료하면 게시자가 3일 내로 유지·삭제를 결정합니다.
                  <StyledGuideList>
                    <li>3일 내 미결정 시, 결정하기 전까지 비공개처리됩니다.</li>
                    <li>명의 도용 사유는 트루켓 증빙팀에서 처리합니다.</li>
                  </StyledGuideList>
                </StyledGuideDetail>
              </StyledGuideTexts>
            </StyledGuideStep>

            <StyledGuideStep>
              <StyledGuideNumber>3</StyledGuideNumber>
              <StyledGuideTexts>
                <StyledGuideHeadline>판단 기간 동안은, 게시 중 처리됩니다.</StyledGuideHeadline>
                <StyledGuideDetail>진행 과정은 메일로 전달드립니다.</StyledGuideDetail>
              </StyledGuideTexts>
            </StyledGuideStep>
          </StyledGuideCard>
        </StyledTop>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="accent" onClick={() => navigate("/search/dispute/reason", { state })}>
          시작하기
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
