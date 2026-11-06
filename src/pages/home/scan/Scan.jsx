import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import CaptureTiles from "../../../components/scan/CaptureTiles.jsx";

// line-height:1로 Figma의 lineHeight 100%에 맞춤
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  line-height: 1;
  text-align: left;
`;

const StyledTitle = styled.p`
  margin: 0;
  color: #5434d6;
  font-family: "esamanru", sans-serif;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledSectionTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: ${({ $small }) => ($small ? "16px" : "20px")};
  font-weight: 500;
  white-space: nowrap;
`;

const StyledUploadGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledNote = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
`;

const StyledDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px dashed #dedbe5;
`;

const StyledMemoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 입력 전에는 안내 문구(진한 색)와 예시(연한 색) 두 줄을 겹쳐 보여줌
const StyledMemoBox = styled.div`
  position: relative;
  height: 81px;
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
`;

const StyledMemoHint = styled.div`
  position: absolute;
  top: 14px;
  left: 19px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 321px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  pointer-events: none;
`;

const StyledMemoPrompt = styled.span`
  color: #4e4a57;
`;

const StyledMemoExample = styled.span`
  color: #a9a4b2;
`;

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

// 푸터 자리에 고정되는 판독하기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
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

// 판매자와 나눈 대화 캡쳐와 추가 정보를 받아 AI 판독을 요청하는 화면
export default function Scan() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [memo, setMemo] = useState("");

  const handleScan = () => {
    navigate("/scan/loading", { state: { imageCount: images.length, memo: memo.trim() } });
  };

  return (
    <>
      <BackHeader label="홈" />
      <StyledContent>
        <StyledTitle>판독하기</StyledTitle>

        <StyledBody>
          <StyledSection>
            <StyledSectionTitle>판매자와 나눈 대화 내용을 넣어주세요.</StyledSectionTitle>
            <StyledUploadGroup>
              <CaptureTiles images={images} onChange={setImages} />
              <StyledNote>
                개인정보는 자동으로 가려 판독됩니다
                <br />
                사진은 최대 10장 까지 업로드 가능합니다(장당 10MB 이내)
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
        </StyledBody>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="accent" disabled={images.length === 0} onClick={handleScan}>
          판독하기
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
