import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import removeIcon from "../../../assets/icons/dispute_photo_sample.svg";
import uploadIcon from "../../../assets/icons/dispute_upload.svg";

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

// 올린 캡쳐 썸네일 + 캡쳐 추가 타일을 가로로 나열
const StyledTiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StyledThumb = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 80.889px;
  height: 104px;
  overflow: hidden;
  background: #fdfdfd;
  border: 1.156px solid #ddd8cf;
  border-radius: 11.556px;
`;

const StyledThumbImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 썸네일 바깥 테두리 기준 위 4.84px, 왼쪽 56.96px (테두리 두께 1.156px만큼 빼서 배치)
const StyledRemoveButton = styled.button`
  position: absolute;
  top: calc(4.84px - 1.156px);
  left: calc(56.96px - 1.156px);
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  img {
    display: block;
  }
`;

// 점선 테두리의 캡쳐 추가 타일 (누르면 이미지 선택창)
const StyledAddTile = styled.label`
  display: flex;
  flex-direction: column;
  gap: 13.867px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 80.889px;
  height: 104px;
  background: #fdfdfd;
  border: 1.156px dashed #c9c3b8;
  border-radius: 5.778px;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16.178px;
  font-weight: 500;
  cursor: pointer;

  input {
    display: none;
  }

  img {
    display: block;
  }
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

  // 화면을 떠날 때 미리보기용 임시 URL 정리
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url)), []);

  // 10MB 넘는 사진은 빼고, 최대 10장까지만 담음
  const addImages = (fileList) => {
    const room = MAX_IMAGES - images.length;
    const added = [...fileList]
      .filter((file) => file.size <= MAX_IMAGE_BYTES)
      .slice(0, room)
      .map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...added]);
  };

  const removeImage = (imageId) => {
    setImages((prev) => {
      const target = prev.find(({ id }) => id === imageId);
      URL.revokeObjectURL(target.url);
      return prev.filter(({ id }) => id !== imageId);
    });
  };

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
              <StyledTiles>
                {images.map((image) => (
                  <StyledThumb key={image.id}>
                    <StyledThumbImage src={image.url} alt="" />
                    <StyledRemoveButton type="button" aria-label="캡쳐 삭제" onClick={() => removeImage(image.id)}>
                      <img src={removeIcon} alt="" />
                    </StyledRemoveButton>
                  </StyledThumb>
                ))}
                {images.length < MAX_IMAGES && (
                  <StyledAddTile>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        addImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <img src={uploadIcon} alt="" />
                    캡쳐 추가
                  </StyledAddTile>
                )}
              </StyledTiles>
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
