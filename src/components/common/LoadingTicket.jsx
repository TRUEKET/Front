import styled, { keyframes } from "styled-components";
import ticketImage from "../../assets/images/loading_ticket.png";

// 티켓이 위아래로 둥둥 뜨는 움직임 (3초 반복)
const bob = keyframes`
  0%, 100% { transform: translateY(3px); }
  50% { transform: translateY(-6px); }
`;

// 티켓이 올라가면 그림자가 작고 옅어지고, 내려오면 다시 커짐
const shadowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(0.72); opacity: 0.14; }
`;

// 애니메이션 전체 자리 (기존 모션 자리와 같은 150x150, 티켓과 그림자를 겹쳐서 가운데 배치)
const StyledLoadingTicket = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: 150px;
  height: 150px;
  isolation: isolate;
`;

// 떠다니는 티켓 그림 (자리 150의 2/3인 폭 100, 높이는 원본 비율대로 약 82)
const StyledTicket = styled.img`
  position: relative;
  z-index: 1;
  display: block;
  width: 100px;
  height: auto;
  animation: ${bob} 3s ease-in-out infinite;
  will-change: transform;

  /* 동작 줄이기 설정을 켠 사용자에게는 움직이지 않음 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 티켓 아래 흐린 보라색 타원 그림자 (티켓 폭의 58%, 티켓 아래 끝 바로 밑에 가운데 배치)
const StyledShadow = styled.span`
  position: absolute;
  z-index: 0;
  left: calc(50% - 29px);
  bottom: 32px;
  width: 58px;
  height: 8px;
  border-radius: 50%;
  background: rgba(47, 34, 111, 0.23);
  filter: blur(5px);
  animation: ${shadowPulse} 3s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 판독, 분석을 기다리는 동안 보여주는 트루켓 티켓 로딩 애니메이션
export default function LoadingTicket() {
  return (
    <StyledLoadingTicket aria-hidden="true">
      <StyledShadow />
      <StyledTicket src={ticketImage} alt="" />
    </StyledLoadingTicket>
  );
}
