import { Outlet } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../header/BackHeader.jsx";
import LoginRequired from "./LoginRequired.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";

// 헤더 아래 48px 띄우고 안내를 가운데에 (내 정보 비로그인 화면과 같은 간격)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 16px 16px;
`;

// 로그인이 필요한 화면 묶음 (App.jsx 라우트에서 감쌈)
// 비로그인으로 링크에 직접 들어오면 로그인 안내를 보여주고, 로그인을 마치면 이 화면으로 돌아옴
export default function RequireLogin() {
  const user = useCurrentUser();

  if (user) return <Outlet />;

  return (
    <>
      <BackHeader label="홈" />
      <StyledContent>
        <LoginRequired />
      </StyledContent>
    </>
  );
}
