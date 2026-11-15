import styled from "styled-components";

// 판독결과 화면과 대화 자세히보기 바텀시트가 같이 쓰는 칩, 말풍선, 구분선

// 행동 칩·대화 말풍선의 단계별 색 (level: safe 해당 없음 / caution 의심 / danger 위험)
const LEVEL_STYLE = {
  safe: { bg: "#d6f7e3", color: "#1d6b43", border: "transparent" },
  caution: { bg: "#fff4dd", color: "#bf7100", border: "#e0a21c" },
  danger: { bg: "#ffdfdf", color: "#a81e14", border: "#ca2317" },
};

const StyledChip = styled.span`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  padding: 6px 12px;
  background: ${({ $level }) => LEVEL_STYLE[$level].bg};
  border-radius: 20px;
  box-shadow: 0 1px 1px rgba(92, 88, 102, 0.3);
  color: ${({ $level }) => LEVEL_STYLE[$level].color};
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  white-space: nowrap;
`;

const StyledChipMark = styled.span`
  font-family: "esamanru", sans-serif;
  font-weight: 500;
`;

// 선이 자리를 차지하지 않도록 위로 1px 당겨서 그림 (위아래 간격이 그대로 12px)
const StyledLine = styled.hr`
  width: 100%;
  height: 1px;
  margin: -1px 0 0;
  border: none;
  background: #dedbe5;
`;

// 2px 선 + 2px 빈칸 점선 (양 끝은 1px)
const StyledDashedLine = styled(StyledLine)`
  background: repeating-linear-gradient(to right, #dedbe5 0 2px, transparent 2px 4px);
  background-position: -1px 0;
`;

const StyledPhotoTag = styled.span`
  align-self: flex-start;
  padding: 4px 12px;
  background: #eeebfb;
  border-radius: 10px;
  color: #5434d6;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

// 왼쪽 위만 각진 말풍선
const StyledBubble = styled.p`
  margin: 0;
  padding: 12px 16px;
  background: ${({ $level }) => LEVEL_STYLE[$level].bg};
  border: 1px solid ${({ $level }) => LEVEL_STYLE[$level].border};
  border-radius: 0 20px 20px 20px;
  color: #4e4a57;
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
`;

// 행동 칩 (의심·위험이면 앞에 느낌표)
export function BehaviorChip({ level, children }) {
  return (
    <StyledChip $level={level}>
      {level !== "safe" && <StyledChipMark>!</StyledChipMark>}
      {children}
    </StyledChip>
  );
}

// 회색 실선 구분선
export function TalkLine() {
  return <StyledLine />;
}

// 회색 점선 구분선
export function TalkDashedLine() {
  return <StyledDashedLine />;
}

// "사진 1" 같은 보라 태그
export function PhotoTag({ photo }) {
  return <StyledPhotoTag>사진 {photo}</StyledPhotoTag>;
}

// 대화 말풍선 (level에 따라 배경, 테두리 색이 바뀜)
export function TalkBubble({ level, children }) {
  return <StyledBubble $level={level}>{children}</StyledBubble>;
}
