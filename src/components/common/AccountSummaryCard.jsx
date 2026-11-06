import styled from "styled-components";

// 상태별 느낌표 원·배지 색 (status: safe 기본 / caution 의심 / danger 위험)
const STATUS_CONFIG = {
  safe: { circleBg: null, badge: null },
  caution: { circleBg: "#e0a21c", badge: { label: "의심", bg: "#fff4dd", color: "#bf7100" } },
  danger: { circleBg: "#ca2317", badge: { label: "위험", bg: "#ffdfdf", color: "#a81e14" } },
};

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
`;

// 느낌표 원 + 배지/계좌명 묶음
const StyledRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
`;

// 위험·의심 상태일 때만 보이는 느낌표 원 (안전 상태는 렌더링 안 함)
const StyledWarnCircle = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: #fdfdfd;
  font-family: "esamanru", sans-serif;
  font-weight: 700;
  font-size: 18px;
`;

// 배지 + 계좌명을 세로로 쌓는 영역
const StyledTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
`;

// 의심·위험 상태 배지 (안전 상태는 렌더링 안 함)
const StyledBadge = styled.span`
  padding: 4px 8px;
  border-radius: 5px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

// 계좌명 (한 줄 고정)
const StyledName = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
`;

// 피해 신고·의심 제보 건수 박스를 가로로 나열
const StyledStatRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  color: #4e4a57;
`;

const StyledStatBox = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #dedbe5;
  border-radius: 10px;
`;

const StyledStatLabel = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

const StyledStatValue = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
`;

// 세부정보·이의제기 화면에서 공통으로 쓰는 계좌 요약 카드 (느낌표 원/배지 + 건수)
export default function AccountSummaryCard({
  status = "safe",
  account = "",
  reportCount = "0명",
  suspectCount = "0명",
}) {
  const { circleBg, badge } = STATUS_CONFIG[status];

  return (
    <StyledCard>
      <StyledRow>
        {circleBg && <StyledWarnCircle $bg={circleBg}>!</StyledWarnCircle>}
        <StyledTexts>
          {badge && (
            <StyledBadge $bg={badge.bg} $color={badge.color}>
              {badge.label}
            </StyledBadge>
          )}
          <StyledName>{account}</StyledName>
        </StyledTexts>
      </StyledRow>
      <StyledStatRow>
        <StyledStatBox>
          <StyledStatLabel>실제 피해 신고</StyledStatLabel>
          <StyledStatValue>{reportCount}</StyledStatValue>
        </StyledStatBox>
        <StyledStatBox>
          <StyledStatLabel>사기 의심 제보</StyledStatLabel>
          <StyledStatValue>{suspectCount}</StyledStatValue>
        </StyledStatBox>
      </StyledStatRow>
    </StyledCard>
  );
}
