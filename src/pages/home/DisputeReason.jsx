import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MainButton from "../../components/common/MainButton.jsx";
import { MOCK_DISPUTE_REASONS } from "../../mock/disputeReason.js";

// line-height:1로 Figma의 lineHeight 100%에 맞춤
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

const StyledOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 선택 시 보라 테두리, 미선택은 투명 테두리로 두어 선택해도 카드 높이가 바뀌지 않게 함
const StyledOption = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 2px solid ${({ $selected }) => ($selected ? "#5434d6" : "transparent")};
  border-radius: 20px;
  cursor: pointer;
`;

const StyledRadio = styled.span`
  flex-shrink: 0;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  border: 1px solid ${({ $selected }) => ($selected ? "#5434d6" : "#4e4a57")};
  border-radius: 99px;
  background: ${({ $selected }) => ($selected ? "#5434d6" : "#ffffff")};
`;

const StyledOptionTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
  text-align: left;
`;

const StyledOptionTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
`;

const StyledOptionSub = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

// 기타 사유 입력칸: 밑줄만 있고 글자 길이에 맞춰 늘어남
const StyledEtcInput = styled.input`
  field-sizing: content;
  max-width: 100%;
  height: 12px;
  padding: 0;
  border: none;
  border-bottom: 1px solid #a9a4b2;
  border-radius: 0;
  outline: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;

  &::placeholder {
    color: #4e4a57;
  }
`;

// 푸터 자리에 고정되는 다음 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
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

// 이의제기 사유를 고르는 화면 (안내 화면 → 이유 선정 → 증빙 제출)
export default function DisputeReason() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reason, setReason] = useState(null);
  const [etcText, setEtcText] = useState("");

  const canProceed = reason !== null && (reason !== "etc" || etcText.trim() !== "");

  const handleNext = () => {
    navigate("/search/dispute/evidence", {
      state: { ...state, reason, reasonText: reason === "etc" ? etcText.trim() : "" },
    });
  };

  return (
    <>
      <BackHeader label="뒤로 가기" />
      <StyledContent>
        <StyledTitle>이유 선정</StyledTitle>
        <StyledOptionList role="radiogroup">
          {MOCK_DISPUTE_REASONS.map(({ id, title, sub }) => {
            const selected = reason === id;
            return (
              <StyledOption
                key={id}
                role="radio"
                aria-checked={selected}
                $selected={selected}
                onClick={() => setReason(id)}
              >
                <StyledRadio $selected={selected} />
                <StyledOptionTexts>
                  <StyledOptionTitle>{title}</StyledOptionTitle>
                  {id === "etc" ? (
                    <StyledEtcInput
                      type="text"
                      placeholder=": 사유를 입력하세요..."
                      value={etcText}
                      onChange={(e) => setEtcText(e.target.value)}
                      onFocus={() => setReason("etc")}
                    />
                  ) : (
                    <StyledOptionSub>{sub}</StyledOptionSub>
                  )}
                </StyledOptionTexts>
              </StyledOption>
            );
          })}
        </StyledOptionList>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="accent" disabled={!canProceed} onClick={handleNext}>
          다음
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
