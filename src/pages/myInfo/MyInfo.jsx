import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MenuRow from "../../components/myInfo/MenuRow.jsx";
import LoginRequired from "../../components/common/LoginRequired.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";

// 헤더 아래 48px 띄우고 제목 + 구분선 + 메뉴를 16px 간격으로 나열
const StyledMyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 16px 16px;
  text-align: left;
`;

// 비로그인: 제목·구분선 사이 8px (피그마 기준)
const StyledTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledTitle = styled.p`
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
`;

const StyledDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: none;
  background: #dedbe5;
`;

// 내 정보 탭: 비로그인이면 로그인 안내, 로그인이면 계정 정보·신고 리스트·트루샷 리스트 메뉴
// 내 트루샷 리스트는 디자인이 없어 아직 동작 없음
export default function MyInfo() {
  const navigate = useNavigate();
  const user = useCurrentUser();

  // 로그인 확인 중: 제목만 (안내가 깜빡이지 않게)
  if (user === undefined) {
    return (
      <StyledMyInfo>
        <StyledTitle>내 정보</StyledTitle>
      </StyledMyInfo>
    );
  }

  if (!user) {
    return (
      <StyledMyInfo>
        <StyledTitleGroup>
          <StyledTitle>내 정보</StyledTitle>
          <StyledDivider />
        </StyledTitleGroup>
        <LoginRequired />
      </StyledMyInfo>
    );
  }

  return (
    <StyledMyInfo>
      <StyledTitle>내 정보</StyledTitle>
      <StyledDivider />
      <MenuRow label="내 계정 정보" onClick={() => navigate("/myinfo/account")} />
      <MenuRow label="내 신고 리스트" onClick={() => navigate("/myinfo/reports")} />
      <MenuRow label="내 트루샷 리스트" />
    </StyledMyInfo>
  );
}
