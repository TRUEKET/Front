import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import personBadgeIcon from "../../assets/icons/header_person_badge.svg";
import MyInfoPopup from "../header/MyInfoPopup.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";
import { getPhoneLast4 } from "../../api/auth.js";

// 위 12px, 양옆 16px 띄우고 높이 56 안에서 로고는 왼쪽, 배지는 오른쪽
const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 68px;
  padding: 12px 16px 0;
  box-sizing: border-box;
`;

// TRUE-SHOT 로고 글씨 ("TRUE" 검정 + "-SHOT" 보라)
const StyledLogo = styled.h1`
  margin: 0;
  font-family: "esamanru", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: normal;

  span {
    color: #5434d6;
  }
`;

// 사람 배지 아이콘 + 내 번호 뒷자리 (누르면 내 정보 팝업)
const StyledBadge = styled.button`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  color: #4e4a57;
  font-family: "esamanru", sans-serif;
  font-size: 14px;
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

// 비로그인일 때 로그인·회원가입 버튼 (공통 헤더와 같은 모양)
const StyledLoginButton = styled.button`
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #4e4a57;
  font-family: "esamanru", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

// 트루샷 탭 상단 헤더 (로그인: 번호 뒷자리 → 내 정보 팝업 / 비로그인: 로그인·회원가입)
export default function TrueShotHeader() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <StyledHeader>
      <StyledLogo>
        TRUE<span>-SHOT</span>
      </StyledLogo>
      {user ? (
        <StyledBadge type="button" aria-haspopup="dialog" onClick={() => setIsPopupOpen(true)}>
          <StyledBadgeIcon>
            <img src={personBadgeIcon} alt="" />
          </StyledBadgeIcon>
          {getPhoneLast4(user.phone)}
        </StyledBadge>
      ) : (
        <StyledLoginButton type="button" onClick={() => navigate("/auth")}>
          로그인·회원가입
        </StyledLoginButton>
      )}
      {user && isPopupOpen && <MyInfoPopup user={user} onClose={() => setIsPopupOpen(false)} />}
    </StyledHeader>
  );
}
