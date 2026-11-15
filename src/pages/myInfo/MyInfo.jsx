import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MenuRow from "../../components/myInfo/MenuRow.jsx";

// 헤더 아래 48px 띄우고 제목 + 구분선 + 메뉴를 16px 간격으로 나열
const StyledMyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 16px 16px;
  text-align: left;
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

// 내 정보 탭: 계정 정보·신고 리스트·트루샷 리스트 메뉴
// TODO: 내 계정 정보 화면 연결과 로그인/비로그인 분기는 로그인 기능(#34) 병합 후 작업
// 내 트루샷 리스트는 디자인이 없어 아직 동작 없음
export default function MyInfo() {
  const navigate = useNavigate();

  return (
    <StyledMyInfo>
      <StyledTitle>내 정보</StyledTitle>
      <StyledDivider />
      <MenuRow label="내 계정 정보" />
      <MenuRow label="내 신고 리스트" onClick={() => navigate("/myinfo/reports")} />
      <MenuRow label="내 트루샷 리스트" />
    </StyledMyInfo>
  );
}
