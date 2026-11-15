import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import SellerHeader from "../../../components/trueShot/SellerHeader.jsx";
import SellerIntro from "./SellerIntro.jsx";
import SellerShot from "./SellerShot.jsx";
import { StyledSellerPage } from "./sellerStyles.js";
import useCountdown from "../../../hooks/useCountdown.js";
import { getTrueShotRequest, startSellerSession } from "../../../api/trueShot.js";
import { FIRST_SHOT_SECONDS } from "../../../mock/trueShot.js";

// 시작 시각 + 제한 시간 → 마감 시각(ms), 시작 전이면 null
const getDeadline = (startedAt, seconds) => (startedAt ? new Date(startedAt).getTime() + seconds * 1000 : null);

// 판매자 트루샷 (구매자가 보낸 링크 /trueshot/seller/:id 로 들어옴)
// 진행 상태는 요청 데이터(localStorage)에 저장해, 새로고침해도 타이머·단계가 이어짐
export default function SellerSession() {
  const { id } = useParams();
  const [request, setRequest] = useState(() => getTrueShotRequest(id));
  const [photo, setPhoto] = useState(null);
  const firstRemain = useCountdown(getDeadline(request?.firstStartedAt, FIRST_SHOT_SECONDS));

  // 없는 링크면 홈으로
  if (!request) return <Navigate to="/" replace />;

  const handleStart = () => setRequest(startSellerSession(id));

  const renderStage = () => {
    if (!request.firstStartedAt) return <SellerIntro onStart={handleStart} />;
    if (!photo) {
      return <SellerShot round={1} code={request.code} remainSeconds={firstRemain} onShot={setPhoto} />;
    }
    return <p>판독 화면 (작업 중)</p>;
  };

  return (
    <StyledSellerPage>
      <SellerHeader />
      {renderStage()}
    </StyledSellerPage>
  );
}
