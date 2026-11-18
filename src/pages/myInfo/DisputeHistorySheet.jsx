import { Fragment } from "react";
import styled from "styled-components";
import ScanBottomSheet from "../../components/scan/ScanBottomSheet.jsx";
import { PhotoTag, TalkDashedLine, TalkLine } from "../home/scan/ScanTalkParts.jsx";

// 시트 위쪽을 화면 위에서 110px까지만 올림 (피그마 기준)
const SHEET_TOP_GAP = 110;

const StyledTitle = styled.p`
  color: #4e4a57;
  font-size: 20px;
  font-weight: 700;
`;

const StyledSubTitle = styled.p`
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

// 판매자가 고른 신청 사유
const StyledReasonChip = styled.span`
  align-self: flex-start;
  padding: 8px 12px;
  background: #e4deff;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: #191919;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`;

// 원본 사진 (사진이 없으면 같은 크기의 회색 자리 표시)
const StyledPhotoPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 322px;
  background: #4e4a57;
  border-radius: 20px;
  color: #fdfdfd;
  font-size: 10px;
  font-weight: 500;
`;

const StyledPhoto = styled.img`
  display: block;
  width: 100%;
  border-radius: 20px;
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #4e4a57;
`;

const StyledDescriptionTitle = styled.p`
  font-size: 16px;
  font-weight: 600;
`;

const StyledDescriptionText = styled.p`
  font-size: 12px;
  font-weight: 500;
`;

// 판매자가 낸 이의제기 신청 사유·사진·설명을 보여주는 바텀시트
// 서버가 사유만 줄 때는 사진·설명 부분을 숨김 (photos·description이 없으면)
export default function DisputeHistorySheet({ dispute, onClose }) {
  return (
    <ScanBottomSheet onClose={onClose} gap={12} background="#fdfdfd" shadow topGap={SHEET_TOP_GAP}>
      <StyledTitle>이의제기 신청 내역</StyledTitle>
      <TalkLine />
      <StyledSubTitle>신청 사유</StyledSubTitle>
      <StyledReasonChip>{dispute.reasonLabel}</StyledReasonChip>
      {(dispute.photos?.length > 0 || dispute.description) && <TalkLine />}

      {(dispute.photos ?? []).map((photo, index) => (
        <Fragment key={index}>
          <PhotoTag photo={index + 1} />
          {photo ? (
            <StyledPhoto src={photo} alt={`사진 ${index + 1} 원본`} />
          ) : (
            <StyledPhotoPlaceholder>사진 원본</StyledPhotoPlaceholder>
          )}
          <TalkDashedLine />
        </Fragment>
      ))}

      {dispute.description && (
        <StyledDescription>
          <StyledDescriptionTitle>설명</StyledDescriptionTitle>
          <StyledDescriptionText>{dispute.description}</StyledDescriptionText>
        </StyledDescription>
      )}
    </ScanBottomSheet>
  );
}
