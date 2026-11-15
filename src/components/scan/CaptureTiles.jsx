import { useEffect, useRef } from "react";
import styled from "styled-components";
import removeIcon from "../../assets/icons/dispute_photo_sample.svg";
import uploadIcon from "../../assets/icons/dispute_upload.svg";

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

// 캡쳐 사진 업로드 타일 묶음 (images: { id, url }[], 10MB 넘는 사진은 빼고 최대 10장까지)
export default function CaptureTiles({ images, onChange }) {
  // 화면을 떠날 때 미리보기용 임시 URL 정리
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url)), []);

  const addImages = (fileList) => {
    const room = MAX_IMAGES - images.length;
    const added = [...fileList]
      .filter((file) => file.size <= MAX_IMAGE_BYTES)
      .slice(0, room)
      .map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file) }));
    if (added.length > 0) onChange([...images, ...added]);
  };

  const removeImage = (imageId) => {
    const target = images.find(({ id }) => id === imageId);
    URL.revokeObjectURL(target.url);
    onChange(images.filter(({ id }) => id !== imageId));
  };

  return (
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
  );
}
