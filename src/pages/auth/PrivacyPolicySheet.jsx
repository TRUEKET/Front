import styled from "styled-components";
import ScanBottomSheet from "../../components/scan/ScanBottomSheet.jsx";
import { PRIVACY_ITEMS } from "../../mock/auth.js";

const StyledHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledTitle = styled.p`
  color: #000000;
  font-size: 16px;
  font-weight: 700;
`;

const StyledSub = styled.p`
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

// 수집 항목 하나를 담는 연보라 카드
const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #eeebfb;
  border-radius: 20px;
`;

// 왼쪽 설명 + 오른쪽 보관 기간 배지
const StyledRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledInfo = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledCardTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

// $strong: 회원가입 항목처럼 진한 글씨
const StyledDesc = styled.p`
  color: ${({ $strong }) => ($strong ? "#191919" : "#4e4a57")};
  font-size: 12px;
  font-weight: 500;
`;

const StyledRowLabel = styled.p`
  color: #191919;
  font-size: 12px;
  font-weight: 600;
`;

const StyledPurpose = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
`;

// 신고·제보처럼 줄이 여러 개인 경우
const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 검정 보관 기간 배지
const StyledBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 12px;
  background: #191919;
  border-radius: 10px;
  color: #fdfdfd;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
`;

// 동의 거부 안내 (회색 박스)
const StyledNotice = styled.p`
  padding: 12px 16px;
  background: #a9a4b2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: #191919;
  font-size: 14px;
  font-weight: 500;
`;

// 개인정보 수집·이용 동의 바텀시트 (배경 누르면 닫기만, 버튼 누르면 동의 후 닫기)
export default function PrivacyPolicySheet({ onClose, onAgree }) {
  return (
    <ScanBottomSheet onClose={onClose} onButtonClick={onAgree} closeLabel="동의하고 닫기" gap={12}>
      <StyledHead>
        <StyledTitle>개인정보 수집·이용 동의</StyledTitle>
        <StyledSub>트루켓은 필수적 정보만 수집하고, 기간 후 삭제합니다.</StyledSub>
      </StyledHead>

      {PRIVACY_ITEMS.map(({ title, desc, rows, purpose, period }, index) =>
        rows ? (
          <StyledCard key={title}>
            <StyledCardTitle>{title}</StyledCardTitle>
            <StyledRows>
              {rows.map((row) => (
                <StyledRow key={row.label}>
                  <StyledInfo>
                    <StyledRowLabel>{row.label}</StyledRowLabel>
                    <StyledDesc>{row.desc}</StyledDesc>
                  </StyledInfo>
                  <StyledBadge>{row.period}</StyledBadge>
                </StyledRow>
              ))}
            </StyledRows>
            <StyledPurpose>{purpose}</StyledPurpose>
          </StyledCard>
        ) : (
          <StyledCard key={title}>
            <StyledRow>
              <StyledInfo>
                <StyledCardTitle>{title}</StyledCardTitle>
                <StyledDesc $strong={index === 0}>{desc}</StyledDesc>
                <StyledPurpose>{purpose}</StyledPurpose>
              </StyledInfo>
              <StyledBadge>{period}</StyledBadge>
            </StyledRow>
          </StyledCard>
        ),
      )}

      <StyledNotice>
        동의를 거부할 수 있습니다. 거부 시, 회원가입이 불가능하며 신고·제보·트루샷 요청을 진행할 수 없습니다.
      </StyledNotice>
    </ScanBottomSheet>
  );
}
