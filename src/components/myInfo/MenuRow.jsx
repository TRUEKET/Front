import styled from "styled-components";
import chevronIcon from "../../assets/icons/box_chevron_right.svg";

// 흰 카드 한 줄 (높이 50): 왼쪽 메뉴 이름, 오른쪽 자세히 보기 + 화살표
const StyledRow = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  padding: 12px 16px;
  border: none;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  cursor: pointer;
`;

const StyledLabel = styled.span`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
`;

// 왼쪽을 보는 화살표 원본을 뒤집어 오른쪽을 보게 함
const StyledMore = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;

  img {
    display: block;
    transform: scaleX(-1);
  }
`;

// 내 정보 화면의 메뉴 한 줄 (onClick이 없으면 눌러도 아무 동작 없음)
export default function MenuRow({ label, onClick }) {
  return (
    <StyledRow type="button" onClick={onClick}>
      <StyledLabel>{label}</StyledLabel>
      <StyledMore>
        자세히 보기
        <img src={chevronIcon} alt="" />
      </StyledMore>
    </StyledRow>
  );
}
