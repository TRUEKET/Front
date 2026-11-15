import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backArrow from "../../assets/icons/header_backarrow.svg";

// 헤더 전체 영역: 화살표+글씨를 왼쪽 끝에 붙임
const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 12px 16px 0; /* 위 12px, 양옆 16px */
  box-sizing: border-box;
`;

// 화살표와 글씨를 하나로 묶은 버튼 (버튼 기본 테두리/배경 제거)
const StyledBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px; /* 화살표와 글씨 사이 간격 */
  height: 44px; /* 손가락으로 누르기 편한 높이 */
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: #4e4a57;
  font-size: 14px;
  font-family: "esamanru", sans-serif;
  font-weight: 300;
`;

// 뒤로 가기 화살표 (SVG 원본 크기 그대로 사용)
const StyledArrow = styled.img`
  display: block;
`;

// 조회·세부정보 등 하위 페이지 상단에 쓰는 헤더, 누르면 브라우저 히스토리상 이전 페이지로 이동
export default function BackHeader({ label = "홈" }) {
  const navigate = useNavigate();

  return (
    <StyledHeader>
      <StyledBackButton type="button" onClick={() => navigate(-1)}>
        <StyledArrow src={backArrow} alt="" />
        <span>{label}</span>
      </StyledBackButton>
    </StyledHeader>
  );
}
