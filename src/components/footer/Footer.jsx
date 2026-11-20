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
  justify-content: space-between;
  width: 320px;
  height: 70px;
  padding: 0 5px;
  box-sizing: border-box;
  background: #fdfdfd;
  border-radius: 90px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

// 탭 하나: 아이콘 위, 글씨 아래. 현재 페이지면 연보라 배경이 깔림
// 탭 폭 80px 4개(320)가 안쪽 폭 310px에 들어가도록 탭끼리 10/3px씩 겹쳐서, 탭 가운데를 Figma 위치(45, 122, 198.5, 275.5)에 맞춤
// 배경은 양옆 3px씩 안쪽으로만 칠해서(74x60) 옆 탭의 활성, 호버 배경과 약 2.7px 띄움
const StyledTab = styled(Link)`
  flex: 0 0 78px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 90px;
  text-decoration: none;
  color: #4e4a57;
  font-size: 12px;
  font-family: "esamanru", sans-serif;
  font-weight: 500;
  line-height: normal; /* 위에서 물려받은 행간(23.2px)이면 아이콘과 글씨 사이가 벌어져서 글자 크기에 맞는 행간으로 맞춤 */

  & + & {
    margin-left: calc(-10px / 3);
  }

  &.active {
    background: #e4deff;
    color: #5434d6;
  }

  &:not(.active):hover {
    background: #a9a4b2;
  }
`;

// 아이콘 자리 (높이 29): 27px 아이콘은 위에 붙여 아래 2px이 글씨와의 간격이 되고, 29px 카메라 아이콘은 꽉 차서 글씨에 바로 붙음
const StyledIconBox = styled.span`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 29px;
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
              <StyledIconBox>
                <StyledIcon src={active ? iconActive : icon} alt="" />
              </StyledIconBox>
              <span>{label}</span>
            </StyledTab>
          );
        })}
      </StyledNav>
    </StyledFooter>
  );
}
