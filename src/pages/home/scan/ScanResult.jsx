import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import ScanBox from "../../../components/common/ScanBox.jsx";
import Button from "../../../components/common/Button.jsx";
import {
  countAccounts,
  deleteAnalysis,
  findIdentifier,
  getReportTitle,
  sendAnalysisFeedback,
  toStageStatus,
} from "../../../api/analyze.js";
import { getCurrentUser, loadCurrentUser } from "../../../api/auth.js";
import ScanConfirmModal from "../../../components/scan/ScanConfirmModal.jsx";
import AiPolicySheet from "./AiPolicySheet.jsx";
import TalkDetailSheet from "./TalkDetailSheet.jsx";
import OriginalPhotoSheet from "./OriginalPhotoSheet.jsx";
import ReportHistorySheet from "../../../components/scan/ReportHistorySheet.jsx";
import { BehaviorChip } from "./ScanTalkParts.jsx";
import TalkCard from "../../../components/scan/TalkCard.jsx";
import safeCheckIcon from "../../../assets/icons/result_safe_check.svg";
import sparkleIcon from "../../../assets/icons/result_sparkle.svg";
import infoIcon from "../../../assets/icons/result_info.svg";
import thumbsUpIcon from "../../../assets/icons/result_thumbs_up.svg";
import thumbsUpSelectedIcon from "../../../assets/icons/result_thumbs_up_selected.svg";
import thumbsDownIcon from "../../../assets/icons/result_thumbs_down.svg";

// 판독 결과 상태별 큰 배지·문구·하단 신고 영역 (status: safe 안전 / caution 의심 / danger 위험)
const STATUS_CONFIG = {
  safe: {
    label: "안전",
    color: "#1d6b43",
    glow: "rgba(29, 107, 67, 0.2)",
    circleBg: null,
    headline: "지금까지는 사기로 의심되지 않아요",
    showReport: false,
    showReportHint: false,
  },
  caution: {
    label: "의심",
    color: "#bf7100",
    glow: "rgba(201, 138, 30, 0.2)",
    circleBg: "#e0a21c",
    headline: "사기 의심 문구가 있어요",
    showReport: true,
    showReportHint: true,
  },
  danger: {
    label: "위험",
    color: "#a81e14",
    glow: "rgba(180, 35, 24, 0.2)",
    circleBg: "#ca2317",
    headline: "사기 가능성이 높아요",
    showReport: true,
    showReportHint: false,
  },
};

// 판독 기준 A~F → 행동 칩 이름 (서버 안내대로 A~F 순서로 표시)
const CRITERIA = [
  { key: "A", label: "로그인 정보 요구" },
  { key: "B", label: "수상한 송금 요구" },
  { key: "C", label: "확인 회피" },
  { key: "D", label: "판단 재촉" },
  { key: "E", label: "불리한 조건" },
  { key: "F", label: "정보 불일치" },
];

// 근거 문장의 기준 이름 (X는 칩 6개에 없는 기준 밖 수상한 요구)
const CRITERION_LABELS = {
  ...Object.fromEntries(CRITERIA.map(({ key, label }) => [key, label])),
  X: "기타 수상한 요구",
};

// 근거 세기 → 말풍선, 칩 색 (강함 빨강, 주의 노랑)
const STRENGTH_LEVEL = {
  STRONG: "danger",
  CAUTION: "caution",
};

const TRADE_TYPE_LABELS = {
  TRANSFER: "양도",
  AOM: "아옮",
  PROXY: "대리티켓팅",
  CANCEL: "취켓 대행",
  OTHER: "기타",
};

// 판독 응답 → 화면에서 쓰는 형태
// photoUrls: 올린 순서대로 만든 로컬 미리보기 주소 (imageNumber - 1 번째와 연결)
const toScanResult = (response, photoUrls) => {
  const { assessment, conversations, identifiers } = response;

  // 같은 사진, 같은 기준의 근거는 하나만 (강한 근거가 먼저 오도록 정렬 후 중복 제거)
  const seen = new Set();
  const talks = conversations.images
    .flatMap(({ imageNumber, countedSignals }) =>
      countedSignals.map((signal) => ({
        photo: imageNumber,
        imageUrl: photoUrls[imageNumber - 1],
        text: signal.quote,
        level: STRENGTH_LEVEL[signal.strength] ?? "caution",
        behavior: CRITERION_LABELS[signal.criterion] ?? CRITERION_LABELS.X,
        reason: signal.reason,
      })),
    )
    .sort((a, b) => a.photo - b.photo || (a.level === "danger" ? -1 : 0) - (b.level === "danger" ? -1 : 0))
    .filter(({ photo, behavior }) => {
      const key = `${photo}-${behavior}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return {
    status: toStageStatus(assessment.finalStage),
    reportStatus: toStageStatus(assessment.reportStage),
    reportTitle: getReportTitle(assessment),
    tradeType: TRADE_TYPE_LABELS[response.detectedType] ?? TRADE_TYPE_LABELS.OTHER,
    account: findIdentifier(identifiers, "ACCOUNT"),
    phone: findIdentifier(identifiers, "PHONE"),
    sns: findIdentifier(identifiers, "SNS"),
    accountCount: countAccounts(identifiers),
    // 신고 이력 시트: 대화에서 찾은 계좌, 전화번호, SNS (판독 응답에 식별자별 인원이 없어 건수는 비워 둠)
    reportHistory: identifiers.length > 0
      ? identifiers.map(({ value }) => ({ target: value }))
      : [{ target: "계좌 정보 없음" }, { target: "전화번호 정보 없음" }],
    behaviors: CRITERIA.map(({ key, label }) => ({
      label,
      level: toStageStatus(assessment.chat.criteria?.[key]),
    })),
    photoCount: conversations.imageCount,
    flaggedPhotoCount: conversations.suspiciousImageCount,
    conversations: talks,
    showReportButton: assessment.showReportButton,
    showSuspicionReport: assessment.showSuspicionReport,
  };
};

// 화면 전체 세로 배치 (요소 사이 16px, 가운데 정렬), 글자 행간은 Figma와 같은 normal
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

// 맨 위 '거래 종류 - 양도' 알약 모양 칩
const StyledTradeType = styled.p`
  margin: 0;
  padding: 8px 12px;
  background: #fdfdfd;
  border: 1px solid #e5e1f9;
  border-radius: 20px;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
`;

// 결과 배지 + 결과 제목 문구 묶음
const StyledHero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
`;

// 아이콘 + 상태 이름 묶음, 상태 색으로 은은하게 빛나는 그림자($glow)를 줌
const StyledBadge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  filter: drop-shadow(0 0 5px ${({ $glow }) => $glow});
`;

// 안전일 때 쓰는 체크 원 아이콘
const StyledBadgeIcon = styled.img`
  display: block;
`;

// 의심, 위험일 때 쓰는 색 원 + 느낌표 (느낌표를 원 가운데에 맞추려고 위에 5px 여백)
const StyledBadgeCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  padding-top: 5px;
  box-sizing: border-box;
  background: ${({ $bg }) => $bg};
  border-radius: 99px;
  color: #fdfdfd;
  font-family: "esamanru", sans-serif;
  font-size: 40px;
  font-weight: 700;
`;

// 상태 이름 (안전 / 의심 / 위험), 상태 색($color)으로 표시
const StyledBadgeLabel = styled.p`
  margin: 0;
  color: ${({ $color }) => $color};
  font-family: "esamanru", sans-serif;
  font-size: 40px;
  font-weight: 700;
`;

// 결과 제목 + 안내 문구 묶음
const StyledHeadlineGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  text-align: center;
`;

// 상태별 결과 제목 (예: 사기 가능성이 높아요)
const StyledHeadline = styled.p`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
`;

// '트루켓은 방향을 알려드릴 뿐이에요' 안내 문구
const StyledHeadlineSub = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

// 흰 배경 + 연보라 테두리 카드 (AI가 확인한 것, 주요 대화)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  text-align: left;
`;

// 카드 윗줄: 왼쪽 제목, 오른쪽 아이콘 버튼
const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 반짝이 아이콘 + 'AI가 확인한 것' 보라색 제목 (아이콘과 글자 아래쪽 맞춤)
const StyledAiTitle = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  color: #5434d6;
  font-size: 16px;
  font-weight: 700;

  img {
    display: block;
  }
`;

// 판독 정책 안내 (i 아이콘, 14px 영역에 15px 원본 SVG를 0.5px 바깥으로 겹쳐 배치)
const StyledInfoButton = styled.button`
  position: relative;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  img {
    position: absolute;
    top: -0.5px;
    left: -0.5px;
    display: block;
  }
`;

// 카드 안 요약 문구 ($size로 글자 크기 지정, 기본 12px)
const StyledCardText = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: ${({ $size = 12 }) => `${$size}px`};
  font-weight: 500;
`;

// 브라우저 글자 폭이 Figma보다 1px 정도 넓어 칩이 한 줄 더 넘어가는 걸 막으려고 오른쪽 여유 2px를 둠
const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-right: -2px;
`;

// 안전일 때만 보이는 회색 안내 박스
const StyledSafeNotice = styled.p`
  margin: 0;
  padding: 12px 16px;
  background: #a9a4b2;
  border-radius: 20px;
  color: #fdfdfd;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

// 안전 결과에서 쓰는 원본 사진 보기 버튼 (카드 왼쪽에 붙임)
const StyledOriginalButton = styled(Button)`
  align-self: flex-start;
`;

// 보라색 '판매자에게 트루샷 요청하기' 버튼 (제목 + 설명 두 줄)
const StyledTrueshotButton = styled.button`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: #5434d6;
  color: #fdfdfd;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  cursor: pointer;
`;

// 트루샷 버튼 제목
const StyledTrueshotTitle = styled.span`
  font-size: 20px;
  font-weight: 700;
`;

// 트루샷 버튼 아래 설명 (실시간 사진 인증 기능)
const StyledTrueshotSub = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

// 의심일 때만 신고 버튼 위에 뜨는 '이미 금전적 피해를 봤다면?' 문구
const StyledReportHint = styled.p`
  margin: 0;
  color: #191919;
  font-size: 10px;
  font-weight: 500;
`;

// AI 결과는 참고용이라는 하단 안내 문구
const StyledDisclaimer = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 400;
  text-align: center;
`;

// 피드백 버튼 줄 + 감사 문구 묶음
const StyledFeedback = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

// 도움이 되었어요 / 결과가 이상해요 두 버튼을 257px 폭 양끝에 배치
const StyledFeedbackRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 257px;
`;

// 피드백 버튼, 선택되면($selected) 검정 배경 + 흰 글자로 바뀜
const StyledFeedbackButton = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#191919" : "#fdfdfd")};
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  color: ${({ $selected }) => ($selected ? "#fdfdfd" : "#191919")};
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
  cursor: pointer;

  img {
    display: block;
  }
`;

// '결과가 이상해요'는 선택용 흰 아이콘 파일이 없어서, 선택됐을 때 filter로 아이콘을 흰색으로 바꿈
const StyledWhiteIcon = styled.img`
  filter: brightness(0) invert(1);
`;

// 피드백 버튼을 누르면 아래에 뜨는 감사 문구
const StyledThanks = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;
// AI 판독 결과 화면: 안전·의심·위험 결과를 하나의 레이아웃에서 status에 맞춰 보여줌
// 로딩 화면에서 판독 응답(state.result)과 올린 캡처 파일(state.captures)을 받아서 보여줌
export default function ScanResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const response = state?.result;
  const analyzeId = response?.analyzeId;

  const [feedback, setFeedback] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackSending, setIsFeedbackSending] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isTalkDetailOpen, setIsTalkDetailOpen] = useState(false);
  const [isOriginalOpen, setIsOriginalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 원본 사진 보기용 로컬 미리보기 주소 (올린 순서 그대로)
  const photoUrls = useMemo(() => (state?.captures ?? []).map((file) => URL.createObjectURL(file)), [state]);
  const result = useMemo(() => (response ? toScanResult(response, photoUrls) : null), [response, photoUrls]);

  // 화면을 떠날 때 미리보기 주소 해제 + 서버의 판독 결과 삭제 (신고하러 가는 경우는 신고에 필요해서 남겨 둠)
  // 개발 모드(StrictMode)는 마운트 직후 정리를 한 번 더 실행하므로, 실제로 떠날 때만 실행되도록 한 박자 미룸
  const keepAnalysisRef = useRef(false);
  const leaveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(leaveTimerRef.current);
    return () => {
      leaveTimerRef.current = setTimeout(() => {
        photoUrls.forEach((url) => URL.revokeObjectURL(url));
        if (analyzeId && !keepAnalysisRef.current) deleteAnalysis(analyzeId).catch(() => {});
      }, 0);
    };
  }, [photoUrls, analyzeId]);

  // 새로고침, 주소 직접 입력처럼 판독 응답 없이 들어오면 판독 화면으로 보냄
  if (!result) return <Navigate to="/scan" replace />;

  const config = STATUS_CONFIG[result.status];
  const flaggedBehaviorCount = result.behaviors.filter(({ level }) => level !== "safe").length;
  const hasFlags = result.conversations.length > 0;

  const behaviorSummary =
    flaggedBehaviorCount === 0
      ? `티켓 거래 사기에서 자주 나오는 행동 ${result.behaviors.length}가지를 대화에서 찾지 못했어요.`
      : `티켓 거래 사기에서 자주 나오는 행동 ${result.behaviors.length}가지 중 ${flaggedBehaviorCount}가지를 찾았어요.`;

  const talkSummary = hasFlags
    ? `사진 ${result.photoCount}장 중 ${result.flaggedPhotoCount}장에서 사기 의심 정황을 찾았어요.`
    : `사진 ${result.photoCount}장에서 사기 의심 정황을 찾지 못했어요.`;

  // 판독 결과에서 확인된 거래 정보를 그대로 넘겨 판독 기반 신고 화면으로 이동
  // (신고 등록에 판독 결과가 필요해서 이 경우는 서버의 판독 결과를 지우지 않음)
  // 비로그인이면 로그인 화면으로 보내고, 로그인·회원가입을 마치면 같은 신고 정보로 신고 화면에 이어서 들어감
  // (같은 브라우저에서 판독 후 로그인해도 서버의 판독 결과는 그대로 유지됨)
  const goToReport = async () => {
    const reportState = {
      analyzeId,
      showSuspicionReport: result.showSuspicionReport,
      accountCount: result.accountCount,
      tradeType: result.tradeType,
      account: result.account,
      phone: result.phone,
      sns: result.sns,
    };
    keepAnalysisRef.current = true;
    // 로그인 확인이 아직 안 끝났으면 끝날 때까지 기다림
    await loadCurrentUser();
    if (!getCurrentUser()) {
      navigate("/auth", { state: { from: "/scan/report", fromState: reportState } });
      return;
    }
    navigate("/scan/report", { state: reportState });
  };

  // 헤더의 뒤로 가기 버튼 클릭을 먼저 가로채서, 바로 이동하지 않고 확인창을 띄움
  const handleBackClick = (e) => {
    if (!e.target.closest("button")) return;
    e.stopPropagation();
    setIsBackModalOpen(true);
  };

  // 피드백은 판독당 한 번만 보낼 수 있어서, 보내고 나면 두 버튼 모두 막음
  const sendFeedback = async (value) => {
    if (feedback || isFeedbackSending) return;
    setIsFeedbackSending(true);
    try {
      const { message } = await sendAnalysisFeedback(analyzeId, value === "up" ? "HELPFUL" : "INCORRECT");
      setFeedback(value);
      setFeedbackMessage(message ?? "소중한 의견 감사합니다");
    } catch (error) {
      // 409: 이미 이 판독에 피드백을 보냄
      if (error.status === 409) setFeedback(value);
      setFeedbackMessage(error.status === 409 ? "이미 의견을 보내주셨어요" : error.message);
    } finally {
      setIsFeedbackSending(false);
    }
  };
  const isFeedbackLocked = Boolean(feedback) || isFeedbackSending;

  return (
    <>
      <div onClickCapture={handleBackClick}>
        <BackHeader label="뒤로 가기" />
      </div>
      <StyledContent>
        <StyledTradeType>거래 종류 - {result.tradeType}</StyledTradeType>

        <StyledHero>
          <StyledBadge $glow={config.glow}>
            {config.circleBg ? (
              <StyledBadgeCircle $bg={config.circleBg}>!</StyledBadgeCircle>
            ) : (
              <StyledBadgeIcon src={safeCheckIcon} alt="" />
            )}
            <StyledBadgeLabel $color={config.color}>{config.label}</StyledBadgeLabel>
          </StyledBadge>
          <StyledHeadlineGroup>
            <StyledHeadline>{config.headline}</StyledHeadline>
            <StyledHeadlineSub>
              트루켓은 방향을 알려드릴 뿐이에요.
              <br />
              최종 결정은 당신의 몫이랍니다.
            </StyledHeadlineSub>
          </StyledHeadlineGroup>
        </StyledHero>

        {/* TODO: 판독 응답에 식별자별 신고 인원이 생기면 제목 이력 횟수와 시트 건수 채우기 */}
        {/* Figma처럼 제목 아래 계좌, 전화번호 두 줄을 항상 보여주고, 대화에서 못 찾은 값은 안내 문구로 채움 */}
        {/* 누르면 계좌, 전화번호별 신고 이력 시트를 띄움 */}
        <ScanBox
          status={result.reportStatus}
          title={result.reportTitle}
          account={result.account || "계좌 정보 없음"}
          phone={result.phone || "전화번호 정보 없음"}
          onClick={() => setIsHistoryOpen(true)}
        />

        <StyledCard>
          <StyledCardHeader>
            <StyledAiTitle>
              <img src={sparkleIcon} alt="" />
              AI가 확인한 것
            </StyledAiTitle>
            <StyledInfoButton type="button" aria-label="AI 판독 정책 보기" onClick={() => setIsPolicyOpen(true)}>
              <img src={infoIcon} alt="" />
            </StyledInfoButton>
          </StyledCardHeader>
          <StyledCardText>{behaviorSummary}</StyledCardText>
          <StyledChips>
            {result.behaviors.map(({ label, level }) => (
              <BehaviorChip key={label} level={level}>
                {label}
              </BehaviorChip>
            ))}
          </StyledChips>
          {result.status === "safe" && (
            <StyledSafeNotice>
              처음 보는 수법은 트루켓이 놓칠 수 있어요.
              <br />
              돈을 보내기 전, 티켓 확인은 트루샷으로 확인해보세요
            </StyledSafeNotice>
          )}
        </StyledCard>

        <TalkCard
          conversations={result.conversations}
          summary={talkSummary}
          summarySize={hasFlags ? 10 : 12}
          onMore={hasFlags ? () => setIsTalkDetailOpen(true) : undefined}
        >
          <StyledOriginalButton variant="disabled" type="button" onClick={() => setIsOriginalOpen(true)}>
            원본 사진 보기 ({photoUrls.length}장)
          </StyledOriginalButton>
        </TalkCard>

        {/* 안전, 의심, 위험 모든 단계와 거래 종류에서 항상 보여줌 (누르면 트루샷 화면으로) */}
        <StyledTrueshotButton type="button" onClick={() => navigate("/trueshot")}>
          <StyledTrueshotTitle>판매자에게 트루샷 요청하기</StyledTrueshotTitle>
          <StyledTrueshotSub>실시간 사진 인증 기능</StyledTrueshotSub>
        </StyledTrueshotButton>

        {result.showReportButton && config.showReportHint && <StyledReportHint>이미 금전적 피해를 봤다면?</StyledReportHint>}
        {result.showReportButton && (
          <Button variant="disabled" type="button" onClick={goToReport}>
            트루켓에 신고하기
          </Button>
        )}

        <StyledDisclaimer>
          이 식별 결과는 AI 모델과 트루켓의 자체 데이터베이스를 기반으로 자동 생성된 정보이며,
          <br />
          별도로 검토하거나 검증하지 않았습니다. 따라서 참고용으로만 활용해주시기 바랍니다.
        </StyledDisclaimer>

        <StyledFeedback>
          <StyledFeedbackRow>
            <StyledFeedbackButton
              type="button"
              $selected={feedback === "up"}
              aria-pressed={feedback === "up"}
              disabled={isFeedbackLocked}
              onClick={() => sendFeedback("up")}
            >
              <img src={feedback === "up" ? thumbsUpSelectedIcon : thumbsUpIcon} alt="" />
              도움이 되었어요
            </StyledFeedbackButton>
            <StyledFeedbackButton
              type="button"
              $selected={feedback === "down"}
              aria-pressed={feedback === "down"}
              disabled={isFeedbackLocked}
              onClick={() => sendFeedback("down")}
            >
              {feedback === "down" ? (
                <StyledWhiteIcon src={thumbsDownIcon} alt="" />
              ) : (
                <img src={thumbsDownIcon} alt="" />
              )}
              결과가 이상해요
            </StyledFeedbackButton>
          </StyledFeedbackRow>
          {feedbackMessage && <StyledThanks>{feedbackMessage}</StyledThanks>}
        </StyledFeedback>
      </StyledContent>

      {isBackModalOpen && (
        <ScanConfirmModal
          message={
            <>
              뒤로 가기 시, 다시 시작해야합니다.
              <br />
              뒤로 가시겠습니까?
            </>
          }
          confirmLabel="뒤로가기"
          onClose={() => setIsBackModalOpen(false)}
          onConfirm={() => navigate(-1)}
        />
      )}
      {isPolicyOpen && <AiPolicySheet onClose={() => setIsPolicyOpen(false)} />}
      {isTalkDetailOpen && (
        <TalkDetailSheet conversations={result.conversations} onClose={() => setIsTalkDetailOpen(false)} />
      )}
      {isOriginalOpen && <OriginalPhotoSheet photoUrls={photoUrls} onClose={() => setIsOriginalOpen(false)} />}
      {isHistoryOpen && <ReportHistorySheet history={result.reportHistory} onClose={() => setIsHistoryOpen(false)} />}
    </>
  );
}
