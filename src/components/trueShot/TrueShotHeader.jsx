import styled from "styled-components";
import personBadgeIcon from "../../assets/icons/header_person_badge.svg";
import { getMyPhoneLast4 } from "../../api/trueShot.js";

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

// 사람 배지 아이콘 + 내 번호 뒷자리
const StyledBadge = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
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

// 트루샷 화면 상단 헤더 (구매자·판매자 공통)
// TODO: '5678'은 목값, 로그인(#34) 병합 후 실제 번호 연결 및 비로그인 처리
export default function TrueShotHeader() {
  return (
    <StyledHeader>
      <StyledLogo>
        TRUE<span>-SHOT</span>
      </StyledLogo>
      <StyledBadge>
        <StyledBadgeIcon>
          <img src={personBadgeIcon} alt="" />
        </StyledBadgeIcon>
        {getMyPhoneLast4()}
      </StyledBadge>
    </StyledHeader>
  );
}
