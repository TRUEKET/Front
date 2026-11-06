import { Link } from "react-router-dom";
import styled from "styled-components";
import ticketIcon from "../../assets/icons/header_puple_tictek.svg";

// 헤더 전체 영역: 로고 블럭은 왼쪽 끝, 로그인 버튼은 오른쪽 끝에 붙임
const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 0; /* 위 14px, 양옆 16px */
`;

// 로고 블럭: 아이콘 + TRUE:KET 글씨를 하나로 묶음 (글씨는 아래쪽에 맞춤), 누르면 홈으로 이동
const StyledLogo = styled(Link)`
  display: flex;
  align-items: flex-end;
  gap: 12px; /* 아이콘과 글씨 사이 간격 */
  text-decoration: none;
`;

// 티켓 아이콘 (40x40)
const StyledIcon = styled.img`
  width: 40px;
  height: 40px;
`;

// TRUE:KET 글씨를 감싸는 제목 태그 (기본 여백 제거)
const StyledLogoText = styled.h1`
  margin: 0;
  line-height: 1;
`;

// "TRUE:" 부분 (검정색)
const StyledTrueketspan01 = styled.span`
  color: #191919;
  font-size: 28px;
  font-family: "esamanru", sans-serif;
  font-weight: 700;
  word-wrap: break-word;
`;

// "KET" 부분 (보라색)
const StyledTrueketspan02 = styled.span`
  color: #5434d6;
  font-size: 28px;
  font-family: "esamanru", sans-serif;
  font-weight: 700;
  word-wrap: break-word;
`;

// 로그인·회원가입 버튼 (버튼 기본 테두리/배경 제거)
const StyledLoginButton = styled.button`
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #4e4a57;
  font-size: 12px;
  font-family: "esamanru", sans-serif;
  font-weight: 500;
  word-wrap: break-word;
`;

// 모든 페이지 상단에 공통으로 보이는 헤더 (RootLayout에서 사용)
export default function Header() {
  return (
    <StyledHeader>
      <StyledLogo to="/">
        <StyledIcon src={ticketIcon} alt="TRUE:KET 아이콘" />
        <StyledLogoText>
          <StyledTrueketspan01>TRUE:</StyledTrueketspan01>
          <StyledTrueketspan02>KET</StyledTrueketspan02>
        </StyledLogoText>
      </StyledLogo>
      <StyledLoginButton type="button">로그인·회원가입</StyledLoginButton>
    </StyledHeader>
  );
}
