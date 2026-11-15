import styled from "styled-components";

// 체크박스 + 문구(+ 자세히 보기 링크) 한 줄
const StyledAgree = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  input {
    display: none;
  }
`;

// 15px 네모, 체크되면 보라색으로 채우고 흰 체크 표시 (ReportForm 체크박스와 동일)
const StyledCheckBox = styled.span`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  border: 1px solid ${({ $checked }) => ($checked ? "#5434d6" : "#191919")};
  background: ${({ $checked }) => ($checked ? "#5434d6" : "transparent")};

  &::after {
    content: "";
    display: ${({ $checked }) => ($checked ? "block" : "none")};
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #fdfdfd;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

// 문구 + 링크 세로 배치
const StyledTextGroup = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
`;

// 보라 밑줄 링크 (누르면 체크되지 않고 상세 내용만 엶)
const StyledLink = styled.button`
  padding: 0;
  border: none;
  border-bottom: 1px solid #5434d6;
  background: none;
  color: #5434d6;
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
`;

// 동의 체크박스 (linkText가 있으면 문구 아래 링크를 함께 보여줌)
export default function AgreeCheckbox({ checked, onChange, children, linkText, onLinkClick }) {
  const handleLinkClick = (e) => {
    // 라벨 안의 버튼이라 기본 동작(체크 토글)을 막음
    e.preventDefault();
    onLinkClick?.();
  };

  return (
    <StyledAgree>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <StyledCheckBox $checked={checked} />
      <StyledTextGroup>
        <span>{children}</span>
        {linkText && (
          <StyledLink type="button" onClick={handleLinkClick}>
            {linkText}
          </StyledLink>
        )}
      </StyledTextGroup>
    </StyledAgree>
  );
}
