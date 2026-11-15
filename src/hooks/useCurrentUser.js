import { useEffect, useState } from "react";
import { getCurrentUser, subscribeAuthChange } from "../api/auth.js";

// 로그인 사용자 ({ email, phone } 또는 null), 로그인·로그아웃·정보 변경 시 바로 다시 그려짐
export default function useCurrentUser() {
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => subscribeAuthChange(() => setUser(getCurrentUser())), []);

  return user;
}
