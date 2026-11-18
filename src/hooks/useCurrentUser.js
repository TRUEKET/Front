import { useEffect, useSyncExternalStore } from "react";
import { getCurrentUser, loadCurrentUser, subscribeAuthChange } from "../api/auth.js";

// 로그인 사용자: undefined 확인 중 / null 비로그인 / { id, email, phoneLast4 } 로그인
// 처음 쓰일 때 GET /me로 확인하고, 로그인·로그아웃·정보 변경 시 바로 다시 그려짐
export default function useCurrentUser() {
  const user = useSyncExternalStore(subscribeAuthChange, getCurrentUser);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return user;
}
