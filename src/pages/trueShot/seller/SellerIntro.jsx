import { useState } from "react";
import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import checkIcon from "../../../assets/icons/trueshot_check_small.svg";
import dotsIcon from "../../../assets/icons/trueshot_dots.svg";
import shieldIcon from "../../../assets/icons/trueshot_shield.svg";
import { StyledSellerBottom, StyledSellerContent, StyledStepNumber } from "./sellerStyles.js";

// 진행방식 3단계
const PROCESS_STEPS = [
  {
    title: "인증코드와 예매 화면 촬영",
    desc: "인증코드를 종이에 적고 예매 화면과 함께 촬영하는 3분 타임어택 인증을 진행합니다.",
  },
  {
    title: "무작위 지시에 따라 한 장 더 촬영",
    desc: "보다 더 정확한 티켓 소지 유무 확인을 위해 1분 타임어택 인증을 진행합니다.",
  },
  { title: "요청자에게 결과 전달", desc: "촬영 결과에 따른 판정을 구매자에게 송신합니다." },
];

const NEEDED_ITEMS = ["종이와 펜", "예매 사이트를 열어둔 다른 전자 기기"];

// TRUE-SHOT 제목 + 소개 카드
const StyledIntroGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledServiceTitle = styled.p`
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
  text-align: center;

  span {
    color: #5434d6;
  }
`;

// 연보라 배경 + 연보라 테두리 카드
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: #f3eff5;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

const StyledIntro = styled(StyledCard)`
  color: #4e4a57;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const StyledProcess = styled(StyledCard)`
  gap: 11px;
`;

const StyledProcessTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

const StyledStep = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const StyledStepTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledStepTitle = styled.p`
  color: #191919;
  font-size: 12px;
  font-weight: 600;
`;

const StyledStepDesc = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 400;
`;

// 세로 점 세 개
const StyledDots = styled.img`
  display: block;
  align-self: center;
`;

// 인증 시 필요 (양옆 16px)
const StyledNeeded = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
`;

const StyledNeededTitle = styled.p`
  color: #4e4a57;
  font-size: 14px;
  font-weight: 600;
`;

const StyledNeededItem = styled.p`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-size: 12px;
  font-weight: 500;

  img {
    display: block;
    margin: -1px -1px -1.5px;
  }
`;

// 방패 아이콘 + 개인정보 안내 (연보라 박스)
const StyledNotice = styled.p`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  background: #eeebfb;
  border-radius: 20px;
  color: #261760;
  font-size: 12px;
  font-weight: 400;

  img {
    display: block;
    flex-shrink: 0;
  }
`;

// 동의 체크박스 (15px 네모, 체크되면 보라색으로 꽉 채움, 체크 표시 없음)
const StyledAgree = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  input {
    display: none;
  }
`;

const StyledCheckBox = styled.span`
  flex-shrink: 0;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  border: 1px solid ${({ $checked }) => ($checked ? "#5434d6" : "#191919")};
  background: ${({ $checked }) => ($checked ? "#5434d6" : "transparent")};
`;

// 판매자 입장 화면: 트루샷 안내 + 전달 동의 후 인증 시작
export default function SellerIntro({ onStart }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <StyledSellerContent>
        <StyledIntroGroup>
          <StyledServiceTitle>
            TRUE-<span>SHOT</span>
          </StyledServiceTitle>
          <StyledIntro>
            <p>
              트루샷은 양도 시 티켓 사기를 방지하기 위한
              <br />
              실시간 사진 인증 서비스입니다.
            </p>
          </StyledIntro>
        </StyledIntroGroup>

        <StyledProcess>
          <StyledProcessTitle>진행방식</StyledProcessTitle>
          {PROCESS_STEPS.map(({ title, desc }, index) => (
            <StyledStep key={title}>
              <StyledStepNumber>{index + 1}</StyledStepNumber>
              <StyledStepTexts>
                <StyledStepTitle>{title}</StyledStepTitle>
                <StyledStepDesc>{desc}</StyledStepDesc>
              </StyledStepTexts>
            </StyledStep>
          ))}
        </StyledProcess>

        <StyledDots src={dotsIcon} alt="" />

        <StyledNeeded>
          <StyledNeededTitle>인증 시 필요</StyledNeededTitle>
          {NEEDED_ITEMS.map((item) => (
            <StyledNeededItem key={item}>
              <img src={checkIcon} alt="" />
              {item}
            </StyledNeededItem>
          ))}
        </StyledNeeded>

        <StyledNotice>
          <img src={shieldIcon} alt="" />
          QR·이름·예매번호는 요청자에게 보내기 전에 가릴 수 있습니다. 사진 원본은 저장되지 않습니다.
        </StyledNotice>

        <StyledAgree>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <StyledCheckBox $checked={agreed} />
          인증 사진을 요청자에게 전달하는 것에 동의합니다
        </StyledAgree>
      </StyledSellerContent>

      <StyledSellerBottom>
        <MainButton type="button" disabled={!agreed} onClick={onStart}>
          인증 시작하기
        </MainButton>
      </StyledSellerBottom>
    </>
  );
}
