import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import ScanBox from "../../../components/common/ScanBox.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import Button from "../../../components/common/Button.jsx";
import ReportHistorySheet from "../../../components/scan/ReportHistorySheet.jsx";
import {
  deleteAnalysis,
  findIdentifier,
  getReportTitle,
  sendAnalysisFeedback,
  toStageStatus,
} from "../../../api/analyze.js";
import matchIcon from "../../../assets/icons/dispute_complete_check.svg";
import checkPassIcon from "../../../assets/icons/report_check_small.svg";
import checkFailIcon from "../../../assets/icons/report_x_small.svg";
import thumbsUpIcon from "../../../assets/icons/result_thumbs_up.svg";
import thumbsUpSelectedIcon from "../../../assets/icons/result_thumbs_up_selected.svg";
import thumbsDownIcon from "../../../assets/icons/result_thumbs_down.svg";

// 판독 결과별 제목, 안내 문구, 아래 버튼 (status: match 사실 확인 완료 / mismatch 자료 불일치)
const STATUS_CONFIG = {
  match: {
    headline: "사실 확인 완료",
    sub: "주요 대화와 금전 피해 자료의 일치성을 확인했습니다.",
    actionLabel: "이 정보로 신고하기",
  },
  mismatch: {
    headline: "자료 불일치",
    sub: "아래 항목 확인 후, 자료를 재첨부 해주세요.",
    actionLabel: "자료 다시 넣기",
  },
};

// 서버 거래 유형 → 신고하기 화면의 거래 종류 이름
const TRADE_TYPE_LABELS = {
  TRANSFER: "양도",
  PROXY: "대리티켓팅",
  CANCEL: "취소표 티켓팅",
  AOM: "아이디 옮기기",
  OTHER: "기타",
};

// 판독 응답 + 송금 사진 검증 결과 → 확인 결과 항목
// 모든 항목을 통과해야 사실 확인 완료(match), 하나라도 못 하면 자료 불일치(mismatch)
const toReportResult = ({ result, evidence, tradeType }) => {
  const { assessment, identifiers } = result;
  const detectedType = TRADE_TYPE_LABELS[result.detectedType] ?? TRADE_TYPE_LABELS.OTHER;
  const account = findIdentifier(identifiers, "ACCOUNT");
  const phone = findIdentifier(identifiers, "PHONE");
  const sns = findIdentifier(identifiers, "SNS");
  const sellerValues = [phone, sns].filter(Boolean).join(" · ") || account;

  const checks = [
    // 거래 유형은 신고 가능 여부에 영향이 없어 AI가 판단한 유형을 보여주기만 함
    {
      id: "tradeType",
      passed: true,
      title: "티켓 거래 유형 확인",
      desc: "티켓 거래인지와 해당 유형인지를 파악",
      values: [`티켓 거래 O · ${detectedType}`],
    },
    evidence.verified
      ? {
          id: "account",
          passed: true,
          title: "계좌 일치",
          desc: "송금 내역 속 계좌와 주요 대화 속 계좌 일치",
          values: [account],
        }
      : {
          id: "account",
          passed: false,
          title: "계좌 불일치",
          desc: "송금 내역 속 계좌와 주요 대화 속 계좌 불일치",
          values: account ? [`주요 대화: ${account}`] : [],
          guide: evidence.message,
        },
    identifiers.length > 0
      ? { id: "seller", passed: true, title: "판매자 정보 수집 완료", values: [sellerValues] }
      : {
          id: "seller",
          passed: false,
          title: "판매자 정보 없음",
          values: [],
          guide: "계좌, 전화번호가 보이는 대화를 넣어주세요.",
        },
  ];

  // 대화에서 신고할 근거를 찾지 못하면 서버가 신고를 받지 않음
  if (!assessment.showReportButton) {
    checks.push({
      id: "reportable",
      passed: false,
      title: "사기 정황 확인 불가",
      desc: "대화에서 신고할 수 있는 사기 정황을 찾지 못함",
      values: [],
      guide: "판매자와 나눈 대화가 잘 보이게 넣어주세요.",
    });
  }

  return {
    status: checks.every(({ passed }) => passed) ? "match" : "mismatch",
    tradeType: tradeType ?? detectedType,
    reportStatus: toStageStatus(assessment.reportStage),
    reportTitle: getReportTitle(assessment),
    account,
    phone,
    sns,
    // 신고 이력 시트: 대화에서 찾은 계좌, 전화번호, SNS (판독 응답에 식별자별 인원이 없어 건수는 0건으로 표시)
    reportHistory: identifiers.length > 0
      ? identifiers.map(({ value }) => ({ target: value }))
      : [{ target: "계좌 정보 없음" }, { target: "전화번호 정보 없음" }],
    evidenceToken: evidence.evidenceToken,
    checks,
  };
};

// 화면 높이(#root와 같은 기준)를 꽉 채워서 아래 버튼 영역을 화면 맨 아래로 보낼 수 있게 함
// main에 푸터 자리용 아래 여백 100px이 있어서, 푸터가 없는 이 화면은 -100px로 그 여백을 덮어 스크롤이 생기지 않게 함
const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: max(844px, 100svh);
  margin-bottom: -100px;
`;

// 헤더 아래 내용 전체 세로 배치 (요소 사이 16px, 가운데 정렬, 남은 높이를 모두 차지)
const StyledContent = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

// 맨 위 '거래 종류 - 양도' 칩 (기본 칩 버튼 모양을 누를 수 없는 표시용으로 사용)
const StyledTradeType = styled(Button)`
  cursor: default;
`;

// 사실 확인 완료일 때 쓰는 90px 보라 체크 원 아이콘
const StyledHeroIcon = styled.img`
  display: block;
`;

// 자료 불일치일 때 쓰는 빨간 원 + 느낌표, 빨간빛 그림자를 줌 (느낌표를 원 가운데에 맞추려고 위에 5px 여백)
const StyledDangerCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  padding-top: 5px;
  box-sizing: border-box;
  background: #ca2317;
  border-radius: 99px;
  filter: drop-shadow(0 0 5px rgba(180, 35, 24, 0.2));
  color: #fdfdfd;
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

// 결과 제목 (사실 확인 완료 / 자료 불일치)
const StyledHeadline = styled.p`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
`;

// 결과 제목 아래 안내 문구
const StyledHeadlineSub = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

// 흰 '확인 결과' 카드 (항목 사이 12px)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
  text-align: left;
`;

// '확인 결과' 카드 제목
const StyledCardTitle = styled.p`
  margin: 0;
  color: #191919;
  font-size: 16px;
  font-weight: 600;
`;

// 카드 항목 사이 구분선 (Figma에서 높이 0이라 위아래 -0.5px로 자리를 차지하지 않게 함)
const StyledLine = styled.hr`
  width: 100%;
  height: 1px;
  margin: -0.5px 0;
  border: none;
  background: #dedbe5;
`;

// 확인 결과 한 줄 (왼쪽 35px 체크/엑스 아이콘 + 오른쪽 글자)
// Figma에서 사실 확인 완료는 아이콘을 세로 가운데, 자료 불일치는 위쪽에 맞춰서 $align으로 나눔
const StyledCheckItem = styled.div`
  display: flex;
  gap: 16px;
  align-items: ${({ $align }) => $align};

  > img {
    display: block;
    flex-shrink: 0;
  }
`;

// 항목 오른쪽 글자 묶음 (제목 묶음, 확인된 값, 안내 칩 사이 8px)
const StyledCheckTexts = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
`;

// 항목 제목 + 설명을 간격 없이 묶음
const StyledCheckHead = styled.div`
  display: flex;
  flex-direction: column;
`;

// 항목 제목 (예: 계좌 일치)
const StyledCheckTitle = styled.p`
  margin: 0;
  color: #191919;
  font-size: 16px;
  font-weight: 600;
`;

// 항목 제목 아래 무엇을 확인했는지 설명
const StyledCheckDesc = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 확인된 값 (여러 줄이면 줄마다 하나씩)
const StyledCheckValue = styled.p`
  margin: 0;
  color: #191919;
  font-size: 12px;
  font-weight: 600;
`;

// 통과 못 한 항목 아래 연보라 안내 칩 (예: 송금한 계좌가 보이는 자료를 넣어주세요.)
const StyledGuide = styled.p`
  margin: 0;
  padding: 8px 12px;
  background: #e4deff;
  border-radius: 20px;
  color: #261760;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

// 아래 버튼, 안내 문구, 피드백 묶음 (남은 공간 아래쪽으로 밀어냄)
const StyledBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
  margin-top: auto;
`;

// 메인 버튼 + AI 안내 문구 묶음 (사이 8px)
const StyledActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

// AI 결과는 참고용이라는 가운데 정렬 10px 안내 문구
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

// 신고하기 흐름에서 대화와 금전 피해 자료가 맞는지 판독한 결과 화면
// 로딩 화면에서 판독 응답(state.result)과 송금 사진 검증 결과(state.evidence)를 받아서 보여줌
export default function ReportResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const analyzeId = state?.result?.analyzeId;

  const [feedback, setFeedback] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackSending, setIsFeedbackSending] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const result = useMemo(() => (state?.result && state?.evidence ? toReportResult(state) : null), [state]);

  // 화면을 떠날 때 서버의 판독 결과 삭제 (신고하러 가는 경우는 신고에 필요해서 남겨 둠)
  // 개발 모드(StrictMode)는 마운트 직후 정리를 한 번 더 실행하므로, 실제로 떠날 때만 실행되도록 한 박자 미룸
  const keepAnalysisRef = useRef(false);
  const leaveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(leaveTimerRef.current);
    return () => {
      leaveTimerRef.current = setTimeout(() => {
        if (analyzeId && !keepAnalysisRef.current) deleteAnalysis(analyzeId).catch(() => {});
      }, 0);
    };
  }, [analyzeId]);

  // 새로고침, 주소 직접 입력처럼 판독 응답 없이 들어오면 신고하기 화면으로 보냄
  if (!result) return <Navigate to="/report" replace />;

  const config = STATUS_CONFIG[result.status];
  const isMatch = result.status === "match";

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

  // 사실 확인 완료면 확인된 판매자 정보와 송금 증빙 토큰을 들고 신고 화면으로, 불일치면 자료를 다시 넣으러 돌아감
  const handleAction = () => {
    if (isMatch) {
      keepAnalysisRef.current = true;
      navigate("/report/form", {
        state: {
          analyzeId,
          evidenceToken: result.evidenceToken,
          tradeType: result.tradeType,
          account: result.account,
          phone: result.phone,
          sns: result.sns,
        },
      });
      return;
    }
    navigate(-1);
  };

  return (
    <StyledPage>
      <BackHeader label="뒤로 가기" />
      <StyledContent>
        {isMatch && <StyledTradeType forwardedAs="span">거래 종류 - {result.tradeType}</StyledTradeType>}

        {isMatch ? <StyledHeroIcon src={matchIcon} alt="" /> : <StyledDangerCircle>!</StyledDangerCircle>}

        <StyledHeadlineGroup>
          <StyledHeadline>{config.headline}</StyledHeadline>
          <StyledHeadlineSub>{config.sub}</StyledHeadlineSub>
        </StyledHeadlineGroup>

        {/* 박스를 누르면 계좌, 전화번호별 신고 이력 시트를 띄움 */}
        {isMatch && (
          <ScanBox
            status={result.reportStatus}
            title={result.reportTitle}
            account={result.account || "계좌 정보 없음"}
            phone={result.phone || "전화번호 정보 없음"}
            onClick={() => setIsHistoryOpen(true)}
          />
        )}

        <StyledCard>
          <StyledCardTitle>확인 결과</StyledCardTitle>
          {result.checks.map((check) => (
            <Fragment key={check.id}>
              <StyledLine />
              <StyledCheckItem $align={isMatch ? "center" : "flex-start"}>
                <img src={check.passed ? checkPassIcon : checkFailIcon} alt={check.passed ? "통과" : "불일치"} />
                <StyledCheckTexts>
                  <StyledCheckHead>
                    <StyledCheckTitle>{check.title}</StyledCheckTitle>
                    {check.desc && <StyledCheckDesc>{check.desc}</StyledCheckDesc>}
                  </StyledCheckHead>
                  <div>
                    {check.values.map((value) => (
                      <StyledCheckValue key={value}>{value}</StyledCheckValue>
                    ))}
                  </div>
                  {check.guide && <StyledGuide>{check.guide}</StyledGuide>}
                </StyledCheckTexts>
              </StyledCheckItem>
            </Fragment>
          ))}
        </StyledCard>

        <StyledBottom>
          <StyledActionGroup>
            <MainButton variant="accent" type="button" onClick={handleAction}>
              {config.actionLabel}
            </MainButton>
            <StyledDisclaimer>
              이 식별 결과는 AI 모델과 트루켓의 자체 데이터베이스를 기반으로 자동 생성된 정보이며,
              <br />
              별도로 검토하거나 검증하지 않았습니다. 따라서 참고용으로만 활용해주시기 바랍니다.
            </StyledDisclaimer>
          </StyledActionGroup>
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
        </StyledBottom>
      </StyledContent>
      {isHistoryOpen && <ReportHistorySheet history={result.reportHistory} onClose={() => setIsHistoryOpen(false)} />}
    </StyledPage>
  );
}
