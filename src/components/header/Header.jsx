import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ticketIcon from "../../assets/icons/header_puple_tictek.svg";
import personBadgeIcon from "../../assets/icons/header_person_badge.svg";
import MyInfoPopup from "./MyInfoPopup.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";

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

// 로그인 상태 버튼: 사람 배지 아이콘 + 전화번호 뒷자리, 누르면 내 정보로 이동
const StyledUserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  color: #4e4a57;
  font-size: 14px;
  font-family: "esamanru", sans-serif;
  font-weight: 300;
`;

// 아이콘 영역 20x20 안에 15x20 배지를 가운데 배치
const StyledBadgeIcon = styled.span`
  display: flex;
  justify-content: center;
  width: 20px;
  height: 20px;

  img {
    display: block;
  }
`;

// 오른쪽(로그인 버튼·번호 배지)을 비워두는 화면 (피그마 기준 대처 화면)
const HIDE_ACCOUNT_PATHS = ["/response"];

// 모든 페이지 상단에 공통으로 보이는 헤더 (RootLayout에서 사용)
export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hideAccount = HIDE_ACCOUNT_PATHS.includes(pathname);
  const user = useCurrentUser();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <StyledHeader>
      <StyledLogo to="/">
        <StyledIcon src={ticketIcon} alt="TRUE:KET 아이콘" />
        <StyledLogoText>
          <StyledTrueketspan01>TRUE:</StyledTrueketspan01>
          <StyledTrueketspan02>KET</StyledTrueketspan02>
        </StyledLogoText>
      </StyledLogo>
      {/* 로그인 확인 중(user === undefined)에는 비워 둠 (새로고침 시 로그인 버튼이 깜빡이지 않게) */}
      {hideAccount || user === undefined ? null : user ? (
        <StyledUserButton type="button" aria-haspopup="dialog" onClick={() => setIsPopupOpen(true)}>
          <StyledBadgeIcon>
            <img src={personBadgeIcon} alt="" />
          </StyledBadgeIcon>
          {user.phoneLast4}
        </StyledUserButton>
      ) : (
        <StyledLoginButton type="button" onClick={() => navigate("/auth")}>
          로그인·회원가입
        </StyledLoginButton>
      )}
      {user && isPopupOpen && <MyInfoPopup user={user} onClose={() => setIsPopupOpen(false)} />}
    </StyledHeader>
  );
}
