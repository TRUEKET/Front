import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import AccountSummaryCard from "../../../components/common/AccountSummaryCard.jsx";
import { getDisputeAvailability } from "../../../api/dispute.js";
import mailIcon from "../../../assets/icons/dispute_mail.svg";
import alertIcon from "../../../assets/icons/dispute_alert.svg";

// 처리 중이라 신청할 수 없을 때 안내 문구 (새 신고가 없을 때는 안내 박스로 따로 보여줌)
const PROCESSING_MESSAGE = "이미 처리 중인 이의제기가 있습니다.";

// 가능 여부 조회 실패 문구 (400은 서버 문구가 "잘못된 요청 값입니다."라 바꿔서 안내)
const getAvailabilityErrorMessage = (error) =>
  error.status === 400 ? "계좌 정보를 확인할 수 없습니다. 다시 조회해 주세요." : error.message;

// 서버에 묻기 전에 걸러지는 경우 (원본 값이 없거나, 은행 계좌가 아님)
const getPrecheckMessage = (state) => {
  if (!state?.identifier) return "검색 화면에서 계좌를 다시 조회해 주세요.";
  if (state.identifierType !== "ACCOUNT") return "현재는 은행 계좌 이의제기만 지원합니다.";
  return "";
};

// 안내 카드 + 계좌 카드를 세로로 나열, Figma 글자 행간이 자동(normal)이라 line-height:normal로 맞춤 (계좌 카드 높이 155)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  line-height: normal;
`;

const StyledTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
`;

// 푸터 자리에 고정되는 시작하기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
const StyledBottomAction = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 이의제기를 신청할 수 없을 때 안내 카드 아래 보이는 문구 (증빙 화면의 오류 문구와 같은 모양)
const StyledNotice = styled.p`
  margin: 0;
  color: #a81e14;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
`;

const StyledTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  width: 100%;
`;

const StyledGuideCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
`;

const StyledGuideTitle = styled.p`
  margin: 0;
  width: 100%;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
`;

const StyledGuideStep = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
`;

const StyledGuideNumber = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  background: #5434d6;
  border-radius: 50%;
  color: #fdfdfd;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

// 단계 제목 + 설명 ($tight: 첫 단계는 제목과 설명 사이 간격 없음)
const StyledGuideTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ $tight }) => ($tight ? "0" : "2px")};
  align-items: flex-start;
  min-width: 0;
  text-align: left;
`;

const StyledGuideHeadline = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
`;

const StyledGuideDetail = styled.div`
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 400;
`;

const StyledGuideList = styled.ul`
  margin: 0;
  padding-left: 15px;
`;

// 보라 점선 안내 박스 ($filled: 전달될 기록 박스는 연보라 배경, 안내 박스는 흰 배경)
const StyledRecordBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: ${({ $filled }) => ($filled ? "#eeebfb" : "#fdfdfd")};
  border: 1px dashed #5434d6;
  border-radius: 16px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  text-align: left;
`;

// 박스 왼쪽 묶음 (제목 줄 + 설명 줄, 사이 8px)
const StyledRecordTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
`;

// 아이콘(18px) + 진보라 제목 ($bold: 전달될 기록 박스 제목은 Bold, 안내 박스 제목은 SemiBold)
const StyledRecordTitle = styled.p`
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0;
  color: #3f27a1;
  font-size: 14px;
  font-weight: ${({ $bold }) => ($bold ? 700 : 600)};
  line-height: 1.45;

  img {
    display: block;
    flex-shrink: 0;
  }
`;

// 제목 아래 설명 줄 묶음 (줄 사이 4px)
const StyledRecordLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #4e4a57;
`;

// 설명 큰 줄 (12px Medium)
const StyledRecordLine = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
`;

// 설명 작은 줄 (10px Regular)
const StyledRecordSubLine = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 400;
`;

// 박스 오른쪽 전달될 기록 수 (예: 4건)
const StyledRecordCount = styled.p`
  flex-shrink: 0;
  margin: 0;
  color: #4b33cf;
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
`;

// 계좌를 조회한 뒤 이의제기를 시작하기 전 보여주는 안내 화면
export default function Dispute() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const identifier = state?.identifier ?? "";
  const precheckMessage = getPrecheckMessage(state);

  // 어떤 값의 결과인지 같이 저장 (원본 값과 다르면 아직 확인 중)
  // status: AVAILABLE, NEW_REPORTS_ONLY(신청 가능) / PROCESSING, NO_NEW_REPORTS(신청 불가) / null(조회 실패)
  const [availability, setAvailability] = useState({
    identifier: null,
    status: null,
    canApply: false,
    targetReportCount: 0,
    message: "",
  });

  useEffect(() => {
    if (precheckMessage) return undefined;

    const controller = new AbortController();
    getDisputeAvailability(identifier, { signal: controller.signal })
      .then(({ status, canApply, targetReportCount }) =>
        setAvailability({
          identifier,
          status,
          canApply,
          targetReportCount: targetReportCount ?? 0,
          message: status === "PROCESSING" ? PROCESSING_MESSAGE : "",
        }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setAvailability({
          identifier,
          status: null,
          canApply: false,
          targetReportCount: 0,
          message: getAvailabilityErrorMessage(error),
        });
      });
    return () => controller.abort();
  }, [identifier, precheckMessage]);

  const isChecking = !precheckMessage && availability.identifier !== identifier;
  const status = precheckMessage || isChecking ? null : availability.status;
  const notice = precheckMessage || (isChecking ? "" : availability.message);
  const canStart = !precheckMessage && !isChecking && availability.canApply;
  const hasNoNewReports = status === "NO_NEW_REPORTS";

  // 전달될 기록 수 = 게시자 수 (신고·제보 하나당 게시자 한 명)
  const targetCount = availability.targetReportCount;
  // 이미 이의제기된 건 = 이 계좌의 전체 신고·제보 수 - 이번에 전달될 수 (조회 화면에서 넘어온 값으로 계산)
  const alreadyCount =
    typeof state?.totalReportCount === "number" ? Math.max(state.totalReportCount - targetCount, 0) : 0;

  return (
    <>
      <BackHeader label="뒤로 가기" />
      <StyledContent>
        <StyledTitle>이의신청</StyledTitle>
        <StyledTop>
          <AccountSummaryCard
            status={state?.status}
            account={state?.account}
            reportCount={state?.reportCount}
            suspectCount={state?.suspectCount}
          />

          {/* 예전에 이의제기한 기록이 있으면 새 기록에만 전달된다는 안내를 먼저 보여줌 */}
          {status === "NEW_REPORTS_ONLY" && (
            <StyledRecordBox>
              <StyledRecordTexts>
                <StyledRecordTitle>
                  <img src={alertIcon} alt="" />
                  새로 생긴 기록에만 이의제기됩니다.
                </StyledRecordTitle>
                <StyledRecordLines>
                  <StyledRecordLine>이전에 이의제기를 진행한 기록에는 다시 전달되지 않습니다.</StyledRecordLine>
                </StyledRecordLines>
              </StyledRecordTexts>
            </StyledRecordBox>
          )}

          {/* 신청 가능하면 이의제기가 전달될 기록 수를 보여줌 */}
          {(status === "AVAILABLE" || status === "NEW_REPORTS_ONLY") && (
            <StyledRecordBox $filled>
              <StyledRecordTexts>
                <StyledRecordTitle $bold>
                  <img src={mailIcon} alt="" />
                  이의제기가 전달될 기록
                </StyledRecordTitle>
                {status === "AVAILABLE" ? (
                  <StyledRecordLines>
                    <StyledRecordLine>게시자 {targetCount}명이 각자 자기 기록을 판단합니다.</StyledRecordLine>
                    <StyledRecordSubLine>이미 이의제기된 건이 존재하지 않습니다.</StyledRecordSubLine>
                  </StyledRecordLines>
                ) : (
                  <StyledRecordLines>
                    <StyledRecordLine>기신청 후 새로 발생한 신고·제보입니다.</StyledRecordLine>
                    {alreadyCount > 0 && (
                      <StyledRecordSubLine>이미 이의제기된 건이 {alreadyCount}건 존재합니다</StyledRecordSubLine>
                    )}
                  </StyledRecordLines>
                )}
              </StyledRecordTexts>
              <StyledRecordCount>{targetCount}건</StyledRecordCount>
            </StyledRecordBox>
          )}

          {/* 새로 이의제기할 기록이 없으면 안내 박스만 보여주고 설명사항은 숨김 */}
          {hasNoNewReports && (
            <StyledRecordBox>
              <StyledRecordTexts>
                <StyledRecordTitle>
                  <img src={alertIcon} alt="" />
                  이의제기를 할 새 신고·제보가 없습니다.
                </StyledRecordTitle>
                <StyledRecordLines>
                  <StyledRecordLine>
                    이 정보의 신고·제보는 모두 이의제기를 받았습니다.
                    <br />
                    신고·제보 기록은 등록일부터 1년 뒤 자동 폐기됩니다.
                  </StyledRecordLine>
                </StyledRecordLines>
              </StyledRecordTexts>
            </StyledRecordBox>
          )}

          {!hasNoNewReports && (
            <StyledGuideCard>
              <StyledGuideTitle>이의제기 설명사항</StyledGuideTitle>

              <StyledGuideStep>
                <StyledGuideNumber>1</StyledGuideNumber>
                <StyledGuideTexts $tight>
                  <StyledGuideHeadline>이 계좌의 주인만 신청 가능합니다.</StyledGuideHeadline>
                  <StyledGuideDetail>계좌번호가 보이는 증빙이 필요합니다.</StyledGuideDetail>
                </StyledGuideTexts>
              </StyledGuideStep>

              <StyledGuideStep>
                <StyledGuideNumber>2</StyledGuideNumber>
                <StyledGuideTexts>
                  <StyledGuideHeadline>게시자가 증빙을 보고 직접 판단합니다.</StyledGuideHeadline>
                  <StyledGuideDetail>
                    이의제기를 완료하면 게시자가 3일 내로 유지·삭제를 결정합니다.
                    <StyledGuideList>
                      <li>3일 내 미결정 시, 결정하기 전까지 비공개처리됩니다.</li>
                      <li>명의 도용 사유는 트루켓 증빙팀에서 처리합니다.</li>
                    </StyledGuideList>
                  </StyledGuideDetail>
                </StyledGuideTexts>
              </StyledGuideStep>

              <StyledGuideStep>
                <StyledGuideNumber>3</StyledGuideNumber>
                <StyledGuideTexts>
                  <StyledGuideHeadline>판단 기간 동안은, 게시 중 처리됩니다.</StyledGuideHeadline>
                  <StyledGuideDetail>진행 과정은 메일로 전달드립니다.</StyledGuideDetail>
                </StyledGuideTexts>
              </StyledGuideStep>

              <StyledGuideStep>
                <StyledGuideNumber>4</StyledGuideNumber>
                <StyledGuideTexts>
                  <StyledGuideHeadline>기록 한 건에는 한 번만 이의제기가 가능합니다.</StyledGuideHeadline>
                  <StyledGuideDetail>
                    이미 이의제기된 신고·제보에는 다시 전달되지 않습니다.
                    <br />
                    새로 생긴 기록이 있을 때만 다시 신청 가능합니다.
                  </StyledGuideDetail>
                </StyledGuideTexts>
              </StyledGuideStep>
            </StyledGuideCard>
          )}
          {notice && <StyledNotice>{notice}</StyledNotice>}
        </StyledTop>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="accent" disabled={!canStart} onClick={() => navigate("/search/dispute/reason", { state })}>
          {hasNoNewReports ? "신청할 수 있는 건이 없습니다" : "시작하기"}
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
