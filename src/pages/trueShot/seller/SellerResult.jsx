import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import ResultTitle from "../../../components/trueShot/ResultTitle.jsx";
import ReasonList from "../../../components/trueShot/ReasonList.jsx";
import { StyledSellerBottom } from "./sellerStyles.js";

// 헤더 아래 남은 공간 가운데에 결과 묶음 (아래 고정 버튼 자리만큼 비움)
const StyledResult = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-height: calc(100svh - 68px);
  box-sizing: border-box;
  padding: 0 16px calc(50px + 12px + 12px);
`;

const StyledMessage = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 500;
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

// 사진 전송 전 성공 화면 안내 (피그마에 없음, 디자인 확인 필요)
const StyledShareGuide = styled.p`
  color: #5434d6;
  font-size: 14px;
  font-weight: 600;
`;

// 재진행 안내 (연보라 박스)
const StyledNotice = styled.p`
  padding: 12px 16px;
  background: #eeebfb;
  border-radius: 20px;
  color: #191919;
  font-size: 12px;
  font-weight: 500;
`;

// 판매자 최종 결과 (success: 인증 성공 / 그 외: 인증 실패 + 이유)
// buttonLabel·onButton이 없으면 버튼을 숨김 (요청자에게 전송까지 마친 뒤)
// shareGuide: 성공했지만 아직 사진을 가리고 보내기 전이면 true (전송해야 완료된다는 안내)
export default function SellerResult({ success, reasons = [], buttonLabel, onButton, shareGuide = false }) {
  return (
    <>
      <StyledResult>
        {success ? (
          <>
            <ResultTitle color="#20894d" barHeight={48}>
              인증에 성공했습니다.
            </ResultTitle>
            <StyledMessage>
              구매자에게 결과가 전송됩니다.
              <br />
              구매 여부는 트루켓이 결정하지 않습니다.
            </StyledMessage>
            {shareGuide && <StyledShareGuide>사진을 가리고 전송해야 인증이 완료돼요.</StyledShareGuide>}
          </>
        ) : (
          <>
            <ResultTitle color="#ca2317" barHeight={48}>
              인증에 실패했습니다.
            </ResultTitle>
            <StyledReasonCard>
              <StyledReasonTitle>실패 이유</StyledReasonTitle>
              <ReasonList reasons={reasons} gap={8} />
            </StyledReasonCard>
          </>
        )}
        <StyledNotice>
          재진행을 원하는 경우, 구매자에게 새 링크 요청이 필요합니다.
          <br />
          해당 세션은 재사용이 불가합니다.
        </StyledNotice>
      </StyledResult>

      {buttonLabel && (
        <StyledSellerBottom>
          <MainButton type="button" onClick={onButton}>
            {buttonLabel}
          </MainButton>
        </StyledSellerBottom>
      )}
    </>
  );
}
