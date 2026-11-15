import styled from "styled-components";
import personIcon from "../../assets/icons/box_scan_person.svg";
import personIconCaution from "../../assets/icons/box_scan_person_caution.svg";
import personIconDanger from "../../assets/icons/box_scan_person_danger.svg";
import chevronIcon from "../../assets/icons/box_chevron_right.svg";

// 상태별 배경·아이콘·제목 색 (status: safe 기본 / caution 의심 / danger 위험)
const STATUS_CONFIG = {
  safe: { bg: "#fdfdfd", titleColor: "#191919", icon: personIcon },
  caution: { bg: "#fff4dd", titleColor: "#bf7100", icon: personIconCaution },
  danger: { bg: "#ffdfdf", titleColor: "#a81e14", icon: personIconDanger },
};

// 전체 박스: 아이콘 + 제목/계좌/전화번호, 오른쪽에 자세히 보기
const StyledScanBox = styled.button`
  --title-color: ${({ $titleColor }) => $titleColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  height: 84px;
  box-sizing: border-box;
  padding: 12px 16px;
  background: ${({ $bg }) => $bg};
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  font-family: "esamanru", sans-serif;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #a9a4b2;
    border-color: transparent;
    --title-color: #4e4a57;
  }
`;

const StyledInfo = styled.div`
  display: flex;
  flex: 1 0 0;
  gap: 16px;
  align-items: center;
  min-width: 0;
`;

const StyledIcon = styled.img`
  flex-shrink: 0;
  display: block;
`;

const StyledTexts = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
`;

const StyledTitle = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: var(--title-color);
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledAccount = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: #4e4a57;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledPhone = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledMore = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4e4a57;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
`;

// 화살표는 왼쪽을 가리키는 원본 SVG를 좌우 반전해 오른쪽으로 사용
const StyledChevron = styled(StyledIcon)`
  transform: scaleX(-1);
`;

// 계좌 조회·판독 결과를 보여주는 박스 (status별로 색이 바뀜)
export default function ScanBox({ status = "safe", title, account, phone, ...props }) {
  const { bg, titleColor, icon } = STATUS_CONFIG[status];

  return (
    <StyledScanBox type="button" $bg={bg} $titleColor={titleColor} {...props}>
      <StyledInfo>
        <StyledIcon src={icon} alt="" />
        <StyledTexts>
          <StyledTitle>{title}</StyledTitle>
          <StyledAccount>{account}</StyledAccount>
          <StyledPhone>{phone}</StyledPhone>
        </StyledTexts>
      </StyledInfo>
      <StyledMore>
        자세히 보기
        <StyledChevron src={chevronIcon} alt="" />
      </StyledMore>
    </StyledScanBox>
  );
}
