import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import SellerHeader from "../../../components/trueShot/SellerHeader.jsx";
import SellerIntro from "./SellerIntro.jsx";
import { StyledSellerPage } from "./sellerStyles.js";
import { getTrueShotRequest, startSellerSession } from "../../../api/trueShot.js";

// 판매자 트루샷 (구매자가 보낸 링크 /trueshot/seller/:id 로 들어옴)
// 진행 상태는 요청 데이터(localStorage)에 저장해, 새로고침해도 타이머·단계가 이어짐
export default function SellerSession() {
  const { id } = useParams();
  const [request, setRequest] = useState(() => getTrueShotRequest(id));

  // 없는 링크면 홈으로
  if (!request) return <Navigate to="/" replace />;

  const handleStart = () => setRequest(startSellerSession(id));

  return (
    <StyledSellerPage>
      <SellerHeader />
      {!request.firstStartedAt ? <SellerIntro onStart={handleStart} /> : <p>1차 지시 화면 (작업 중)</p>}
    </StyledSellerPage>
  );
}
