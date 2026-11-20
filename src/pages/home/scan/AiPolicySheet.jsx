import styled from "styled-components";
import sparkleIcon from "../../../assets/icons/result_sparkle.svg";
import ScanBottomSheet from "../../../components/scan/ScanBottomSheet.jsx";

// AI가 무엇을 근거로 판단하는지 (번호 순서대로 보여줌)
const POLICY_SOURCES = [
  {
    title: "첨부 사진",
    lines: [
      "첨부된 사진 속에서 사기 의심 수법 6가지(로그인 정보 요구, 수상한 송금 요구, 확인 회피, 판단 재촉, 불리한 조건, 정보 불일치)에 비춰 판단",
    ],
  },
  {
    title: "신고 리스트",
    lines: ["첨부한 사진 속 정보와 트루켓 리스트의 정보를 대조 판단"],
  },
  {
    title: "외부 사례",
    lines: ["기사 등을 통해 확인된 수법과 비교 판단", "6가지 판단 기준 수집 근거"],
  },
];

// 판독 단계별 기준 (위험 / 의심 / 안전)
const STAGE_RULES = [
  { label: "위험", bg: "#ffdfdf", color: "#a81e14", rule: "강한 기준 1개 이상 or 주의 기준 3개 이상" },
  { label: "의심", bg: "#fff4dd", color: "#bf7100", rule: "주의 기준 1개 이상" },
  { label: "안전", bg: "#d6f7e3", color: "#1d6b43", rule: "그 외" },
];

const StyledTitle = styled.div`
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

const StyledBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
  padding: 12px 16px;
  background: #eeebfb;
  border-radius: 20px;
  color: #191919;
`;

const StyledSource = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// "1. 첨부 사진"처럼 번호가 붙는 제목 (번호는 왼쪽 24px 안쪽에 표시)
const StyledSourceTitle = styled.ol`
  margin: 0;
  padding-left: 24px;
  font-size: 16px;
  font-weight: 600;
`;

const StyledSourceDesc = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
`;

const StyledBoxTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const StyledRules = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const StyledRule = styled.li`
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledStageBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 8px;
  background: ${({ $bg }) => $bg};
  border-radius: 5px;
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
`;

const StyledReportRule = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledReportRuleDesc = styled.p`
  margin: 0;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

// AI가 확인한 것 카드의 i 아이콘을 누르면 판단 근거와 판독 단계 기준을 보여주는 바텀시트
export default function AiPolicySheet({ onClose }) {
  return (
    <ScanBottomSheet onClose={onClose}>
      <StyledTitle>
        <img src={sparkleIcon} alt="" />
        AI 판단 정책
      </StyledTitle>

      <StyledBox $gap={12}>
        {POLICY_SOURCES.map(({ title, lines }, index) => (
          <StyledSource key={title}>
            <StyledSourceTitle start={index + 1}>
              <li>{title}</li>
            </StyledSourceTitle>
            <StyledSourceDesc>
              {lines.map((line, lineIndex) => (
                <span key={line}>
                  {lineIndex > 0 && <br />}
                  {line}
                </span>
              ))}
            </StyledSourceDesc>
          </StyledSource>
        ))}
      </StyledBox>

      <StyledBox $gap={8}>
        <StyledBoxTitle>판독 단계 설정 로직</StyledBoxTitle>
        <StyledRules>
          {STAGE_RULES.map(({ label, bg, color, rule }) => (
            <StyledRule key={label}>
              <StyledStageBadge $bg={bg} $color={color}>
                {label}
              </StyledStageBadge>
              {rule}
            </StyledRule>
          ))}
        </StyledRules>
        <StyledReportRule>
          <StyledBoxTitle>신고리스트</StyledBoxTitle>
          <StyledReportRuleDesc>
            실제 피해 신고가 1건이라도 있으면 위험, 의심 제보가 2명 이상이면 의심입니다.
            <br />
            사진과 신고 리스트 중 더 강한 판독 결과로 노출합니다.
          </StyledReportRuleDesc>
        </StyledReportRule>
      </StyledBox>
    </ScanBottomSheet>
  );
}
