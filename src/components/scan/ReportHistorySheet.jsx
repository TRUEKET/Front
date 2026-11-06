import styled from "styled-components";
import Button from "../common/Button.jsx";
import ScanBottomSheet from "./ScanBottomSheet.jsx";

const StyledTitle = styled.p`
  margin: 0;
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

const StyledHistoryBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #eeebfb;
  border-radius: 20px;
`;

const StyledHistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledTarget = styled.p`
  margin: 0;
  color: #000000;
  font-size: 16px;
  font-weight: 600;
`;

const StyledCounts = styled.div`
  display: flex;
  gap: 8px;
`;

// 건수 칩은 누르는 버튼이 아니라 표시용이라 span으로 렌더링
// 글자 높이를 17px로 고정해 칩 높이 36px에 맞춤
const StyledCountChip = styled(Button)`
  line-height: 17px;
  cursor: default;
`;

// 판독결과의 피해 신고·의심 제보 박스를 누르면 계좌, 전화번호별 이력을 보여주는 바텀시트
export default function ReportHistorySheet({ history, onClose }) {
  return (
    <ScanBottomSheet onClose={onClose}>
      <StyledTitle>피해 신고·의심 제보 이력</StyledTitle>
      <StyledHistoryBox>
        {history.map(({ target, reportCount, suspectCount }) => (
          <StyledHistoryItem key={target}>
            <StyledTarget>{target}</StyledTarget>
            <StyledCounts>
              <StyledCountChip forwardedAs="span" variant="disabled">
                피해 신고 {reportCount}건
              </StyledCountChip>
              <StyledCountChip forwardedAs="span" variant="disabled">
                의심 제보 {suspectCount}건
              </StyledCountChip>
            </StyledCounts>
          </StyledHistoryItem>
        ))}
      </StyledHistoryBox>
    </ScanBottomSheet>
  );
}
