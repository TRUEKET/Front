import { useState } from "react";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import AuthTab from "../../components/auth/AuthTab.jsx";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";

// 헤더 아래 16px 띄우고(피그마 기준 탭 시작 y=84), 아래 고정 버튼(50px) + 바닥 여백(12px)만큼 비움
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 16px calc(50px + 12px + 16px);
`;

// 로그인·회원가입 화면 (탭으로 전환, 기본은 로그인)
export default function Auth() {
  const [tab, setTab] = useState("login");

  return (
    <>
      <BackHeader label="홈" />
      <StyledContent>
        <AuthTab value={tab} onChange={setTab} shadow={tab === "signup"} />
        {tab === "login" ? <LoginForm /> : <SignupForm />}
      </StyledContent>
    </>
  );
}
