import { Fragment } from "react";
import styled from "styled-components";
import ScanBottomSheet from "./ScanBottomSheet.jsx";
import { BehaviorChip, PhotoTag, TalkBubble, TalkDashedLine, TalkLine } from "./ScanTalkParts.jsx";

// 시트 위쪽을 헤더 아래(화면 위에서 62px)까지만 올림
const SHEET_TOP_GAP = 62;

const StyledTitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
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

const StyledReason = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

const StyledCaseText = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 400;
`;

// 보라 밑줄 기사 링크
const StyledCaseLink = styled.a`
  align-self: flex-start;
  border-bottom: 1px solid #5434d6;
  color: #5434d6;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
`;

// 주요 대화 카드의 자세히 보기를 누르면 사진 원본과 판단 이유, 실제 사례를 보여주는 바텀시트
export default function TalkDetailSheet({ conversations, onClose }) {
  return (
    <ScanBottomSheet onClose={onClose} gap={12} background="#fdfdfd" shadow topGap={SHEET_TOP_GAP}>
      <StyledTitle>주요 대화</StyledTitle>

      {conversations.map((talk) => (
        <Fragment key={`${talk.photo}-${talk.behavior}`}>
          <TalkLine />
          <StyledGroup $gap={8}>
            <PhotoTag photo={talk.photo} />
            {talk.imageUrl ? (
              <StyledPhoto src={talk.imageUrl} alt={`사진 ${talk.photo} 원본`} />
            ) : (
              <StyledPhotoPlaceholder>사진 원본</StyledPhotoPlaceholder>
            )}
          </StyledGroup>
          <TalkBubble level={talk.level}>{talk.text}</TalkBubble>
          <TalkDashedLine />
          <StyledGroup $gap={8}>
            <BehaviorChip level={talk.level}>{talk.behavior}</BehaviorChip>
            <StyledReason>{talk.reason}</StyledReason>
          </StyledGroup>
          {talk.realCase && (
            <StyledGroup $gap={4}>
              <StyledCaseText>실제 사례: {talk.realCase.summary}</StyledCaseText>
              <StyledCaseLink href={talk.realCase.url} target="_blank" rel="noreferrer">
                {talk.realCase.source} 기사 보기
              </StyledCaseLink>
            </StyledGroup>
          )}
        </Fragment>
      ))}
    </ScanBottomSheet>
  );
}
