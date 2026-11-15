import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import SellerHeader from "../../../components/trueShot/SellerHeader.jsx";
import SellerIntro from "./SellerIntro.jsx";
import SellerShot from "./SellerShot.jsx";
import SellerJudging from "./SellerJudging.jsx";
import MaskEditor from "./MaskEditor.jsx";
import { StyledSellerPage } from "./sellerStyles.js";
import useCountdown from "../../../hooks/useCountdown.js";
import { getTrueShotRequest, judgeSellerShot, saveFirstShot, startSellerSession } from "../../../api/trueShot.js";
import { FIRST_SHOT_SECONDS, JUDGE_LOADING_MS, SECOND_SHOT_SECONDS } from "../../../mock/trueShot.js";

// 시작 시각 + 제한 시간 → 마감 시각(ms), 시작 전이면 null
const getDeadline = (startedAt, seconds) => (startedAt ? new Date(startedAt).getTime() + seconds * 1000 : null);

// 판매자 트루샷 (구매자가 보낸 링크 /trueshot/seller/:id 로 들어옴)
// 진행 상태는 요청 데이터(localStorage)에 저장해, 새로고침해도 타이머·단계가 이어짐
// 확인용: 주소에 ?mock=fail1 / ?mock=fail2 를 붙이면 1차·2차 AI 판독이 실패함
export default function SellerSession() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [request, setRequest] = useState(() => getTrueShotRequest(id));
  // 지금 회차에서 찍은 사진과 판독 결과 (판독 중이면 judge가 null)
  const [shot, setShot] = useState(null);
  const [judge, setJudge] = useState(null);
  const [masking, setMasking] = useState(false);

  // 1차를 마치면(가리기 저장) 2차
  const round = request?.firstShotAt ? 2 : 1;
  const firstRemain = useCountdown(getDeadline(request?.firstStartedAt, FIRST_SHOT_SECONDS));
  const secondRemain = useCountdown(getDeadline(request?.secondStartedAt, SECOND_SHOT_SECONDS));
  const remainSeconds = round === 1 ? firstRemain : secondRemain;

  // 사진을 찍으면 잠시 판독 로딩을 보여준 뒤 결과
  useEffect(() => {
    if (!shot || judge) return undefined;

    const timer = setTimeout(() => {
      const forceFail = searchParams.get("mock") === `fail${round}`;
      setJudge(judgeSellerShot(getTrueShotRequest(id), round, { forceFail }));
    }, JUDGE_LOADING_MS);
    return () => clearTimeout(timer);
  }, [shot, judge, id, round, searchParams]);

  // 없는 링크면 홈으로
  if (!request) return <Navigate to="/" replace />;

  const handleStart = () => setRequest(startSellerSession(id));

  const handleShot = (photo) => {
    setJudge(null);
    setShot(photo);
  };

  // 1차 실패 모달에서 다시 찍기: 1차 촬영 화면으로 (타이머는 계속)
  const handleRetry = () => {
    setShot(null);
    setJudge(null);
  };

  // 1차 가리기 저장 → 2차 지시로
  const handleFirstMasked = (photo) => {
    setRequest(saveFirstShot(id, photo));
    setShot(null);
    setJudge(null);
    setMasking(false);
  };

  const renderStage = () => {
    if (!request.firstStartedAt) return <SellerIntro onStart={handleStart} />;

    if (round === 1) {
      if (masking) return <MaskEditor photo={shot} buttonLabel="저장 및 2차 인증 시작하기" onDone={handleFirstMasked} />;
      if (shot) {
        return (
          <SellerJudging judge={judge} remainSeconds={firstRemain} onRetry={handleRetry} onNext={() => setMasking(true)} />
        );
      }
    }

    if (round === 2) {
      // 2차는 결과 모달 없이 로딩 후 결과 화면으로
      if (shot && !judge) return <SellerJudging judge={null} />;
      if (shot && judge) return <p>2차 결과 (작업 중)</p>;
    }

    return (
      <SellerShot
        round={round}
        code={request.code}
        mission={request.secondMission}
        remainSeconds={remainSeconds}
        onShot={handleShot}
      />
    );
  };

  // 판독 로딩 화면엔 헤더가 없음
  const isJudging = shot && !masking && (round === 1 || !judge);

  return (
    <StyledSellerPage>
      {!isJudging && <SellerHeader />}
      {renderStage()}
    </StyledSellerPage>
  );
}
