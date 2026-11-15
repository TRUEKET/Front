import { useEffect, useState } from "react";

// 마감 시각(ms)까지 남은 초를 1초마다 다시 계산 (마감이 없으면 null)
// 시작 시각을 저장해 두고 계산하므로 새로고침해도 이어서 줄어듦
export default function useCountdown(deadline) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) return undefined;

    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [deadline]);

  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
