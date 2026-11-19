import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SellerHeader from "../../../components/trueShot/SellerHeader.jsx";
import SellerIntro from "./SellerIntro.jsx";
import SellerShot from "./SellerShot.jsx";
import SellerJudging from "./SellerJudging.jsx";
import MaskEditor from "./MaskEditor.jsx";
import SellerResult from "./SellerResult.jsx";
import { StyledSellerPage } from "./sellerStyles.js";
import useCountdown from "../../../hooks/useCountdown.js";
import { extractHandsWithin, preloadHandRecognizer, prepareShotImage } from "../../../api/handAnalyze.js";
import {
  confirmFirstMask,
  enterSellerSession,
  getSellerSession,
  requestAutoMask,
  shareSellerPhotos,
  startSellerSession,
  submitFirstShot,
  submitSecondShot,
} from "../../../api/trueShot.js";
import { JUDGE_LOADING_MS, SELLER_TIMEOUT_REASONS } from "../../../mock/trueShot.js";

// 촬영 마감이 있는 단계 (남은 시간이 0이 되면 서버 결과를 다시 확인)
const TIMED_PHASES = ["FIRST_CHECKING", "SECOND_WAITING"];

// 2차 손 인식(MediaPipe)을 미리 받아 둘 단계 (시작 전 안내 화면도 포함)
const PRELOAD_PHASES = ["WAITING", "FIRST_CHECKING", "FIRST_MASKING", "SECOND_WAITING"];

// 2차 사진을 마감 전에 서버로 보내기 위해 남겨 둘 업로드 시간(ms)
const UPLOAD_MARGIN_MS = 8000;

// 판매자 트루샷 (구매자가 보낸 링크 /trueshot/seller/:token 으로 들어옴, 로그인 없음)
// 진행 상태는 서버가 판매자 브라우저 세션으로 관리 → 들어오거나 새로고침하면 GET /s/{token}/result로 복구
// 화면은 서버 phase로 결정: FIRST_CHECKING 1차 촬영 / FIRST_MASKING 1차 가리기 / SECOND_WAITING 2차 촬영
// JUDGING 판정 대기(약 2초마다 조회) / SHARE_WAITING 성공 + 2차 가리기 / COMPLETED 성공 / FAILED 실패
// 확인용(목업 모드만): 주소에 ?mock=fail1 / ?mock=fail2 를 붙이면 1차·2차 판독이 실패함
export default function SellerSession() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forceFail = (round) => searchParams.get("mock") === `fail${round}`;

  // 서버 판매자 결과 (api/trueShot.js toSellerSession), 시작 전이면 null
  const [session, setSession] = useState(null);
  // 시작 전 안내 { title, expiresAt }
  const [link, setLink] = useState(null);
  // 진행할 수 없는 링크: { notFound } 또는 { reasons } (기한 지남·다른 브라우저에서 시작)
  const [blocked, setBlocked] = useState(null);
  // 1차: 찍은 사진과 판독 결과 { passed, reasons } (판독 중이면 judge가 null)
  const [shot, setShot] = useState(null);
  const [judge, setJudge] = useState(null);
  // 가리기 화면에 띄울 사진 주소 (1차는 자동 가림 요청 후, 2차는 '개인정보 가리기'를 누르면)
  const [maskPhoto, setMaskPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const maskRequestedRef = useRef(false);

  const phase = session?.phase;
  const remainSeconds = useCountdown(session?.deadline ?? null);

  // 진행할 수 없는 링크 처리 (없는 링크 404 / 기한 지남 410 / 다른 브라우저에서 이미 시작 409 등)
  const handleBlocked = useCallback((error) => {
    if (error.status === 404) setBlocked({ notFound: true });
    else if (error.status === 410) setBlocked({ reasons: SELLER_TIMEOUT_REASONS.REQUEST_TIMEOUT });
    else setBlocked({ reasons: [{ passed: false, text: error.message }] });
  }, []);

  // 서버 결과 다시 확인 (마감 지남·판정 대기·단계 오류 시)
  const refresh = useCallback(async () => {
    try {
      setSession(await getSellerSession(token));
    } catch (error) {
      handleBlocked(error);
    }
  }, [token, handleBlocked]);

  // 들어올 때: 시작한 세션이면 단계 복구, 아니면 시작 전 안내
  useEffect(() => {
    let cancelled = false;
    enterSellerSession(token)
      .then((entry) => {
        if (cancelled) return;
        if (entry.started) setSession(entry.session);
        else setLink(entry.link);
      })
      .catch((error) => {
        if (!cancelled) handleBlocked(error);
      });
    return () => {
      cancelled = true;
    };
  }, [token, handleBlocked]);

  // 2차 손 인식 모델은 크기가 커서(약 23MB) 2차 화면에서 받기 시작하면 1분 안에 못 끝날 수 있음
  // → 판매자가 링크에 들어와 안내를 보거나 1차를 진행하는 동안 미리 받아 둠
  const shouldPreload = Boolean(link) || PRELOAD_PHASES.includes(phase);
  useEffect(() => {
    if (shouldPreload) preloadHandRecognizer();
  }, [shouldPreload]);

  // 판정 대기 중: 서버가 알려준 간격(기본 2초)마다 결과 조회, 다른 단계가 되면 멈춤
  useEffect(() => {
    if (phase !== "JUDGING") return undefined;
    const timer = setTimeout(refresh, session.pollAfter ?? 2000);
    return () => clearTimeout(timer);
  }, [phase, session, refresh]);

  // 촬영 마감이 지나면 서버에 다시 확인 (시간 초과 판정은 서버가 함, 판독 중인 1차 사진은 응답을 기다림)
  useEffect(() => {
    if (remainSeconds !== 0 || !TIMED_PHASES.includes(phase) || shot) return undefined;
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [remainSeconds, phase, shot, refresh]);

  // 1차 가리기 단계인데 가림 사진이 없으면(통과 직후·새로고침) 자동 가림 요청
  // 자동 가림 실패(FAILED)면 추가 가림 없이 다음 단계로 (사진은 구매자에게 공개되지 않음)
  const prepareFirstMask = useCallback(async () => {
    if (maskRequestedRef.current) return;
    maskRequestedRef.current = true;
    try {
      const ready = session?.previews?.[1];
      if (ready) {
        setMaskPhoto(ready);
        return;
      }
      const mask = await requestAutoMask(token);
      if (mask.maskStatus === "READY" && mask.previewUrl) setMaskPhoto(mask.previewUrl);
      else setSession(await confirmFirstMask(token, []));
    } catch (error) {
      maskRequestedRef.current = false;
      if (error.status === 409 || error.status === 410) refresh();
      else handleBlocked(error);
    }
  }, [session, token, refresh, handleBlocked]);

  // 새로고침으로 1차 가리기 단계에 다시 들어온 경우 (판독 결과 모달 없이 바로 가리기)
  useEffect(() => {
    if (phase !== "FIRST_MASKING" || judge || maskPhoto) return undefined;
    const timer = setTimeout(prepareFirstMask, 0);
    return () => clearTimeout(timer);
  }, [phase, judge, maskPhoto, prepareFirstMask]);

  if (blocked?.notFound) return <Navigate to="/" replace />;

  const goHome = () => navigate("/");

  const handleStart = async () => {
    try {
      setSession(await startSellerSession(token));
    } catch (error) {
      handleBlocked(error);
    }
  };

  // 1차 사진: 회전 반영·축소 후 제출 (판독 로딩은 응답과 최소 시간 중 늦은 쪽까지)
  const handleFirstShot = async (file) => {
    const prepared = await prepareShotImage(file);
    setJudge(null);
    setShot(prepared);
    const startedAt = Date.now();
    try {
      const result = await submitFirstShot(token, { image: prepared.blob, code: session.code, forceFail: forceFail(1) });
      const wait = JUDGE_LOADING_MS - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      setJudge(result);
      setSession(await getSellerSession(token));
    } catch {
      // 시간 초과(410)·단계 오류(409) 등은 서버 상태로 다시 그림
      setShot(null);
      refresh();
    }
  };

  // 1차 실패 모달에서 다시 찍기 (타이머는 서버 마감 그대로)
  const handleRetry = () => {
    setShot(null);
    setJudge(null);
    refresh();
  };

  // 1차 성공 모달의 '개인정보 가리기'
  const handleFirstPassed = () => {
    setShot(null);
    setJudge(null);
    prepareFirstMask();
  };

  // 1차 추가 가림 저장 → 2차 미션 공개
  const handleFirstMasked = async (boxes) => {
    setBusy(true);
    try {
      setSession(await confirmFirstMask(token, boxes));
      setMaskPhoto(null);
    } catch {
      refresh();
    } finally {
      setBusy(false);
    }
  };

  // 2차 사진: MediaPipe 손 분석과 함께 제출 → 판정 대기
  // 손 인식은 마감 8초 전까지만 기다리고(못 끝나면 손 정보 없이), 사진이 1분 안에 서버에 도착하게 함
  const handleSecondShot = async (file) => {
    const prepared = await prepareShotImage(file);
    setShot(prepared);
    try {
      const waitMs = session.deadline ? session.deadline - Date.now() - UPLOAD_MARGIN_MS : 0;
      const analysis = await extractHandsWithin(prepared.canvas, waitMs);
      if (import.meta.env.DEV) console.info("[hand-analyze]", analysis);
      setSession(await submitSecondShot(token, { image: prepared.blob, analysis, forceFail: forceFail(2) }));
    } catch {
      refresh();
    } finally {
      setShot(null);
    }
  };

  // 2차 추가 가림 + 사진 공유 (시작할 때 받은 전달 동의로 자동 공유)
  const handleShare = async (boxes) => {
    setBusy(true);
    try {
      setSession(await shareSellerPhotos(token, boxes));
      setMaskPhoto(null);
    } catch {
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const renderStage = () => {
    if (blocked) return <SellerResult reasons={blocked.reasons} buttonLabel="끝내기" onButton={goHome} />;
    if (!session) return link ? <SellerIntro onStart={handleStart} /> : null;

    if (phase === "FAILED") return <SellerResult reasons={session.failReasonList} buttonLabel="끝내기" onButton={goHome} />;
    if (phase === "COMPLETED") return <SellerResult success />;

    if (phase === "SHARE_WAITING") {
      if (maskPhoto) return <MaskEditor photo={maskPhoto} buttonLabel="요청자에게 전송하기" busy={busy} onDone={handleShare} />;
      return <SellerResult success buttonLabel="개인정보 가리기" onButton={() => setMaskPhoto(session.previews[2])} />;
    }

    // 2차 사진 제출 중·판정 대기
    if (phase === "JUDGING" || (phase === "SECOND_WAITING" && shot)) return <SellerJudging judge={null} />;

    // 1차 사진 판독 중·결과 모달 (통과 직후엔 서버 단계가 이미 FIRST_MASKING)
    if (shot || judge) {
      return (
        <SellerJudging judge={judge} remainSeconds={remainSeconds} onRetry={handleRetry} onNext={handleFirstPassed} />
      );
    }

    if (phase === "FIRST_MASKING") {
      if (maskPhoto) return <MaskEditor photo={maskPhoto} buttonLabel="저장 및 2차 인증 시작하기" busy={busy} onDone={handleFirstMasked} />;
      return <SellerJudging judge={null} />;
    }

    const round = phase === "SECOND_WAITING" ? 2 : 1;
    return (
      <SellerShot
        round={round}
        code={session.code}
        mission={session.instruction2 ?? ""}
        remainSeconds={remainSeconds ?? 0}
        onShot={round === 1 ? handleFirstShot : handleSecondShot}
      />
    );
  };

  // 판독·판정 대기 로딩과 1차 결과 모달에는 헤더가 없음
  const isLoading =
    !blocked &&
    session &&
    (phase === "JUDGING" || (phase === "SECOND_WAITING" && shot) || (phase === "FIRST_MASKING" && !maskPhoto && !judge));
  const isFirstModal = Boolean(shot || judge) && phase !== "SECOND_WAITING";
  const showHeader = (session || link || blocked) && !isLoading && !isFirstModal;

  return (
    <StyledSellerPage>
      {showHeader && <SellerHeader />}
      {renderStage()}
    </StyledSellerPage>
  );
}
