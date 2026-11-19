import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import CountdownBadge from "../../../components/trueShot/CountdownBadge.jsx";
import ResultTitle from "../../../components/trueShot/ResultTitle.jsx";
import ReasonList from "../../../components/trueShot/ReasonList.jsx";

// 판독 중 화면 (헤더 없이 안내 문구만, 모션 애니메이션은 진행하지 않기로 해서 자리 삭제)
// 문구 위치는 모션 자리가 있을 때와 같게: 289 + 모션 150 + 간격 14
const StyledLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 453px;
`;

const StyledMessage = styled.p`
  color: #191919;
  font-size: 12px;
  font-weight: 500;
`;

// 판독 결과 모달 (반투명 배경 위 가운데 흰 카드)
const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.25);
`;

const StyledDialog = styled.div`
  position: absolute;
  top: calc(50% + 1.5px);
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: calc(min(100%, 390px) - 32px);
  box-sizing: border-box;
  padding: 16px 20px;
  background: #fdfdfd;
  border-radius: 20px;
  transform: translate(-50%, -50%);
`;

// 타이머 + 실패 이유
const StyledFailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledReasonCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

const StyledReasonTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
`;

// 1차 판독 중 화면 + 결과 모달
// judge: 판독 결과 (null이면 판독 중), remainSeconds: 1차 남은 시간 (실패 모달에서 계속 줄어듦)
export default function SellerJudging({ judge, remainSeconds, onRetry, onNext }) {
  return (
    <>
      <StyledLoading>
        <StyledMessage role="status">AI가 사진을 분석 중입니다...</StyledMessage>
      </StyledLoading>

      {judge && (
        <StyledOverlay>
          <StyledDialog role="dialog" aria-modal="true">
            {judge.passed ? (
              <>
                <ResultTitle color="#20894d" barHeight={48}>
                  1차 인증에 성공했습니다.
                </ResultTitle>
                <MainButton type="button" onClick={onNext}>
                  개인정보 가리기
                </MainButton>
              </>
            ) : (
              <>
                <ResultTitle color="#ca2317" barHeight={48}>
                  1차 인증에 실패했습니다.
                </ResultTitle>
                <StyledFailBody>
                  <CountdownBadge seconds={remainSeconds} />
                  <StyledReasonCard>
                    <StyledReasonTitle>실패 이유</StyledReasonTitle>
                    <ReasonList reasons={judge.reasons} gap={8} />
                  </StyledReasonCard>
                </StyledFailBody>
                <MainButton type="button" onClick={onRetry}>
                  다시 찍기
                </MainButton>
              </>
            )}
          </StyledDialog>
        </StyledOverlay>
      )}
    </>
  );
}
