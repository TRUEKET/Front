import styled from "styled-components";
import chevronIcon from "../../assets/icons/box_search_chevron.svg";
import ReportTypeBadge from "./ReportTypeBadge.jsx";
import { REPORT_STATUS_LABEL, REPORT_TYPE_STYLE } from "./reportTypeStyle.js";

// 흰 카드 (신고 종류에 따라 테두리 색), 누르면 세부 정보로 이동
const StyledItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid ${({ $type }) => REPORT_TYPE_STYLE[$type].border};
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
  cursor: pointer;

  > img {
    display: block;
    flex-shrink: 0;
  }
`;

const StyledInfo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 계좌 + 종류 배지
const StyledTop = styled.span`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledAccount = styled.span`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
`;

// 상태 + 값 + (사유)
const StyledStatus = styled.span`
  display: flex;
  gap: 4px;
  align-items: center;
  color: #191919;
  white-space: nowrap;
`;

const StyledStatusLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const StyledStatusValue = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const StyledReason = styled.span`
  font-size: 10px;
  font-weight: 500;
`;

const StyledDate = styled.span`
  color: #a9a4b2;
  font-size: 12px;
  font-weight: 500;
`;

// 내 신고 리스트 한 줄 (목록 응답에 계좌가 없으면 계좌 없이 종류 배지만)
export default function MyReportItem({ report, onClick }) {
  const { account, type, status, reason, date } = report;

  return (
    <StyledItem type="button" $type={type} onClick={onClick}>
      <StyledInfo>
        <StyledTop>
          {account && <StyledAccount>{account}</StyledAccount>}
          <ReportTypeBadge type={type} />
        </StyledTop>
        <StyledStatus>
          <StyledStatusLabel>상태</StyledStatusLabel>
          <StyledStatusValue>{REPORT_STATUS_LABEL[status]}</StyledStatusValue>
          {reason && <StyledReason>({reason})</StyledReason>}
        </StyledStatus>
        <StyledDate>{date}</StyledDate>
      </StyledInfo>
      <img src={chevronIcon} alt="" />
    </StyledItem>
  );
}
