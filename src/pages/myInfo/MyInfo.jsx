import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import MenuRow from "../../components/myInfo/MenuRow.jsx";
import { getCurrentUser } from "../../api/auth.js";

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

// 비로그인 안내 문구 + 로그인 링크 (가운데)
const StyledGuest = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

const StyledGuestText = styled.p`
  color: #4e4a57;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

// 보라 밑줄 링크 (내 신고 세부의 '이의제기 신청 내역 보기 →'와 같은 모양)
const StyledAuthLink = styled(Link)`
  border-bottom: 1px solid #5434d6;
  color: #5434d6;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
`;

// 내 정보 탭: 비로그인이면 로그인 안내, 로그인이면 계정 정보·신고 리스트·트루샷 리스트 메뉴
// 내 트루샷 리스트는 디자인이 없어 아직 동작 없음
export default function MyInfo() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return (
      <StyledMyInfo>
        <StyledTitleGroup>
          <StyledTitle>내 정보</StyledTitle>
          <StyledDivider />
        </StyledTitleGroup>
        <StyledGuest>
          <StyledGuestText>회원가입 및 로그인이 필요한 기능입니다.</StyledGuestText>
          <StyledAuthLink to="/auth">로그인·회원가입 하러 가기 →</StyledAuthLink>
        </StyledGuest>
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
