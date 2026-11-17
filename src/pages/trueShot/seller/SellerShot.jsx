import { useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import CountdownBadge from "../../../components/trueShot/CountdownBadge.jsx";
import stepDoneIcon from "../../../assets/icons/trueshot_step_done.svg";
import guideImage from "../../../assets/icons/trueshot_guide.svg";
import cameraIcon from "../../../assets/icons/trueshot_camera.svg";
import { preloadHandRecognizer } from "../../../api/handAnalyze.js";
import { StyledSellerBottom, StyledSellerContent } from "./sellerStyles.js";

// 회차별 화면 차이 (1차: 인증코드 촬영 / 2차: 무작위 지시 촬영, 2차 제목은 요청에 저장된 지시)
const ROUND_CONFIG = {
  1: {
    title: "코드를 종이에 적어\n예매 화면과 함께 사진 촬영",
    guideLabel: "인증코드",
    guideSteps: ["종이에 인증코드 작성", "다른 기기로 예매 내역 노출", "한 장에 전부 담기게 사진 촬영"],
    notice: [
      "갤러리 사진은 업로드 불가합니다. (실시간 검증용)",
      "개인정보는 요청자에게 전송하기 전, 1차 AI로 가리고 2차로 직접 수정합니다.",
    ],
    button: "첫 번째 사진 촬영하기",
  },
  2: {
    guideLabel: "미션!",
    guideSteps: ["미션 행동 이행", "다른 기기로 예매 내역 노출", "한 장에 전부 담기게 사진 촬영"],
    notice: [
      "갤러리 사진은 업로드 불가합니다. (실시간 검증용)",
      "개인정보는 구매자에게 전송하기 전 자동으로 숨김처리됩니다.",
    ],
    button: "두 번째 사진 촬영하기",
  },
};

// 첫 번째 · 두 번째 지시 단계 표시
const StyledSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
`;

const StyledMarks = styled.div`
  display: flex;
  align-items: center;

  img {
    display: block;
  }
`;

// 진행 중 단계: 테두리 원 + 가운데 점 ($active: 보라 / 아니면 회색)
const StyledMark = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  box-sizing: border-box;
  border: 1.5px solid ${({ $active }) => ($active ? "#5434d6" : "#4e4a57")};
  border-radius: 99px;
  box-shadow: 0 1px 2px ${({ $active }) => ($active ? "rgba(84, 52, 214, 0.3)" : "rgba(92, 88, 102, 0.3)")};

  &::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: ${({ $active }) => ($active ? "#5434d6" : "#4e4a57")};
  }
`;

// 두 원 사이 점선 (1차 회색, 2차 보라)
const StyledMarkLine = styled.span`
  width: 150px;
  height: 1px;
  background: repeating-linear-gradient(to right, ${({ $color }) => $color} 0 1.97px, transparent 1.97px 3.95px);
`;

const StyledStepLabels = styled.div`
  display: flex;
  gap: 120px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledStepLabel = styled.span`
  color: ${({ $active }) => ($active ? "#5434d6" : "#4e4a57")};
  ${({ $glow }) =>
    $glow &&
    css`
      text-shadow: 0 1px 2px rgba(84, 52, 214, 0.3);
    `}
`;

// 보라 막대 + 지시 제목 + 안내
const StyledMission = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
`;

const StyledMissionTitle = styled.h2`
  display: flex;
  gap: 12px;
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: normal;
  white-space: pre-line;

  &::before {
    content: "";
    flex-shrink: 0;
    width: 10px;
    height: 58px;
    background: #5434d6;
  }
`;

const StyledSmallText = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 타이머 + 인증코드
const StyledTimerGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
`;

const StyledCode = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledCodeLabel = styled.p`
  padding-left: 64px;
  color: ${({ $disabled }) => ($disabled ? "#4e4a57" : "#191919")};
  font-size: 14px;
  font-weight: 600;
`;

const StyledCodeChars = styled.div`
  display: flex;
  gap: 11px;
  justify-content: center;
`;

// 인증코드 한 글자 칸 (2차에서는 흐리게)
const StyledCodeChar = styled.span`
  width: 45px;
  box-sizing: border-box;
  padding: 8px 10px;
  background: ${({ $disabled }) => ($disabled ? "#dedbe5" : "#e5e1f9")};
  border-radius: 10px;
  color: ${({ $disabled }) => ($disabled ? "#a9a4b2" : "#261760")};
  font-family: "esamanru", sans-serif;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
`;

// 촬영 가이드 그림 + 순서 (연보라 카드)
const StyledGuideGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: stretch;
`;

const StyledGuide = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: #f3eff5;
  border: 1px solid #cac0f2;
  border-radius: 20px;
`;

// 폰 + 종이 그림 위에 종이 글씨(살짝 기울임)를 겹침
const StyledGuideImage = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 102px;
  height: 101px;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.25));

  img {
    display: block;
    margin: -1.5px;
  }

  span {
    position: absolute;
    left: 73px;
    top: 77px;
    color: #4e4a57;
    font-family: "esamanru", sans-serif;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    transform: translate(-50%, -50%) rotate(-4.91deg);
  }
`;

const StyledGuideSteps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding-left: 18px;
  color: #4e4a57;
  font-family: "esamanru", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

// 카메라 아이콘 + 글씨 버튼
const StyledShotButton = styled(MainButton)`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    margin: -0.9px;
  }
`;

// 판매자 촬영 지시 화면 (round 1: 1차 인증코드 / round 2: 2차 무작위 지시)
// 촬영 버튼은 카메라로 바로 찍도록 capture 속성을 씀 (모바일 대부분 카메라가 바로 열림)
export default function SellerShot({ round, code, mission, remainSeconds, onShot }) {
  const inputRef = useRef(null);
  const config = ROUND_CONFIG[round];
  const isSecond = round === 2;

  // 2차는 판독 때 손 인식을 하므로 화면에 들어오면 모델을 미리 불러둠
  useEffect(() => {
    if (isSecond) preloadHandRecognizer();
  }, [isSecond]);

  // 찍은 원본 파일을 그대로 넘김 (회전·축소는 판독 단계에서 한 번만)
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    // 같은 사진을 다시 골라도 onChange가 오도록 비움
    e.target.value = "";
    if (file) onShot(file);
  };

  return (
    <>
      <StyledSellerContent $gap={24}>
        <StyledSteps>
          <StyledMarks>
            {isSecond ? <img src={stepDoneIcon} alt="" /> : <StyledMark $active />}
            <StyledMarkLine $color={isSecond ? "#5434d6" : "#4e4a57"} />
            <StyledMark $active={isSecond} />
          </StyledMarks>
          <StyledStepLabels>
            <StyledStepLabel $active $glow={!isSecond}>
              첫 번째 지시
            </StyledStepLabel>
            <StyledStepLabel $active={isSecond}>두 번째 지시</StyledStepLabel>
          </StyledStepLabels>
        </StyledSteps>

        <StyledMission>
          <StyledMissionTitle>{isSecond ? mission : config.title}</StyledMissionTitle>
          <StyledSmallText>
            첫 번째 지시 이행 시 두 번째 지시가 제시됩니다.
            <br />
            두 번째 지시는 1분 타임어택이 존재합니다.
          </StyledSmallText>
        </StyledMission>

        <StyledTimerGroup>
          <CountdownBadge seconds={remainSeconds} />
          <StyledCode aria-label={`인증코드 ${code}`}>
            <StyledCodeLabel $disabled={isSecond}>CODE</StyledCodeLabel>
            <StyledCodeChars>
              {code.split("").map((char, index) => (
                <StyledCodeChar key={index} $disabled={isSecond}>
                  {char}
                </StyledCodeChar>
              ))}
            </StyledCodeChars>
          </StyledCode>
        </StyledTimerGroup>

        <StyledGuideGroup>
          <StyledGuide>
            <StyledGuideImage aria-hidden="true">
              <img src={guideImage} alt="" />
              <span>{config.guideLabel}</span>
            </StyledGuideImage>
            <StyledGuideSteps>
              {config.guideSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </StyledGuideSteps>
          </StyledGuide>
          <StyledSmallText>
            {config.notice[0]}
            <br />
            {config.notice[1]}
          </StyledSmallText>
        </StyledGuideGroup>
      </StyledSellerContent>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      <StyledSellerBottom>
        <StyledShotButton type="button" onClick={() => inputRef.current?.click()}>
          <img src={cameraIcon} alt="" />
          {config.button}
        </StyledShotButton>
      </StyledSellerBottom>
    </>
  );
}
