import { NavLink } from "react-router-dom";
import styled from "styled-components";
import sirenIcon from "../../assets/icons/footer_siren.svg";
import sirenIconActive from "../../assets/icons/footer_siren_active.svg";
import cameraIcon from "../../assets/icons/footer_camera.svg";
import cameraIconActive from "../../assets/icons/footer_camera_active.svg";
import ruleIcon from "../../assets/icons/footer_rule.svg";
import ruleIconActive from "../../assets/icons/footer_rule_active.svg";
import personIcon from "../../assets/icons/footer_person.svg";
import personIconActive from "../../assets/icons/footer_person_active.svg";

const TABS = [
  { to: "/", label: "홈", icon: sirenIcon, iconActive: sirenIconActive, end: true },
  { to: "/trueshot", label: "트루샷", icon: cameraIcon, iconActive: cameraIconActive },
  { to: "/response", label: "대처", icon: ruleIcon, iconActive: ruleIconActive },
  { to: "/myinfo", label: "내 정보", icon: personIcon, iconActive: personIconActive },
];

// 화면 아래에 떠 있는 영역: 탭바를 가운데로 모음
const StyledFooter = styled.footer`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  justify-content: center;
`;

// 둥근 알약 모양 탭바 (320x70)
const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  width: 320px;
  height: 70px;
  padding: 0 5px;
  box-sizing: border-box;
  background: #fdfdfd;
  border-radius: 90px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

// 탭 하나: 아이콘 위, 글씨 아래. 현재 페이지면 연보라 배경이 깔림
const StyledTab = styled(NavLink)`
  flex: 1;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 90px;
  text-decoration: none;
  color: #4e4a57;
  font-size: 12px;
  font-family: "esamanru", sans-serif;
  font-weight: 500;

  &.active {
    background: #e4deff;
    color: #5434d6;
  }

  &:not(.active):hover {
    background: #a9a4b2;
  }
`;

// 아이콘 (SVG 원본 크기 그대로 사용)
const StyledIcon = styled.img`
  display: block;
`;

// 모든 페이지 하단에 공통으로 보이는 탭바 (RootLayout에서 사용)
export default function Footer() {
  return (
    <StyledFooter>
      <StyledNav>
        {TABS.map(({ to, label, icon, iconActive, end }) => (
          <StyledTab key={to} to={to} end={end}>
            {({ isActive }) => (
              <>
                <StyledIcon src={isActive ? iconActive : icon} alt="" />
                <span>{label}</span>
              </>
            )}
          </StyledTab>
        ))}
      </StyledNav>
    </StyledFooter>
  );
}
