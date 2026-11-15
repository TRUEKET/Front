import { Fragment } from "react";
import styled from "styled-components";
import { BehaviorChip, PhotoTag, TalkBubble, TalkDashedLine, TalkLine } from "../../pages/home/scan/ScanTalkParts.jsx";
import chevronIcon from "../../assets/icons/box_chevron_right.svg";

// 흰 배경 + 연보라 테두리 카드
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 카드 윗줄: 제목 묶음 + 자세히 보기 버튼 (아래쪽 맞춤)
const StyledHeader = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

// '주요 대화' 제목 + 요약 문구, 자세히 보기 버튼을 뺀 나머지 폭을 모두 차지
const StyledTitleGroup = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledTitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

// 요약 문구 ($size로 글자 크기 지정)
const StyledSummary = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: ${({ $size }) => `${$size}px`};
  font-weight: 500;
`;

// 자세히 보기 버튼 (화살표 아이콘을 좌우로 뒤집어 방향을 맞춤)
const StyledMoreButton = styled.button`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  img {
    display: block;
    transform: scaleX(-1);
  }
`;

// 대화 한 건 안의 작은 묶음 (사진 태그 + 말풍선 / 행동 칩 + 이유)
const StyledTalkItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 그 행동을 사기 의심으로 본 이유 설명
const StyledReason = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 400;
`;

// 주요 대화 카드 (판독 결과·내 신고 세부 정보 공통)
// conversations: 의심 대화 목록, summary·summarySize: 제목 아래 요약 문구와 글자 크기
// onMore: 자세히 보기 (없으면 버튼 숨김), children: 의심 대화가 없을 때 대신 보여줄 내용
export default function TalkCard({ conversations, summary, summarySize = 10, onMore, children }) {
  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitleGroup>
          <StyledTitle>주요 대화</StyledTitle>
          <StyledSummary $size={summarySize}>{summary}</StyledSummary>
        </StyledTitleGroup>
        {onMore && (
          <StyledMoreButton type="button" onClick={onMore}>
            자세히 보기
            <img src={chevronIcon} alt="" />
          </StyledMoreButton>
        )}
      </StyledHeader>

      {conversations.length > 0
        ? conversations.map((talk) => (
            <Fragment key={`${talk.photo}-${talk.behavior}`}>
              <TalkLine />
              <StyledTalkItem>
                <PhotoTag photo={talk.photo} />
                <TalkBubble level={talk.level}>{talk.text}</TalkBubble>
              </StyledTalkItem>
              <TalkDashedLine />
              <StyledTalkItem>
                <BehaviorChip level={talk.level}>{talk.behavior}</BehaviorChip>
                <StyledReason>{talk.reason}</StyledReason>
              </StyledTalkItem>
            </Fragment>
          ))
        : children}
    </StyledCard>
  );
}
