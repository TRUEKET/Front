import { useLocation, useNavigate } from "react-router-dom";

// 로그인·회원가입 화면으로 넘길 때 state에 담는 "원래 들어오려던 경로" (예: /trueshot/requests/abc)
export const getFromState = (location) => ({ from: `${location.pathname}${location.search}` });

// 로그인·회원가입 성공 후 이동: 원래 들어오려던 화면이 있으면 그곳, 없으면 홈
// 로그인 화면은 히스토리에서 바꿔치기(replace)해서 뒤로가기로 다시 오지 않게 함
// fromState: 원래 화면에 넘길 state (예: 판독 결과에서 신고 화면으로 넘기던 신고 정보)
export default function useAuthRedirect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const from = state?.from;
  // 앱 안 경로만 허용 (//다른도메인, /auth 자기 자신은 홈으로)
  const isValid = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/auth");

  return () => navigate(isValid ? from : "/", { replace: true, state: isValid ? state?.fromState : undefined });
}
