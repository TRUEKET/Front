import { Fragment, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MainButton from "../../components/common/MainButton.jsx";
import ScanConfirmModal from "../../components/scan/ScanConfirmModal.jsx";
import ReportTypeBadge from "../../components/myInfo/ReportTypeBadge.jsx";
import { REPORT_STATUS_LABEL } from "../../components/myInfo/reportTypeStyle.js";
import { TalkBubble, TalkDashedLine, TalkLine } from "../home/scan/ScanTalkParts.jsx";
import TalkCard from "../../components/scan/TalkCard.jsx";
import { StyledFieldError } from "../../components/auth/authStyles.js";
import DisputeHistorySheet from "./DisputeHistorySheet.jsx";
import { decideDispute, getMyReport } from "../../api/myReports.js";
import phoneIcon from "../../assets/icons/detail_phone.svg";
import xAccountIcon from "../../assets/icons/detail_x_account.svg";

const RELATED_INFO_ICONS = {
  phone: phoneIcon,
  x: xAccountIcon,
};

// 유지·삭제 재질문 모달 문구
const CONFIRM_MODALS = {
  keep: {
    message: (
      <>
        이의제기 서류를 꼼꼼히 읽고 결정해주세요.
        <br />이 기록을 유지할까요?
      </>
    ),
    confirmLabel: "유지하기",
  },
  delete: {
    message: (
      <>
        삭제 후에는 되돌릴 수 없습니다.
        <br />
        삭제하시겠습니까?
      </>
    ),
    confirmLabel: "삭제하기",
  },
};

// 헤더 아래 16px 띄우고(피그마 기준 첫 카드 y=84) 카드들을 16px 간격으로 나열
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 16px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 맨 위 계좌 요약 카드 (테두리·그림자 없음)
const StyledSummary = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
`;

const StyledAccountGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledAccount = styled.p`
  color: #191919;
  font-size: 20px;
  font-weight: 600;
`;

// 날짜 · 상태 회색 박스 두 개 (높이는 상태 박스에 맞춤)
const StyledSummaryBoxes = styled.div`
  display: flex;
  gap: 12px;
`;

const StyledSummaryBox = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: ${({ $spread }) => ($spread ? "space-between" : "flex-start")};
  gap: 4px;
  min-width: 0;
  padding: 12px 16px;
  background: #dedbe5;
  border-radius: 10px;
  color: #4e4a57;
`;

const StyledBoxLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
`;

const StyledBoxValue = styled.p`
  font-size: 20px;
  font-weight: 700;
`;

const StyledBoxSub = styled.p`
  font-size: 14px;
  font-weight: 700;
`;

// 흰 배경 + 연보라 테두리 카드 (연관 정보, 주요 대화)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

// 카드 제목 + 부제목
const StyledCardTitleGroup = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  color: #4e4a57;
`;

const StyledCardTitle = styled.p`
  font-size: 16px;
  font-weight: 700;
`;

const StyledCardSub = styled.p`
  font-size: 10px;
  font-weight: 500;
`;

// 연관 정보 한 줄 (높이 36): 아이콘 + 라벨/값
const StyledRelatedRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  height: 36px;
`;

// 아이콘을 담는 회색 박스 (35x35)
const StyledRelatedIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: #dedbe5;
  border-radius: 10px;

  img {
    display: block;
  }
`;

const StyledRelatedTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #191919;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledRelatedLabel = styled.p`
  font-size: 10px;
`;

const StyledRelatedValue = styled.p`
  font-size: 16px;
`;

// 이의제기 안내 박스 + 유지·삭제 버튼
const StyledDispute = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 연보라 이의제기 안내 박스
const StyledDisputeBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #e4deff;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

const StyledDisputeText = styled.p`
  color: #191919;
  font-size: 14px;
  font-weight: 600;
`;

const StyledDisputeNote = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 보라 밑줄 링크 버튼 (이의제기 신청 내역 보기)
const StyledLinkButton = styled.button`
  align-self: flex-start;
  padding: 0;
  border: none;
  border-bottom: 1px solid #5434d6;
  background: none;
  color: #5434d6;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
`;

const StyledActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

// 판독 근거 상세(evidenceDetails)가 없는 예전 신고: 근거 문장만 기존 말풍선 스타일로 (위험도·행동·이유 없음)
// 말풍선 색은 신고 종류에 맞춤 (피해 신고 위험 빨강 / 의심 제보 의심 노랑)
const QUOTE_LEVEL = { report: "danger", suspect: "caution" };

const StyledQuoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 내 신고 세부 정보 (GET /me/reports/{id}, 이의제기 응답 대기면 유지·삭제 결정)
export default function MyReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [decideError, setDecideError] = useState("");
  // 불러오기 전 undefined, 없는 신고(404 등)면 null
  const [report, setReport] = useState(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getMyReport(id, { signal: controller.signal })
      .then(setReport)
      .catch((error) => {
        if (error.name !== "AbortError") setReport(null);
      });
    return () => controller.abort();
  }, [id]);

  if (report === undefined) return <BackHeader label="내 신고 리스트" />;
  // 삭제됐거나 없는 신고면 리스트로
  if (!report) return <Navigate to="/myinfo/reports" replace />;

  const { account, type, status, reason, date, relatedInfo, conversations, quotes, dispute } = report;
  // 사기 의심 정황을 찾은 사진 수 (서버 상세에 전체 사진 수는 없음)
  const flaggedPhotoCount = new Set(conversations.map((talk) => talk.photo)).size;

  // 유지(MAINTAINED)·삭제(DELETED) 결정 → 리스트로. 이미 처리됐거나 기한이 지나면(409) 안내 문구
  const handleConfirm = async () => {
    const choice = confirmType;
    setConfirmType(null);
    setDecideError("");
    try {
      await decideDispute(report, choice);
      navigate("/myinfo/reports", { replace: true });
      // 긴 세부 화면에서 내려온 스크롤이 리스트에 그대로 남지 않도록 맨 위로
      window.scrollTo(0, 0);
    } catch (error) {
      setDecideError(error.message);
    }
  };

  return (
    <>
      <BackHeader label="내 신고 리스트" />
      <StyledContent>
        <StyledSummary>
          <StyledAccountGroup>
            <ReportTypeBadge type={type} />
            {account && <StyledAccount>{account}</StyledAccount>}
          </StyledAccountGroup>
          <StyledSummaryBoxes>
            <StyledSummaryBox $spread>
              <StyledBoxLabel>날짜</StyledBoxLabel>
              <StyledBoxValue>{date}</StyledBoxValue>
            </StyledSummaryBox>
            <StyledSummaryBox>
              <StyledBoxLabel>상태</StyledBoxLabel>
              <StyledBoxValue>{REPORT_STATUS_LABEL[status]}</StyledBoxValue>
              {reason && <StyledBoxSub>: {reason}</StyledBoxSub>}
            </StyledSummaryBox>
          </StyledSummaryBoxes>
        </StyledSummary>

        {relatedInfo.length > 0 && (
          <StyledCard $gap={8}>
            <StyledCardTitleGroup>
              <StyledCardTitle>연관 정보</StyledCardTitle>
              <StyledCardSub>내 판독 결과에 함께 들어있던 정보</StyledCardSub>
            </StyledCardTitleGroup>
            <TalkLine />
            {relatedInfo.map((info, index) => (
              <Fragment key={`${info.type}-${info.value}`}>
                <StyledRelatedRow>
                  <StyledRelatedIcon>
                    <img src={RELATED_INFO_ICONS[info.type]} alt="" />
                  </StyledRelatedIcon>
                  <StyledRelatedTexts>
                    <StyledRelatedLabel>{info.label}</StyledRelatedLabel>
                    <StyledRelatedValue>{info.value}</StyledRelatedValue>
                  </StyledRelatedTexts>
                </StyledRelatedRow>
                {index < relatedInfo.length - 1 ? <TalkDashedLine /> : <TalkLine />}
              </Fragment>
            ))}
          </StyledCard>
        )}

        {conversations.length > 0 && (
          // 판독 캡처 원본은 서버에 저장되지 않아(기능명세) 원본 사진이 나오는 '자세히 보기'는 두지 않음
          <TalkCard conversations={conversations} summary={`사진 ${flaggedPhotoCount}장에서 사기 의심 정황을 찾았어요.`} />
        )}

        {conversations.length === 0 && quotes.length > 0 && (
          <StyledCard $gap={8}>
            <StyledCardTitleGroup>
              <StyledCardTitle>주요 대화</StyledCardTitle>
            </StyledCardTitleGroup>
            <TalkLine />
            <StyledQuoteList>
              {quotes.map((quote) => (
                <TalkBubble key={quote} level={QUOTE_LEVEL[type]}>
                  {quote}
                </TalkBubble>
              ))}
            </StyledQuoteList>
          </StyledCard>
        )}

        {dispute && (
          <StyledDispute>
            <StyledDisputeBox>
              <StyledDisputeText>
                판매자가 이의제기를 신청했어요.
                <br />
                서류를 읽고 유지 혹은 삭제를 결정해주세요.
              </StyledDisputeText>
              <StyledDisputeNote>
                *이의제기 신청 후 3일 내로 결정하지 않을 시, 신고·제보가 비공개처리됩니다.
              </StyledDisputeNote>
              <StyledLinkButton type="button" onClick={() => setIsDisputeOpen(true)}>
                이의제기 신청 내역 보기 →
              </StyledLinkButton>
            </StyledDisputeBox>
            <StyledActions>
              <MainButton variant="outline" type="button" onClick={() => setConfirmType("keep")}>
                유지하기
              </MainButton>
              <MainButton type="button" onClick={() => setConfirmType("delete")}>
                삭제하기
              </MainButton>
            </StyledActions>
            {decideError && <StyledFieldError role="alert">{decideError}</StyledFieldError>}
          </StyledDispute>
        )}
      </StyledContent>

      {isDisputeOpen && <DisputeHistorySheet dispute={dispute} onClose={() => setIsDisputeOpen(false)} />}
      {confirmType && (
        <ScanConfirmModal
          message={CONFIRM_MODALS[confirmType].message}
          confirmLabel={CONFIRM_MODALS[confirmType].confirmLabel}
          onClose={() => setConfirmType(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
