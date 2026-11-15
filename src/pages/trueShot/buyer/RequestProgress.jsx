import { Fragment } from "react";
import styled from "styled-components";
import stepDoneIcon from "../../../assets/icons/trueshot_step_done.svg";

// 왼쪽 원·점선 세로줄 + 오른쪽 단계 이름 (양옆 16px)
const StyledProgress = styled.div`
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 0 16px;
`;

// 원 25px + 점선 20px을 번갈아 세로로 쌓음 (폭 30)
const StyledMarks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;

  img {
    display: block;
  }
`;

// 아직 안 된 단계: 보라 테두리 원 + 가운데 점
const StyledPendingMark = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  box-sizing: border-box;
  border: 1.5px solid #5434d6;
  border-radius: 99px;

  &::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: #5434d6;
  }
`;

// 단계 사이 보라 점선 (1px 굵기, 약 1.7px 간격)
const StyledLine = styled.span`
  width: 1px;
  height: 20px;
  background: repeating-linear-gradient(to bottom, #5434d6 0 1.67px, transparent 1.67px 3.33px);
`;

// 단계 이름 (원 가운데에 맞도록 위 4px, 사이 32px)
const StyledLabels = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 157px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  text-align: left;
`;

// 트루샷 요청 진행 단계 (링크 제작 → 첫번째 촬영 → 두번째 촬영 → 인증 완료)
export default function RequestProgress({ steps }) {
  return (
    <StyledProgress>
      <StyledMarks aria-hidden="true">
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            {index > 0 && <StyledLine />}
            {step.done ? <img src={stepDoneIcon} alt="" /> : <StyledPendingMark />}
          </Fragment>
        ))}
      </StyledMarks>
      <StyledLabels>
        {steps.map((step) => (
          <li key={step.label} aria-label={`${step.label} ${step.done ? "완료" : "진행 전"}`}>
            {step.label}
          </li>
        ))}
      </StyledLabels>
    </StyledProgress>
  );
}
