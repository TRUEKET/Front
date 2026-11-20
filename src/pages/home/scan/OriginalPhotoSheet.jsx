import { Fragment } from "react";
import styled from "styled-components";
import ScanBottomSheet from "../../../components/scan/ScanBottomSheet.jsx";
import { PhotoTag, TalkLine } from "./ScanTalkParts.jsx";

// 시트 위쪽을 헤더 아래(화면 위에서 62px)까지만 올림 (주요 대화 시트와 같은 높이)
const SHEET_TOP_GAP = 62;

// 시트 제목 '원본 사진' (주요 대화 시트 제목과 같은 모양)
const StyledTitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

// 사진 번호 태그 + 사진을 8px 간격으로 묶음
const StyledPhotoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 올린 캡처 원본 (시트 폭에 맞추고 세로는 원래 비율대로)
const StyledPhoto = styled.img`
  display: block;
  width: 100%;
  border-radius: 20px;
`;

// 결과 화면의 원본 사진 보기를 누르면 판독에 올린 캡처를 올린 순서대로 보여주는 바텀시트
// photoUrls: 기기에 남아 있는 캡처 미리보기 주소 (서버에서 다시 받지 않음)
export default function OriginalPhotoSheet({ photoUrls, onClose }) {
  return (
    <ScanBottomSheet onClose={onClose} gap={12} background="#fdfdfd" shadow topGap={SHEET_TOP_GAP}>
      <StyledTitle>원본 사진</StyledTitle>
      {photoUrls.map((url, index) => (
        <Fragment key={url}>
          <TalkLine />
          <StyledPhotoGroup>
            <PhotoTag photo={index + 1} />
            <StyledPhoto src={url} alt={`사진 ${index + 1} 원본`} />
          </StyledPhotoGroup>
        </Fragment>
      ))}
    </ScanBottomSheet>
  );
}
