import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import Button from "../../../components/common/Button.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import CaptureTiles from "../../../components/scan/CaptureTiles.jsx";

// 고를 수 있는 거래 종류
const TRADE_TYPES = ["양도", "대리티켓팅", "취소표 티켓팅", "아이디 옮기기", "기타"];

// 금전 피해 자료는 최대 5장까지
const MAX_EVIDENCE_IMAGES = 5;

// 화면 전체 세로 배치 (요소 사이 16px), 글자 행간은 Figma와 같은 normal
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 맨 위 보라색 큰 제목 '신고하기'
const StyledTitle = styled.p`
  margin: 0;
  color: #5434d6;
  font-family: "esamanru", sans-serif;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
`;

// 입력 영역 하나 (섹션 제목 + 입력 요소, 사이 12px)
const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 섹션 제목 ($small이면 16px, 아니면 20px)
const StyledSectionTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: ${({ $small }) => ($small ? "16px" : "20px")};
  font-weight: 500;
  white-space: nowrap;
`;

// 거래 종류 칩들을 줄바꿈하며 나열
const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 업로드 타일 + 아래 안내 문구 묶음
const StyledUploadGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 업로드, 메모 아래에 붙는 10px 회색 안내 문구
const StyledNote = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 섹션 사이 점선 구분선 (Figma에서 높이 0이라 아래 여백 -1px로 자리를 차지하지 않게 함)
const StyledDivider = styled.hr`
  width: 100%;
  margin: 0 0 -1px;
  border: none;
  border-top: 1px dashed #dedbe5;
`;

// 메모 입력 박스 + 안내 문구 묶음
const StyledMemoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 흰 메모 입력 박스, 입력 전에는 안내 문구와 예시를 겹쳐 보여줌
const StyledMemoBox = styled.div`
  position: relative;
  height: 81px;
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
`;

// 입력 전 겹쳐 보이는 안내 문구 + 예시 (클릭은 아래 입력창으로 통과)
const StyledMemoHint = styled.div`
  position: absolute;
  top: 14px;
  left: 19px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  width: 321px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
`;

// 안내 문구 '사실에 기반한 내용을 입력하세요...' (진한 회색)
const StyledMemoPrompt = styled.span`
  color: #4e4a57;
`;

// 입력 예시 (연한 회색)
const StyledMemoExample = styled.span`
  color: #a9a4b2;
`;

// 실제 메모 입력창 (박스를 꽉 채우고 테두리, 배경 없음)
const StyledMemoInput = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 14px 19px;
  border: none;
  outline: none;
  background: none;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  resize: none;
`;

// 거래 종류, 판매자와 나눈 대화, 금전 피해 자료를 받아 신고 전 AI 판독을 요청하는 화면
export default function Report() {
  const navigate = useNavigate();
  const [tradeType, setTradeType] = useState(null);
  const [chatImages, setChatImages] = useState([]);
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [memo, setMemo] = useState("");

  // 거래 종류와 두 종류의 사진이 모두 있어야 판독 가능
  const canScan = tradeType !== null && chatImages.length > 0 && evidenceImages.length > 0;

  // TODO: API 연동 시 사진과 메모를 함께 보내 판독 요청
  const handleScan = () => {
    navigate("/report/loading", {
      state: {
        tradeType,
        chatCount: chatImages.length,
        evidenceCount: evidenceImages.length,
        memo: memo.trim(),
      },
    });
  };

  return (
    <>
      <BackHeader label="홈" />
      <StyledContent>
        <StyledTitle>신고하기</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>거래 종류를 골라주세요</StyledSectionTitle>
          <StyledChips>
            {TRADE_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant={tradeType === type ? "selected" : "default"}
                aria-pressed={tradeType === type}
                onClick={() => setTradeType(type)}
              >
                {type}
              </Button>
            ))}
          </StyledChips>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>판매자와 나눈 대화 내용을 넣어주세요.</StyledSectionTitle>
          <StyledUploadGroup>
            <CaptureTiles images={chatImages} onChange={setChatImages} scroll />
            <StyledNote>
              개인정보는 자동으로 가려 판독됩니다.
              <br />
              사진은 최대 10장 까지 업로드 가능합니다.(장당 10MB 이내)
            </StyledNote>
          </StyledUploadGroup>
        </StyledSection>

        <StyledDivider />

        <StyledSection>
          <StyledSectionTitle>금전 피해 자료를 넣어주세요.</StyledSectionTitle>
          <StyledUploadGroup>
            <CaptureTiles
              images={evidenceImages}
              onChange={setEvidenceImages}
              maxImages={MAX_EVIDENCE_IMAGES}
              scroll
            />
            <StyledNote>
              판매자와 대화 내용 속 정보와 일치해야합니다.
              <br />
              개인정보는 자동으로 가려 판독됩니다.
              <br />
              사진은 최대 5장 까지 업로드 가능합니다.(장당 10MB 이내)
            </StyledNote>
          </StyledUploadGroup>
        </StyledSection>

        <StyledDivider />

        <StyledSection>
          <StyledSectionTitle $small>추가로 넣을 계좌, 대화, 링크가 있다면 적어주세요.</StyledSectionTitle>
          <StyledMemoGroup>
            <StyledMemoBox>
              {memo === "" && (
                <StyledMemoHint>
                  <StyledMemoPrompt>사실에 기반한 내용을 입력하세요...</StyledMemoPrompt>
                  <StyledMemoExample>
                    예) 국민 123-45-**** 김oo / 3자 사기 무서우니 닉네임으로 입금해주세요
                  </StyledMemoExample>
                </StyledMemoHint>
              )}
              <StyledMemoInput
                aria-label="추가로 넣을 계좌, 대화, 링크"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </StyledMemoBox>
            <StyledNote>캡처 속 계좌번호와 링크는, 판독 결과에서 맞는지 한 번 더 확인합니다.</StyledNote>
          </StyledMemoGroup>
        </StyledSection>

        <MainButton variant="accent" type="button" disabled={!canScan} onClick={handleScan}>
          판독하기
        </MainButton>
      </StyledContent>
    </>
  );
}
