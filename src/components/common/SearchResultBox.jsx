import styled from "styled-components";
import chevronIcon from "../../assets/icons/box_search_chevron.svg";

// 상태별 테두리·배지 색 (status: safe 기본 / caution 의심 / danger 위험)
const STATUS_CONFIG = {
  safe: { border: "none", badge: null },
  caution: {
    border: "1px solid #e0a21c",
    badge: { label: "의심", bg: "#fff4dd", color: "#bf7100" },
  },
  danger: {
    border: "1px solid #ca2317",
    badge: { label: "위험", bg: "#ffdfdf", color: "#a81e14" },
  },
};

// 전체 박스: 계좌번호 + 배지, 신고·제보 건수, 시간, 오른쪽에 화살표
const StyledBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  height: 87px;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #fdfdfd;
  border: ${({ $border }) => $border};
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #a9a4b2;
    border-color: transparent;

    * {
      color: #4e4a57 !important;
    }
  }
`;

const StyledTexts = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
`;

const StyledAccountRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-width: 0;
`;

const StyledAccount = styled.p`
  margin: 0;
  min-width: 0;
  overflow: hidden;
  color: #191919;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledBadge = styled.span`
  padding: 4px 8px;
  border-radius: 5px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const StyledCounts = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  color: #191919;
  white-space: nowrap;
`;

const StyledCount = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledCountLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const StyledCountValue = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const StyledTime = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: #a9a4b2;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

// 화살표는 왼쪽을 가리키는 원본 SVG를 좌우 반전해 오른쪽으로 사용
const StyledChevron = styled.img`
  flex-shrink: 0;
  display: block;
  transform: scaleX(-1);
`;

// 검색 결과 목록 한 줄을 보여주는 박스 (status별로 테두리·배지가 바뀜)
export default function SearchResultBox({
  status = "safe",
  account,
  reportCount,
  suspectCount,
  time,
  ...props
}) {
  const { border, badge } = STATUS_CONFIG[status];

  return (
    <StyledBox type="button" $border={border} {...props}>
      <StyledTexts>
        <StyledAccountRow>
          <StyledAccount>{account}</StyledAccount>
          {badge && (
            <StyledBadge $bg={badge.bg} $color={badge.color}>
              {badge.label}
            </StyledBadge>
          )}
        </StyledAccountRow>
        <StyledCounts>
          <StyledCount>
            <StyledCountLabel>피해 신고</StyledCountLabel>
            <StyledCountValue>{reportCount}</StyledCountValue>
          </StyledCount>
          <StyledCount>
            <StyledCountLabel>의심 제보</StyledCountLabel>
            <StyledCountValue>{suspectCount}</StyledCountValue>
          </StyledCount>
        </StyledCounts>
        <StyledTime>{time}</StyledTime>
      </StyledTexts>
      <StyledChevron src={chevronIcon} alt="" />
    </StyledBox>
  );
}
