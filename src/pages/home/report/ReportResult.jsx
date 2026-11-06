import { Fragment, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import ScanBox from "../../../components/common/ScanBox.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import Button from "../../../components/common/Button.jsx";
import ReportHistorySheet from "../../../components/scan/ReportHistorySheet.jsx";
import { MOCK_REPORT_RESULTS } from "../../../mock/report.js";
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

// 연동 전에는 ?status=match|mismatch 로 볼 결과를 고름 (없으면 사실 확인 완료)
const DEFAULT_STATUS = "match";

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
export default function ReportResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const result = MOCK_REPORT_RESULTS[searchParams.get("status")] ?? MOCK_REPORT_RESULTS[DEFAULT_STATUS];
  const config = STATUS_CONFIG[result.status];
  const isMatch = result.status === "match";

  // 같은 피드백 버튼을 다시 누르면 선택 해제 (TODO: API 연동 시 선택한 피드백 전송)
  const toggleFeedback = (value) => setFeedback((prev) => (prev === value ? null : value));

  // 사실 확인 완료면 확인된 판매자 정보를 들고 신고 화면으로, 불일치면 자료를 다시 넣으러 돌아감
  const handleAction = () => {
    if (isMatch) {
      navigate("/report/form", { state: { tradeType: result.tradeType, ...result.reportInfo } });
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

        {isMatch && (
          <ScanBox
            status="danger"
            title={`피해 신고·의심 제보 이력 ${result.reportCount}회`}
            account={result.account}
            phone={result.phone}
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
        </StyledBottom>
      </StyledContent>

      {isHistoryOpen && (
        <ReportHistorySheet history={result.reportHistory} onClose={() => setIsHistoryOpen(false)} />
      )}
    </StyledPage>
  );
}
