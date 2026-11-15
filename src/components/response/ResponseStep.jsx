import { useId } from "react";
import styled from "styled-components";
import chevronIcon from "../../assets/icons/box_search_chevron.svg";

// 단계 카드 (접힌 상태는 그림자, 펼친 상태는 그림자 없음 - 피그마 기준)
const StyledStep = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: ${({ $open }) => ($open ? "none" : "0 1px 5px rgba(23, 21, 28, 0.2)")};
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 번호 + 제목 + 화살표 (누르면 펼침/접힘)
const StyledToggle = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const StyledTitleGroup = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 검정 동그라미 단계 번호 (30x30)
const StyledNumber = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background: #191919;
  color: #fdfdfd;
  font-size: 16px;
  font-weight: 700;
`;

const StyledTitle = styled.span`
  color: #191919;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`;

// 오른쪽 화살표 아이콘을 돌려서 접힘(아래) / 펼침(위) 표시
// 피그마 기준 화살표가 내용 영역 오른쪽 끝(342)에서 시작해 352.5까지 걸쳐 있어 음수 여백으로 맞춤
const StyledChevron = styled.img`
  display: block;
  flex-shrink: 0;
  margin-right: -8px;
  transform: rotate(${({ $open }) => ($open ? "-90deg" : "90deg")});
`;

// 대처 단계 아코디언 카드 (gap: 펼쳤을 때 제목과 내용 사이 간격)
export default function ResponseStep({ number, title, open, onToggle, gap = 17, children }) {
  const contentId = useId();

  return (
    <StyledStep $open={open} $gap={gap}>
      <StyledToggle type="button" aria-expanded={open} aria-controls={contentId} onClick={onToggle}>
        <StyledTitleGroup>
          <StyledNumber>{number}</StyledNumber>
          <StyledTitle>{title}</StyledTitle>
        </StyledTitleGroup>
        <StyledChevron src={chevronIcon} alt="" $open={open} />
      </StyledToggle>
      {open && <div id={contentId}>{children}</div>}
    </StyledStep>
  );
}
