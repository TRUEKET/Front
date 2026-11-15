import { Link } from "react-router-dom";
import styled from "styled-components";

// 안내 문구 + 로그인 링크 (가운데)
const StyledLoginRequired = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

const StyledText = styled.p`
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

// 로그인이 필요한 기능 안내 (내 정보·트루샷 비로그인 화면)
export default function LoginRequired() {
  return (
    <StyledLoginRequired>
      <StyledText>회원가입 및 로그인이 필요한 기능입니다.</StyledText>
      <StyledAuthLink to="/auth">로그인·회원가입 하러 가기 →</StyledAuthLink>
    </StyledLoginRequired>
  );
}
