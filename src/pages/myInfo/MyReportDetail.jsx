import { Fragment, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MainButton from "../../components/common/MainButton.jsx";
import ScanConfirmModal from "../../components/scan/ScanConfirmModal.jsx";
import ReportTypeBadge from "../../components/myInfo/ReportTypeBadge.jsx";
import { REPORT_STATUS_LABEL } from "../../components/myInfo/reportTypeStyle.js";
import TalkDetailSheet from "../home/scan/TalkDetailSheet.jsx";
import { TalkDashedLine, TalkLine } from "../home/scan/ScanTalkParts.jsx";
import TalkCard from "../../components/scan/TalkCard.jsx";
import DisputeHistorySheet from "./DisputeHistorySheet.jsx";
import { deleteReport, getMyReport, keepReport } from "../../api/myReports.js";
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

// 내 신고 세부 정보 (이의제기 대기 / 명의 도용 판정 / 게시 중)
export default function MyReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTalkDetailOpen, setIsTalkDetailOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);

  const report = getMyReport(id);
  // 삭제됐거나 없는 신고면 리스트로
  if (!report) return <Navigate to="/myinfo/reports" replace />;

  const { account, type, status, reason, date, relatedInfo, photoCount, conversations, dispute } = report;

  const handleConfirm = () => {
    if (confirmType === "keep") keepReport(id);
    else deleteReport(id);
    navigate("/myinfo/reports", { replace: true });
    // 긴 세부 화면에서 내려온 스크롤이 리스트에 그대로 남지 않도록 맨 위로
    window.scrollTo(0, 0);
  };

  return (
    <>
      <BackHeader label="내 신고 리스트" />
      <StyledContent>
        <StyledSummary>
          <StyledAccountGroup>
            <ReportTypeBadge type={type} />
            <StyledAccount>{account}</StyledAccount>
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

        <StyledCard $gap={8}>
          <StyledCardTitleGroup>
            <StyledCardTitle>연관 정보</StyledCardTitle>
            <StyledCardSub>내 판독 결과에 함께 들어있던 정보</StyledCardSub>
          </StyledCardTitleGroup>
          <TalkLine />
          {relatedInfo.map((info, index) => (
            <Fragment key={info.label}>
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

        <TalkCard
          conversations={conversations}
          summary={`사진 ${photoCount}장 중 ${conversations.length}장에서 사기 의심 정황을 찾았어요.`}
          onMore={() => setIsTalkDetailOpen(true)}
        />

        {dispute?.kind === "pending" && (
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
          </StyledDispute>
        )}

        {dispute?.kind === "identityTheft" && (
          <StyledDisputeBox>
            <StyledDisputeText>
              판매자가 명의 도용 이의제기를 신청했어요.
              <br />
              사실 관계에 따라 비공개 처리되었어요.
            </StyledDisputeText>
            <StyledDisputeNote>*명의 도용의 경우, 계좌 주인은 가해자가 아닌 피해자일 수 있어요.</StyledDisputeNote>
          </StyledDisputeBox>
        )}
      </StyledContent>

      {isTalkDetailOpen && (
        <TalkDetailSheet conversations={conversations} onClose={() => setIsTalkDetailOpen(false)} />
      )}
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
