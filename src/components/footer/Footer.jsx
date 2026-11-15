import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import sirenIcon from "../../assets/icons/footer_siren.svg";
import sirenIconActive from "../../assets/icons/footer_siren_active.svg";
import cameraIcon from "../../assets/icons/footer_camera.svg";
import cameraIconActive from "../../assets/icons/footer_camera_active.svg";
import ruleIcon from "../../assets/icons/footer_rule.svg";
import ruleIconActive from "../../assets/icons/footer_rule_active.svg";
import personIcon from "../../assets/icons/footer_person.svg";
import personIconActive from "../../assets/icons/footer_person_active.svg";

// matchPrefixes: 이 경로로 시작하는 화면에서도 같은 탭을 활성 처리 (예: 조회·검색결과는 홈 탭 취급)
const TABS = [
  {
    to: "/",
    label: "홈",
    icon: sirenIcon,
    iconActive: sirenIconActive,
    matchPrefixes: ["/", "/search"],
  },
  { to: "/trueshot", label: "트루샷", icon: cameraIcon, iconActive: cameraIconActive, matchPrefixes: ["/trueshot"] },
  { to: "/response", label: "대처", icon: ruleIcon, iconActive: ruleIconActive, matchPrefixes: ["/response"] },
  { to: "/myinfo", label: "내 정보", icon: personIcon, iconActive: personIconActive, matchPrefixes: ["/myinfo"] },
];

// "/"는 정확히 일치할 때만, 나머지는 그 경로로 시작하면 활성 처리
function isTabActive(pathname, matchPrefixes) {
  return matchPrefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

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
const StyledTab = styled(Link)`
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

// 페이지 하단에 공통으로 보이는 탭바 (RootLayout·SubLayout에서 사용, 이의제기 화면은 제외)
export default function Footer() {
  const { pathname } = useLocation();

  return (
    <StyledFooter>
      <StyledNav>
        {TABS.map(({ to, label, icon, iconActive, matchPrefixes }) => {
          const active = isTabActive(pathname, matchPrefixes);
          return (
            <StyledTab key={to} to={to} className={active ? "active" : undefined}>
              <StyledIcon src={active ? iconActive : icon} alt="" />
              <span>{label}</span>
            </StyledTab>
          );
        })}
      </StyledNav>
    </StyledFooter>
  );
}
