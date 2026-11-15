import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SellerHeader from "../../../components/trueShot/SellerHeader.jsx";
import SellerIntro from "./SellerIntro.jsx";
import SellerShot from "./SellerShot.jsx";
import SellerJudging from "./SellerJudging.jsx";
import MaskEditor from "./MaskEditor.jsx";
import SellerResult from "./SellerResult.jsx";
import { StyledSellerPage } from "./sellerStyles.js";
import useCountdown from "../../../hooks/useCountdown.js";
import { extractHands, prepareShotImage, requestHandAnalyze } from "../../../api/handAnalyze.js";
import {
  completeSellerSession,
  failSellerSession,
  getSecondMissionText,
  getSellerFailReasons,
  getTrueShotRequest,
  isExpired,
  judgeSellerShot,
  saveFirstShot,
  startSellerSession,
} from "../../../api/trueShot.js";
import {
  EXPIRED_REASONS,
  FIRST_SHOT_SECONDS,
  JUDGE_LOADING_MS,
  SECOND_SHOT_SECONDS,
  SESSION_FAIL_REASONS,
} from "../../../mock/trueShot.js";

// 시작 시각 + 제한 시간 → 마감 시각(ms), 시작 전이면 null
const getDeadline = (startedAt, seconds) => (startedAt ? new Date(startedAt).getTime() + seconds * 1000 : null);

// 판매자 트루샷 (구매자가 보낸 링크 /trueshot/seller/:id 로 들어옴)
// 진행 상태는 요청 데이터(localStorage)에 저장해, 새로고침해도 타이머·단계가 이어짐
// 확인용: 주소에 ?mock=fail1 / ?mock=fail2 를 붙이면 1차·2차 AI 판독이 실패함
export default function SellerSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [request, setRequest] = useState(() => getTrueShotRequest(id));
  // 지금 회차에서 찍은 사진 { canvas, blob, dataUrl }과 판독 결과 (판독 중이면 judge가 null)
  const [shot, setShot] = useState(null);
  const [judge, setJudge] = useState(null);
  const [masking, setMasking] = useState(false);

  // 1차를 마치면(가리기 저장) 2차
  const round = request?.firstShotAt ? 2 : 1;
  const firstRemain = useCountdown(getDeadline(request?.firstStartedAt, FIRST_SHOT_SECONDS));
  const secondRemain = useCountdown(getDeadline(request?.secondStartedAt, SECOND_SHOT_SECONDS));
  const remainSeconds = round === 1 ? firstRemain : secondRemain;

  // 판독을 통과하기 전에 이번 회차 시간이 다 되면 타임어택 실패
  const timedOut =
    Boolean(request?.firstStartedAt) && request.result === null && remainSeconds === 0 && !judge?.passed;

  // 타임어택 실패는 저장만 하고(화면은 timedOut으로 바로 바뀜), 구매자 결과도 실패로 바뀜
  useEffect(() => {
    if (timedOut) failSellerSession(id, SESSION_FAIL_REASONS[round === 1 ? "firstTimeout" : "secondTimeout"]);
  }, [timedOut, id, round]);

  // 사진을 찍으면 판독 (판독 로딩은 판독이 끝날 때와 최소 시간 중 늦은 쪽까지)
  // 2차는 MediaPipe로 손 좌표·손 모양을 뽑아 손 분석 요청 (지금은 목업 응답)
  useEffect(() => {
    if (!shot || judge) return undefined;
    let cancelled = false;

    const run = async () => {
      const startedAt = Date.now();
      const forceFail = searchParams.get("mock") === `fail${round}`;
      const latest = getTrueShotRequest(id);
      let result;

      if (round === 1) {
        result = judgeSellerShot(latest, 1, { forceFail });
      } else {
        const analysis = await extractHands(shot.canvas);
        if (import.meta.env.DEV) console.info("[hand-analyze]", analysis);
        try {
          result = await requestHandAnalyze({ request: latest, image: shot.blob, analysis, forceFail });
        } catch (error) {
          // TODO: 백엔드 연동 후 요청 실패 시 처리 방식 정하기 (지금은 2차 판독 실패로 봄)
          console.error(error);
          result = judgeSellerShot(latest, 2, { forceFail: true });
        }
      }

      const wait = JUDGE_LOADING_MS - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      if (cancelled) return;

      setJudge(result);
      // 2차 판독 실패는 다시 찍을 수 없어 바로 최종 실패
      if (round === 2 && !result.passed) setRequest(failSellerSession(id, SESSION_FAIL_REASONS.secondJudge));
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [shot, judge, id, round, searchParams]);

  // 없는 링크면 홈으로
  if (!request) return <Navigate to="/" replace />;

  const handleStart = () => setRequest(startSellerSession(id));

  // 촬영 파일 → EXIF 회전 반영 + 긴 쪽 1000px (판독·전송·가리기 모두 이 이미지로)
  const handleShot = async (file) => {
    const prepared = await prepareShotImage(file);
    setJudge(null);
    setShot(prepared);
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

  // 2차 가리기 후 요청자에게 전송 → 인증 성공 화면(버튼 없음)
  const handleSecondMasked = (photo) => {
    setRequest(completeSellerSession(id, photo));
    setShot(null);
    setJudge(null);
    setMasking(false);
  };

  const goHome = () => navigate("/");

  const renderStage = () => {
    // 끝난 세션은 결과를 다시 보여줌 (재사용 불가)
    if (request.result === "success") return <SellerResult success />;
    if (request.result === "failed") {
      return <SellerResult reasons={getSellerFailReasons(request)} buttonLabel="끝내기" onButton={goHome} />;
    }
    if (isExpired(request)) return <SellerResult reasons={EXPIRED_REASONS} buttonLabel="끝내기" onButton={goHome} />;
    if (timedOut) {
      const reasons = SESSION_FAIL_REASONS[round === 1 ? "firstTimeout" : "secondTimeout"].seller;
      return <SellerResult reasons={reasons} buttonLabel="끝내기" onButton={goHome} />;
    }

    if (!request.firstStartedAt) return <SellerIntro onStart={handleStart} />;

    if (round === 1) {
      if (masking) return <MaskEditor photo={shot.dataUrl} buttonLabel="저장 및 2차 인증 시작하기" onDone={handleFirstMasked} />;
      if (shot) {
        return (
          <SellerJudging judge={judge} remainSeconds={firstRemain} onRetry={handleRetry} onNext={() => setMasking(true)} />
        );
      }
    }

    if (round === 2 && shot) {
      if (masking) return <MaskEditor photo={shot.dataUrl} buttonLabel="요청자에게 전송하기" onDone={handleSecondMasked} />;
      // 2차는 결과 모달 없이 로딩 후 결과 화면으로 (실패는 위에서 최종 실패로 처리)
      if (!judge) return <SellerJudging judge={null} />;
      return <SellerResult success buttonLabel="개인정보 가리기" onButton={() => setMasking(true)} />;
    }

    return (
      <SellerShot
        round={round}
        code={request.code}
        mission={getSecondMissionText(request)}
        remainSeconds={remainSeconds}
        onShot={handleShot}
      />
    );
  };

  // 판독 로딩 화면엔 헤더가 없음
  const isJudging = Boolean(shot) && !judge && request.result === null && !timedOut;
  const isFirstModal = round === 1 && Boolean(shot) && !masking && !timedOut;

  return (
    <StyledSellerPage>
      {!isJudging && !isFirstModal && <SellerHeader />}
      {renderStage()}
    </StyledSellerPage>
  );
}
