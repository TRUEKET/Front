import { Fragment, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import ScanBox from "../../../components/common/ScanBox.jsx";
import Button from "../../../components/common/Button.jsx";
import { MOCK_SCAN_RESULTS } from "../../../mock/scanResult.js";
import ScanBackModal from "./ScanBackModal.jsx";
import ReportHistorySheet from "./ReportHistorySheet.jsx";
import AiPolicySheet from "./AiPolicySheet.jsx";
import TalkDetailSheet from "./TalkDetailSheet.jsx";
import { BehaviorChip, PhotoTag, TalkBubble, TalkDashedLine, TalkLine } from "./ScanTalkParts.jsx";
import safeCheckIcon from "../../../assets/icons/result_safe_check.svg";
import sparkleIcon from "../../../assets/icons/result_sparkle.svg";
import infoIcon from "../../../assets/icons/result_info.svg";
import chevronIcon from "../../../assets/icons/box_chevron_right.svg";
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

// 연동 전에는 ?status=safe|caution|danger 로 볼 결과를 고름 (없으면 안전)
const DEFAULT_STATUS = "safe";

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

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

const StyledHero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
`;

const StyledBadge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  filter: drop-shadow(0 0 5px ${({ $glow }) => $glow});
`;

const StyledBadgeIcon = styled.img`
  display: block;
`;

// 의심·위험은 색 원 안에 느낌표
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

const StyledBadgeLabel = styled.p`
  margin: 0;
  color: ${({ $color }) => $color};
  font-family: "esamanru", sans-serif;
  font-size: 40px;
  font-weight: 700;
`;

const StyledHeadlineGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  text-align: center;
`;

const StyledHeadline = styled.p`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
`;

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

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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

const StyledTalkHeader = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const StyledTalkTitleGroup = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledTalkTitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

const StyledMoreButton = styled.button`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  img {
    display: block;
    transform: scaleX(-1);
  }
`;

const StyledTalkItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledReason = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 400;
`;

// 안전 결과에서 쓰는 원본 사진 보기 버튼 (카드 왼쪽에 붙임)
const StyledOriginalButton = styled(Button)`
  align-self: flex-start;
`;

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

const StyledTrueshotTitle = styled.span`
  font-size: 20px;
  font-weight: 700;
`;

const StyledTrueshotSub = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const StyledReportHint = styled.p`
  margin: 0;
  color: #191919;
  font-size: 10px;
  font-weight: 500;
`;

const StyledDisclaimer = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 400;
  text-align: center;
`;

const StyledFeedback = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

const StyledFeedbackRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 257px;
`;

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

// 선택된 아이콘이 없는 '결과가 이상해요'는 아이콘을 흰색으로 바꿔 표시
const StyledWhiteIcon = styled.img`
  filter: brightness(0) invert(1);
`;

const StyledThanks = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// AI 판독 결과 화면: 안전·의심·위험 결과를 하나의 레이아웃에서 status에 맞춰 보여줌
export default function ScanResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState(null);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isTalkDetailOpen, setIsTalkDetailOpen] = useState(false);

  const statusParam = searchParams.get("status");
  const result = MOCK_SCAN_RESULTS[statusParam] ?? MOCK_SCAN_RESULTS[DEFAULT_STATUS];
  const config = STATUS_CONFIG[result.status];

  const flaggedBehaviorCount = result.behaviors.filter(({ level }) => level !== "safe").length;
  const flaggedPhotoCount = new Set(result.conversations.map(({ photo }) => photo)).size;
  const hasFlags = result.conversations.length > 0;

  const behaviorSummary =
    flaggedBehaviorCount === 0
      ? `티켓 거래 사기에서 자주 나오는 행동 ${result.behaviors.length}가지를 대화에서 찾지 못했어요.`
      : `티켓 거래 사기에서 자주 나오는 행동 ${result.behaviors.length}가지 중 ${flaggedBehaviorCount}가지를 찾았어요.`;

  const talkSummary = hasFlags
    ? `사진 ${result.photoCount}장 중 ${flaggedPhotoCount}장에서 사기 의심 정황을 찾았어요.`
    : `사진 ${result.photoCount}장에서 사기 의심 정황을 찾지 못했어요.`;

  // 헤더의 뒤로 가기 버튼 클릭을 먼저 가로채서, 바로 이동하지 않고 확인창을 띄움
  const handleBackClick = (e) => {
    if (!e.target.closest("button")) return;
    e.stopPropagation();
    setIsBackModalOpen(true);
  };

  const toggleFeedback = (value) => setFeedback((prev) => (prev === value ? null : value));

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

        <ScanBox
          status={result.status}
          title={`피해 신고·의심 제보 이력 ${result.reportCount}회`}
          account={result.account}
          phone={result.phone}
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

        <StyledCard>
          <StyledTalkHeader>
            <StyledTalkTitleGroup>
              <StyledTalkTitle>주요 대화</StyledTalkTitle>
              <StyledCardText $size={hasFlags ? 10 : 12}>{talkSummary}</StyledCardText>
            </StyledTalkTitleGroup>
            {hasFlags && (
              <StyledMoreButton type="button" onClick={() => setIsTalkDetailOpen(true)}>
                자세히 보기
                <img src={chevronIcon} alt="" />
              </StyledMoreButton>
            )}
          </StyledTalkHeader>

          {hasFlags ? (
            result.conversations.map((talk) => (
              <Fragment key={`${talk.photo}-${talk.behavior}`}>
                <TalkLine />
                <StyledTalkItem>
                  <PhotoTag photo={talk.photo} />
                  <TalkBubble level={talk.level}>{talk.text}</TalkBubble>
                </StyledTalkItem>
                <TalkDashedLine />
                <StyledTalkItem>
                  <BehaviorChip level={talk.level}>{talk.behavior}</BehaviorChip>
                  <StyledReason>{talk.reason}</StyledReason>
                </StyledTalkItem>
              </Fragment>
            ))
          ) : (
            <StyledOriginalButton variant="disabled" type="button">
              원본 사진 보기 ({result.photoCount}장)
            </StyledOriginalButton>
          )}
        </StyledCard>

        <StyledTrueshotButton type="button">
          <StyledTrueshotTitle>판매자에게 트루샷 요청하기</StyledTrueshotTitle>
          <StyledTrueshotSub>실시간 사진 인증 기능</StyledTrueshotSub>
        </StyledTrueshotButton>

        {config.showReportHint && <StyledReportHint>이미 금전적 피해를 봤다면?</StyledReportHint>}
        {config.showReport && (
          <Button variant="disabled" type="button" onClick={() => navigate("/response")}>
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
              onClick={() => toggleFeedback("up")}
            >
              <img src={feedback === "up" ? thumbsUpSelectedIcon : thumbsUpIcon} alt="" />
              도움이 되었어요
            </StyledFeedbackButton>
            <StyledFeedbackButton
              type="button"
              $selected={feedback === "down"}
              aria-pressed={feedback === "down"}
              onClick={() => toggleFeedback("down")}
            >
              {feedback === "down" ? (
                <StyledWhiteIcon src={thumbsDownIcon} alt="" />
              ) : (
                <img src={thumbsDownIcon} alt="" />
              )}
              결과가 이상해요
            </StyledFeedbackButton>
          </StyledFeedbackRow>
          {feedback && <StyledThanks>소중한 의견 감사합니다</StyledThanks>}
        </StyledFeedback>
      </StyledContent>

      {isBackModalOpen && (
        <ScanBackModal onClose={() => setIsBackModalOpen(false)} onConfirm={() => navigate(-1)} />
      )}
      {isHistoryOpen && (
        <ReportHistorySheet history={result.reportHistory} onClose={() => setIsHistoryOpen(false)} />
      )}
      {isPolicyOpen && <AiPolicySheet onClose={() => setIsPolicyOpen(false)} />}
      {isTalkDetailOpen && (
        <TalkDetailSheet conversations={result.conversations} onClose={() => setIsTalkDetailOpen(false)} />
      )}
    </>
  );
}
